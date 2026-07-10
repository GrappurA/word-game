import { useState } from "react"
import Image from "next/image"
import images from "@/public/images/images"
export default function UserInRoom({ userId, hasVoted, imageIndex }) {

    const [image] = useState(() => {
        return images[imageIndex]
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