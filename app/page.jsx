"use client"
import React, { useEffect } from "react";
import Popup from "./ReactComponents/Popup";

import { useRouter } from 'next/navigation';

export default function Home() {

  const [isWaiting, setIsWaiting] = React.useState(false);
  const router = useRouter()


  function handleJoin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const roomId = formData.get('roomId')

    setIsWaiting(true)

    const route = `/room/${roomId}`
    router.push(route)
  }

  return (
    <>
      {isWaiting && <Popup />}

      <div className="relative min-h-screen">

        <p className='text-5xl text-center pt-7 mt-[10%]'>Welcome !</p >
        <div className="flex w-fit gap-100 ml-auto mr-auto mt-3">

          <div className="border-4 border-[#E1CE7A] rounded-2xl p-5 ">
            <p className="text-center mb-5 text-xl underline decoration-[#E1CE7A] underline-offset-10 decoration-[2px]">Type anything to Join / Create a lobby</p>

            <form onSubmit={handleJoin} className="grid grid-rows-2 rounded-2xl border-4 border-white overflow-hidden">
              <input required type="text" id="roomId" name='roomId' className="bg-gray-700 p-2 text-xl h-[40px] tracking-wider" placeholder="room id..." />
              <hr className="h-[4px] bg-white" />
              <button type="submit" className="ml-auto mr-auto mt-[-7%] rounded-2xl m-3 text-3xl hover:scale-110 active:scale-115">Join!</button>
            </form>

          </div>



        </div>
      </div>
    </>

  );

}
