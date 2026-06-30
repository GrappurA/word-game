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

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        //socket.emit('connect_user', { message: `Welcome ${socket.id} to Next.js!` });

        socket.on('join-room', (data) => {
            socket.join(data.roomId)
            console.log(`user ${socket.id} connected to room:${data.roomId}`)
            io.to(data.roomId).emit('join-room', { userId: socket.id, roomId: data.roomId })
        })

        socket.on('get-others', (data) => {
            console.log(io.in(data.roomId).)
            //io.to(socket.id).emit('get-others', { others.})
        })

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