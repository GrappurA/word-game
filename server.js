import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import next from 'next';

import images from './public/images/images.js'; // You MUST add .js

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const app = express()
    const server = http.createServer(app)

    const io = new Server(server)
    const userAvatars = {}

    async function getUserIds(data) {
        const inRoom = await io.in(data.roomId).fetchSockets()
        const userIds = inRoom.map(user => { return { id: user.id, imageIndex: userAvatars[user.id] } })
        return userIds;
    }

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        //rand index for an avatar
        const randomIndex = Math.floor(Math.random() * images.length)

        //set the index for an avatar
        userAvatars[socket.id] = randomIndex

        socket.on('join-room', async (data) => {
            socket.join(data.roomId)

            const users = await getUserIds(data)

            console.log(`user ${socket.id} connected to room:${data.roomId}`)
            io.to(data.roomId).emit('join-room', { users: users })
        })

        socket.on('leave-room-client', async (data) => {
            socket.leave(data.roomId)
            const userIds = await getUserIds(data)
            console.log(`user left room ${socket.id} | ${userIds.length}`)
            io.to(data.roomId).emit('leave-room-server', { userIds: userIds })
        })

        socket.on('get-others-client', async (data) => {
            console.log("get others request " + socket.id)

            const users = await getUserIds(data)
            socket.emit('get-others-server', { users: users })
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