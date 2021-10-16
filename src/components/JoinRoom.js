import React, { useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { useHistory } from "react-router-dom"
import { VideoCameraIcon } from "@heroicons/react/outline"
import { signInWithPopup } from "firebase/auth"
import useCheckIfUserIsLoggedIn from "../hooks/checkUser"
import { auth } from "../firebase"
import GoogleProvider from "../firebase"
import Header from "./Header"

const JoinRoom = () => {
  const user = useCheckIfUserIsLoggedIn()
  console.log(user)
  const meetCode = useRef(null)
  const history = useHistory()

  return (
    <div>
      <Header />
      <div className="w-full h-12 flex items-center justify-center bg-yellow-100">
        <p>
          Learn about our solutions for{" "}
          <a className="underline cursor-pointer"> education</a> and{" "}
          <a className="underline cursor-pointer"> healthcare</a>
        </p>
      </div>
      <div className="flex w-full items-center justify-evenly">
        <div className="w-full px-6 mt-16">
          <p className="font-normal w-96 text-blcak text-2xl">
            Premium video meetings for everyone.
          </p>
          <p className="mt-5 text-gray-500">
            We re-engineered the service we built for secure, high-quality
            business meetings, Google Meet, to make it available for all, on any
            device.
          </p>
          <button
            onClick={async () => {
              if (!user) {
                await signInWithPopup(auth, GoogleProvider)
              } else {
                history.push(`/chat/` + uuidv4())
                window.location.reload()
              }
            }}
            className="mt-12  px-2 py-3 space-x-2 bg-blue-600 flex items-center justify-center  rounded cursor-pointer w-44  hover:bg-blue-700 text-white "
          >
            <VideoCameraIcon className="w-6 h-6" />
            <p>Start a Meeting</p>
          </button>
          <input
            ref={meetCode}
            type="text"
            placeholder="Enter meeting code"
            className="mt-5 p-3 rounded border border-gray-300"
          />
          <button
            onClick={async () => {
              if (!user) {
                await signInWithPopup(auth, GoogleProvider)
              } else {
                history.push(`/${meetCode.current.value}`)
              }
            }}
            className="ml-2 text-gray-400 font-medium"
          >
            Join
          </button>
        </div>
        <div className="px-2 mt-24  hidden lg:block">
          <img
            src="https://lh3.googleusercontent.com/g6WWfSMs3V0w2hhsaoc9myxQXmfO3IcRPwIsSo7nUJkNDHFb2JT4bffBiNH50_seojxYfC3AfBz8xNHd5k7tqXVsjRVvHGfJfAPx-zz8Lk7EQ0cPuA=rwu-v1-w1400"
            alt="image"
          />
        </div>
      </div>
    </div>
  )
}

export default JoinRoom
