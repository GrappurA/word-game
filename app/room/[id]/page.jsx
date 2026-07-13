"use client"
import { io } from "socket.io-client"
import { useState, useEffect, use } from "react"
import UserInRoom from "@/app/ReactComponents/UserInRoom"

const socket = io()

export default function Room({ params }) {
    const { id: rmId } = use(params)

    const [roomId, setRoomId] = useState(rmId)
    const [userId, setUserId] = useState('Connecting...')

    const [inRoom, setInRoom] = useState([])
    const [voters, setVoters] = useState([])

    const [username, setUsername] = useState('loading...')

    const [topic, setTopic] = useState("")
    const [gameStarted, setGameStarted] = useState(false)

    function handleStart() {
        if (voters.includes(userId))
            return

        socket.emit('user-voted-client', { roomId: roomId, topic: topic })
    }

    useEffect(() => {
        const storedUsername = sessionStorage.getItem('username') || 'Anonymous'
        setUsername(storedUsername)

        setUserId(socket.id)

        socket.on('connect', () => {
            setUserId(socket.id)
        })

        socket.emit('join-room-client', { roomId: roomId, username: storedUsername })
        socket.emit('get-others-client', { roomId: roomId });

        socket.on('get-others-server', (data) => {
            setInRoom(data.users || [])
        })

        socket.on('join-room-server', (data) => {
            setInRoom(data.users)
        })

        socket.on('user-voted-server', (data) => {
            setVoters(data.userIds)
        })

        socket.on('game-start-server', (data) => {
            setGameStarted(data.isStarted)
            setTopic(data.topic)
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
            socket.off('join-room-server')
            socket.off('leave-room-server')
            socket.off('someone-left-room')
            socket.off('user-voted-server')
            socket.off('game-start-server')
        })
    }, [roomId])

    return (
        <div className="border-5 rounded-2xl border-[#ffffff] m-auto p-4">
            <div className="flex select-none mt-2">

                {/*info board*/}
                <div className="bg-[#424b54] mr-2 rounded-2xl border-[#e1ce7a] border-4 p-6 shadow-xl w-full max-w-md text-[#ffffff] font-sans">

                    <div className="text-center mb-4">
                        <p className="text-lg text-[#ebcfb2] uppercase tracking-widest font-bold">Lobby Info</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xl items-center">
                        {/* Username Row */}
                        <p className="text-[#c5baaf] font-medium tracking-wide">Username:</p>
                        <p className="font-bold text-[#ffffff] truncate max-w-[180px]">{username}</p>

                        {/* Room ID Row */}
                        <p className="text-[#c5baaf] font-medium tracking-wide">Room ID:</p>
                        <p className="font-extrabold text-[#e1ce7a] text-3xl tracking-wider">{roomId}</p>

                        {/* Population Row */}
                        <p className="text-[#c5baaf] font-medium tracking-wide">Players:</p>
                        <p className="font-extrabold text-[#ebcfb2] text-3xl">{inRoom.length}</p>
                    </div>

                </div>

                {/* --- GAME SETUP & VOTING CARD --- */}
                {inRoom.length > 1 ? (
                    <div className="bg-[#424b54] rounded-2xl border-[#ebcfb2] border-4 shadow-xl flex flex-col min-w-[300px] max-w-md text-[#ffffff] p-2 gap-2">

                        <div className="text-center">
                            <p className="text-lg text-[#ebcfb2] mb-2 uppercase tracking-widest font-bold">Game Setup</p>
                            <p className="text-sm text-[#c5baaf]">Select a topic and vote to begin.</p>
                        </div>

                        {/* 1. Topic Selection */}
                        <div className="w-full">
                            <label htmlFor="topic-choice" className="block text-[#e1ce7a] font-bold mb-2 text-xl">
                                Topic:
                            </label>
                            <input
                                list="topics"
                                id="topic-choice"
                                name="topic-choice"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Choose or type..."
                                className="w-full bg-[#424b54] border-2 border-[#c5baaf] rounded-lg p-3 text-white placeholder:text-[#c5baaf] focus:border-[#e1ce7a] focus:outline-none text-xl transition-colors"
                            />
                            <datalist id="topics">
                                <option value="Animals" />
                                <option value="Movies" />
                                <option value="Geography" />
                                <option value="History" />
                                <option value="Sports" />
                                <option value="Recent Events" />
                            </datalist>
                        </div>

                        {/* 2. Start Button & Votes */}
                        <div className="w-full text-center">
                            <button
                                onClick={handleStart}
                                disabled={!topic || voters.includes(userId)}
                                className={`w-full py-4 text-2xl font-bold rounded-xl border-4 transition-all duration-200 ${!topic || voters.includes(userId)
                                    ? 'bg-[#c5baaf] border-[#c5baaf] text-[#424b54] opacity-80 cursor-not-allowed'
                                    : 'bg-[#e1ce7a] border-[#e1ce7a] text-[#424b54] hover:bg-transparent hover:text-[#e1ce7a] active:scale-105 shadow-[0_0_15px_rgba(225,206,122,0.4)]'
                                    }`}
                            >
                                {!topic
                                    ? 'Select Topic First'
                                    : voters.includes(userId)
                                        ? 'Waiting for others...'
                                        : 'Start Game!'
                                }
                            </button>

                            <p className="text-xl mt-4">
                                Votes: <span className="text-[#e1ce7a] font-bold text-2xl">{voters.length}</span> / {inRoom.length}
                            </p>
                        </div>

                    </div>
                ) : (
                    /* Fallback if user is alone in the room */
                    <div className="bg-[#424b54] rounded-2xl border-[#c5baaf] border-4 p-6 shadow-xl flex flex-col items-center justify-center min-w-[300px] max-w-md text-[#ffffff]">
                        <p className="text-xl text-[#c5baaf] text-center font-bold">Waiting for more players...</p>
                    </div>
                )}
            </div>

            <hr className="h-[4px] mt-2 bg-[#C5BAAF]" />
            <div className="bg-[#424b54] w-fit p-2 m-2 rounded-2xl border-4 border-[#E1CE7A]">

                <p className="text-center text-3xl text-[#EBCFB2]">Players in lobby</p>
                {/*users in room*/}
                < div className="flex flex-wrap" >
                    {
                        inRoom.map((user) => (
                            <UserInRoom key={user.id} userId={user.id} hasVoted={voters.includes(user.id)} imageIndex={user.imageIndex.imageIndex} username={user.imageIndex.username} />
                        ))
                    }
                </div>
            </div >


            {/*game overlay*/}
            {
                gameStarted &&
                <div className="fixed inset-0 z-50 w-screen h-screen bg-[#C5BAAF] m-auto ">
                    <p className="text-[#000000] text-center text-5xl mt-2">Topic: <u>{topic}</u></p>
                </div>
            }
        </div>
    )
}