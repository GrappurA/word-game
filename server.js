const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const app = express()
    const server = http.createServer(app)

    const io = new Server(server)

    async function getUserIds(data) {
        const inRoom = await io.in(data.roomId).fetchSockets()
        const userIds = inRoom.map(user => { return user.id })
        return userIds;
    }

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        //socket.emit('connect_user', { message: `Welcome ${socket.id} to Next.js!` });

        socket.on('join-room', async (data) => {
            socket.join(data.roomId)

            const userIds = await getUserIds(data)

            console.log(`user ${socket.id} connected to room:${data.roomId}`)
            io.to(data.roomId).emit('join-room', { /*userId: socket.id, roomId: data.roomId,*/ userIds: userIds })
        })

        socket.on('leave-room-client', async (data) => {
            socket.leave(data.roomId)
            const userIds = await getUserIds(data)
            console.log(`user left room ${socket.id} | ${userIds.length}`)
            io.to(data.roomId).emit('leave-room-server', { userIds: userIds })
        })

        socket.on('get-others-client', async (data) => {
            console.log("get others request " + socket.id)

            const userIds = await getUserIds(data)
            console.log(userIds)

            socket.emit('get-others-server', { userIds: userIds })
        })

        socket.on('disconnecting', () => {
            for (const room of socket.rooms) {
                if (room != socket.id) {
                    io.to(room).emit('someone-left-room')
                    console.log("socket disconnection" + room)
                }
            }
            console.log(`User disconnected: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    })

    app.use((req, res) => handle(req, res));

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('Ready on http://localhost:3000');
    });

})