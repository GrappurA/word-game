"use client"
import { io } from "socket.io-client"
import React, { useEffect } from "react"
import UserInRoom from "@/app/ReactComponents/UserInRoom"

const socket = io()

export default function Room({ params }) {
    const { id: rmId } = React.use(params)
    const [roomId, setRoomId] = React.useState(rmId)
    const [inRoom, setInRoom] = React.useState([])
    const [userId, setUserId] = React.useState(0)

    useEffect(() => {
        setUserId(socket.id)
        socket.on('connect', () => {
            setUserId(socket.id)
        })

        socket.emit('join-room', { roomId: roomId })
        socket.emit('get-others-client', { roomId: roomId });

        socket.on('get-others-server', (data) => {
            setInRoom(data.userIds || [])
        })

        socket.on('join-room', (data) => {
            setInRoom(data.userIds)
        })

        socket.on('leave-room-server', (data) => {
            setInRoom(data.userIds)
        })

        socket.on('someone-left-room', () => {
            socket.emit('get-others-client', { roomId: roomId })
        })

        return (() => {
            socket.emit('leave-room-client', { roomId: roomId })

            socket.off('connect')
            socket.off('get-others-server')
            socket.off('join-room')
            socket.off('leave-room-server')
            socket.off('someone-left-room')
        })
    }, [roomId])


    return (
        <>
            <p>socket id: {userId}</p>
            <p>room id: {roomId}</p>
            <p>users in this room: {inRoom.length}</p>

            <div>
                {inRoom.map((id) => {
                    <UserInRoom userId={id} />
                })}
            </div>
        </>
    )
}