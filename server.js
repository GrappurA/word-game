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
    const userData = {}
    const roomVotes = {}
    const roomObject = {}

    async function getUsersInRoom(data) {
        const inRoom = await io.in(data.roomId).fetchSockets()
        const userIds = inRoom.map(user => { return { id: user.id, username: data.username || "Anon", imageIndex: userData[user.id] || "1" } })
        return userIds;
    }

    function pickRandomTopic(topics) {
        return topics[Math.floor(Math.random() * topics.length)]
    }

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        //rand index for an avatar
        const randomIndex = Math.floor(Math.random() * images.length)

        //set the index for an avatar

        socket.on('join-room-client', async (data) => {
            const { username, roomId } = data
            socket.join(roomId)

            userData[socket.id] = {
                imageIndex: randomIndex,
                username: username
            }
            const users = await getUsersInRoom(data)

            console.log(`user ${username} |${socket.id}| connected to room:${roomId}`)
            io.to(roomId).emit('join-room-server', { users: users })
        })

        socket.on('leave-room-client', async (data) => {
            socket.leave(data.roomId)
            const userIds = await getUsersInRoom(data)

            console.log(`user left room ${socket.id} | ${userIds.length}`)

            if (roomVotes[data.roomId]) {
                roomVotes[data.roomId].delete(socket.id)

            }
            io.to(data.roomId).emit('leave-room-server', { userIds: userIds })
        })

        socket.on('get-others-client', async (data) => {
            console.log("get others request " + socket.id)

            const users = await getUsersInRoom(data)
            socket.emit('get-others-server', { users: users })
        })

        socket.on('user-voted-client', async (data) => {
            const { roomId, topic } = data

            //create new set 
            if (!roomVotes[roomId]) {
                roomVotes[roomId] = new Set();
            }

            //update topic in room obj
            if (!roomObject[roomId])
                roomObject[roomId] = { isStarted: false, topics: [] }
            roomObject[roomId].topics.push(topic)



            //add users
            roomVotes[roomId].add(socket.id)
            //convert to array
            let votesInRoom = Array.from(roomVotes[roomId])
            //tell the room about voters
            io.to(roomId).emit('user-voted-server', { userIds: votesInRoom })

            console.log(`user ${socket.id} voted to start the game!`)

            const inRoom = await io.in(roomId).fetchSockets()

            if (inRoom.length > 1 && votesInRoom.length === inRoom.length) {
                console.log('game starts in room:' + roomId)

                //start the game in room object
                if (roomObject[roomId].topics.length === inRoom.length) {
                    const randomTopic = pickRandomTopic(roomObject[roomId].topics)
                    console.log(randomTopic)
                    roomObject[roomId].isStarted = true
                    io.to(roomId).emit('game-start-server', { isStarted: true, topic: randomTopic })
                }

                console.log(roomObject)
                roomVotes[roomId].clear()
            }

        })

        socket.on('disconnecting', () => {
            for (const room of socket.rooms) {
                if (room != socket.id) {
                    if (roomVotes[room]) {
                        roomVotes[room].delete(socket.id)
                    }

                    io.to(room).emit('someone-left-room')
                    console.log("socket disconnection" + room)
                }
            }
            console.log(`User disconnected: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            delete userData[socket.id]
            console.log(`User disconnected: ${socket.id}`);
        });
    })

    app.use((req, res) => handle(req, res));

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('Ready on http://localhost:3000');
    });

})