"use client"
import { io } from "socket.io-client"
import { useState, useEffect, use } from "react"
import UserInRoom from "@/app/ReactComponents/UserInRoom"

const socket = io()

export default function Room({ params }) {
    const { id: rmId } = use(params)
    const [roomId, setRoomId] = useState(rmId)
    const [inRoom, setInRoom] = useState([])
    const [userId, setUserId] = useState('Connecting...')
    const [voters, setVoters] = useState([])

    function handleStart() {
        if (voters.includes(userId))
            return

        setVoters(prev => {
            return [...prev, userId]
        })
    }

    useEffect(() => {
        setUserId(socket.id)
        socket.on('connect', () => {
            setUserId(socket.id)
        })

        socket.emit('join-room', { roomId: roomId, })
        socket.emit('get-others-client', { roomId: roomId });

        socket.on('get-others-server', (data) => {
            setInRoom(data.users || [])
        })

        socket.on('join-room', (data) => {
            setInRoom(data.users)

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
            <div className="flex">

                <div className="bg-[#424b54] rounded-2xl border-[#EBCFB2] border-4 m-2 p-2 w-fit text-3xl">
                    <p>Your id: <u>{userId}</u></p>
                    <p>Room number: <b className="text-4xl">{roomId}</b></p>
                    <p>People in a Room: <b className="text-4xl">{inRoom.length}</b></p>
                </div>

                {inRoom.length > 1 &&
                    <div className="border-3 border-[#EBCFB2] rounded-3xl p-2 m-2">
                        <button onClick={handleStart} className="text-3xl border-5 border-green-200 rounded-2xl p-2 m-2 active:scale-110 transition-transform">Start Game!</button>
                        <p className="text-2xl">Votes: {voters.length || 0}</p>
                    </div>}

            </div>

            <div className="flex">
                {inRoom.map((user) => (
                    <UserInRoom key={user.id} userId={user.id} hasVoted={voters.includes(user.id)} imageIndex={user.imageIndex} />
                ))}
            </div>

        </>
    )
}