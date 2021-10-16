import React, { useEffect, useState, useRef } from "react"
import { MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/outline"
import { useHistory } from "react-router-dom"
import Header from "./Header"
import io from "socket.io-client"
const socket = io(process.env.REACT_APP_SERVER)

const New = ({ location }) => {
  const history = useHistory()
  const [usersInTheRoom, setUsersInTheRoom] = useState([])
  const myVideoRef = useRef(null)
  const videoInstance = useRef(null)
  const [cameraOff, setCameraOff] = useState(false)
  const roomId = location.pathname.split("/")[1]

  useEffect(() => {
    socket.emit("getAllUsersForTheNewPage", roomId)
    socket.on("get-All-Users", users => {
      console.log(users)
      setUsersInTheRoom(users)
    })
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        })
        .then(stream => {
          videoInstance.current = stream
          myVideoRef.current.srcObject = stream
          myVideoRef.current.play()
        })
    }
  }, [])

  const hideVideo = () => {
    setCameraOff(!cameraOff)
    videoInstance.current
      .getVideoTracks()
      .forEach(track => (track.enabled = !track.enabled))
  }
  const mute = () => {
    videoInstance.current
      .getAudioTracks()
      .forEach(track => (track.enabled = !track.enabled))
  }

  return (
    <>
      <Header />
      <div className="w-full min-h-screen -mt-14 flex flex-col space-y-5 lg:flex-row items-center justify-evenly">
        <div className="relative">
          <video
            ref={myVideoRef}
            className=" w-96 lg:w-full lg:h-96  rounded"
          />
          <div className="absolute bottom-2 flex w-full items-center justify-center space-x-3 z-20">
            <button
              onClick={hideVideo}
              className="bg-green-600 rounded-full p-3"
            >
              <VideoCameraIcon className="w-4 " />
            </button>
            <button onClick={mute} className="bg-yellow-600 rounded-full p-3">
              <MicrophoneIcon className="w-4" />
            </button>
          </div>
          {cameraOff && (
            <div className="absolute top-0 text-white  w-full h-full flex items-center justify-center">
              <p>Camera is off</p>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-4 items-center">
          <p className="text-2xl font-medium">Join the room</p>
          <div>
            {usersInTheRoom.map(user => (
              <p>{user.username},</p>
            ))}
          </div>
          <div>
            <button
              onClick={() => {
                history.push(`/chat/${roomId}`)
                window.location.reload()
              }}
              className="p-2 w-24 font-medium  bg-blue-600 hover:bg-blue-700 rounded"
            >
              Join
            </button>
            <button className="ml-2 p-2 w-32 font-medium  text-white bg-black rounded hover:opacity-95 ">
              Present
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default New
