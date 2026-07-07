import { useState } from "react"
import Image from "next/image"

export default function UserInRoom({ userId, hasVoted }) {

    const images = [
        '/images/1.png',
        '/images/2.png',
        '/images/3.png',
        '/images/4.png',
        '/images/5.png',
        '/images/6.png',
        '/images/7.png',
        '/images/8.png',
        '/images/9.png',
        '/images/10.png',
    ]
    const [image] = useState(() => {
        const randomIndex = Math.floor(Math.random() * images.length)
        return images[randomIndex]
    })

    return (
        <>
            <div className="border-white border-3 rounded-2xl p-2 m-2 bg-white w-[260px]">
                <Image src={image} width={40} height={40} alt="" className="m-auto" />
                <p className="text-black m-auto text-center">{userId}</p>
                <p className="text-black">has Voted: {hasVoted ? 'yes' : 'no'}</p>
            </div>
        </>
    )
}   