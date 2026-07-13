import { useState } from "react"
import Image from "next/image"
import images from "@/public/images/images"
export default function UserInRoom({ userId, hasVoted, imageIndex, username }) {

    const [image] = useState(() => {
        return images[imageIndex]
    })

    return (
        <>
            <div className="border-[#BAC2C9] border-4 rounded-2xl p-2 m-2 bg-white w-[260px] select-none">
                <Image src={image} width={40} height={40} alt="" className="m-auto" />
                <p className="text-black m-auto text-center underline decoration-2">{username}</p>
                <p className="text-black text-center">has Voted: {hasVoted ? 'yes' : 'no'}</p>
            </div>
        </>
    )
}   