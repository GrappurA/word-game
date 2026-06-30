"use client"
import { io } from "socket.io-client"
import React from "react"

const socket = io()

export default function Room({ params }) {
    const { id: roomId } = React.use(params)

    socket.emit('get-others', { roomId: roomId });

    return (
        <>
            <p>{socket.id}</p>
            <p>{roomId}</p>
            <p>{socket.Room}</p>
        </>
    )
}