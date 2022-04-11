import React, { useState, useEffect, useRef } from "react"
import Peer from "peerjs"
import io from "socket.io-client"
import { useHistory } from "react-router-dom"
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PresentationChartBarIcon,
  PhoneIcon,
  InformationCircleIcon,
  ChatAlt2Icon,
  UserGroupIcon,
} from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
const socket = io(process.env.REACT_APP_SERVER)

const peerConfig = {
  // !important use code below for loacl dev if the peer server is down or not working ⬇️
  // host:"localhost",
  // port:2000,
  // key:"peerjs",
  // path:"/"
  // !important use code below if the peer server is down or not working ⬇️
  // secure: true,
  // port: 443,
  // iceServers: [
  //   { urls: "stun:stun.l.google.com:19302" },
  //   { urls: "stun:stun1.l.google.com:19302" },
  //   { urls: "stun:stun2.l.google.com:19302" },
  // ],
}
const peer = new Peer()

const StreamVideo = ({ location }) => {
  const [userId, setUserId] = useState(null)
  const [users, setUsers] = useState([])
  const [copied, setCopied] = useState(false)
  const [openGroup, setOpenGroup] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const [messages, setMessages] = useState([])
  const history = useHistory()
  const roomId = location.pathname.split("/chat/")[1]
  const myVideoRef = useRef()
  const myVideoInstance = useRef()
  const currentPeer = useRef([])
  const messageRef = useRef()

  useEffect(() => {
    let peerCalls = {}
    peer.on("open", id => {
      console.log("my id", id)
      setUserId(id)
      socket.emit("join-room", {
        username: localStorage.getItem("user"),
        roomId: roomId,
        userId: id,
        photoUrl: localStorage.getItem("userPhoto"),
      })
    })
    __init__(peerCalls)

    socket.on("user-joined", otherUserId => {
      setTimeout(() => {
        const call = peer.call(otherUserId, myVideoInstance.current)
        const newUserVideo = document.createElement("video")
        call.on("stream", newUserVideoStream => {
          console.log("second", newUserVideoStream)
          currentPeer.current.push(call.peerConnection)
          peerCalls[otherUserId] = {
            call,
            newUserVideo,
          }
          appendUserVideoToDom(newUserVideo, newUserVideoStream)
        })

        call.on("close", () => {
          newUserVideo.remove()
        })
      }, 3000)
    })
    peer.on("call", call => {
      call.answer(myVideoInstance.current)
      call.on("stream", OtherThanYouVideoStream => {
        console.log("first", OtherThanYouVideoStream)
        const newUserVideo = document.createElement("video")
        if (!peerCalls[call.peer]) {
          currentPeer.current.push(call.peerConnection)
          appendUserVideoToDom(newUserVideo, OtherThanYouVideoStream)
          peerCalls[call.peer] = {
            call,
            newUserVideo,
          }
        }
      })
    })
    socket.on("user-left", (users, removeUserId) => {
      setUsers(users)
      peerCalls[removeUserId]?.call.close()
      peerCalls[removeUserId]?.newUserVideo.remove()
    })
    socket.on("get-All-Users", users => {
      setUsers(users)
    })
    socket.on("receive-message", (message, username) => {
      setMessages(messages => [...messages, { message, username }])
    })
    socket.on("notify", (message, username) => {
      toast.success(`${username}: ${message}`)
    })
  }, [])

  const __init__ = peerCalls => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          facingMode: "user",
          video: {
            facingMode: "user",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        })
        .then(stream => {
          myVideoInstance.current = stream
          myVideoRef.current.srcObject = stream
          myVideoRef.current.play()
        })
    }
  }

  const appendUserVideoToDom = (video, stream) => {
    video.srcObject = stream
    video.style.width = "500px"
    video.play()
    const VideoContainer = document.getElementById("videos")
    VideoContainer.append(video)
  }

  const endCall = () => {
    socket.emit("end-call", userId, roomId)
    socket.disconnect()
    myVideoInstance.current.getTracks().forEach(track => track.stop())
    history.push("/")
  }
  const hideVideo = () => {
    myVideoInstance.current
      .getVideoTracks()
      .forEach(track => (track.enabled = !track.enabled))
  }
  const mute = () => {
    myVideoInstance.current
      .getAudioTracks()
      .forEach(track => (track.enabled = !track.enabled))
  }

  const copy = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  const shareScreen = () => {
    navigator.mediaDevices
      .getDisplayMedia({
        cursor: true,
      })
      .then(stream => {
        myVideoRef.current.srcObject = stream
        myVideoRef.current.play()
        let videoTracks = stream.getVideoTracks()[0]
        currentPeer.current.forEach(peerConnection => {
          let sender = peerConnection
            .getSenders()
            .find(s => s.track.kind === videoTracks.kind)
          sender.replaceTrack(videoTracks)
        })

        videoTracks.onended = () => {
          myVideoRef.current.srcObject = myVideoInstance.current
          myVideoRef.current.play()
          let returnStream = myVideoInstance.current.getVideoTracks()[0]
          currentPeer.current.forEach(peerConnection => {
            let returnSender = peerConnection
              .getSenders()
              .find(s => s.track.kind === returnStream.kind)
            returnSender.replaceTrack(returnStream)
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  const sendMessage = e => {
    e.preventDefault()
    socket.emit("send-message", messageRef.current.value, roomId)
    messageRef.current.value = ""
  }

  return (
    <div className="w-full relative flex items-center   min-h-screen bg-black">
      <ToastContainer />
      <div className="absolute top-2 left-2 text-white z-30">
        <button
          className="bg-blue-500 hover:bg-blue-400 mt-3 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
          onClick={copy}
        >
          {copied ? "Copied" : " Copy room id"}
        </button>
      </div>

      <div className="w-full flex items-center justify-center">
        <div
          className={`${
            users.length > 1
              ? "fixed top-10 right-5 w-auto h-auto z-20"
              : "flex w-full h-screen items-center justify-center z-20"
          }`}
        >
          <video
            ref={myVideoRef}
            className={`z-30 rounded ${users.length > 1 ? "w-44" : "w-96 "}`}
          />
        </div>
        {users.length > 1 && (
          <div
            id="videos"
            className="flex flex-wrap items-center justify-center  mt-32 lg:mt-0 z-10 mb-32"
          ></div>
        )}
      </div>

      <div className="fixed bottom-0 bg-gray-900 w-full h-12 flex items-center justify-evenly z-20 ">
        <div className="flex items-center justify-center space-x-3 ">
          <button
            className="bg-blue-500 cursor-pointer  hover:bg-blue-400  text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
            onClick={hideVideo}
          >
            <VideoCameraIcon className="w-4" />
          </button>
          <button
            className="bg-blue-500 cursor-pointer hover:bg-blue-400  text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
            onClick={mute}
          >
            <MicrophoneIcon className="w-4" />
          </button>
          <button
            className="bg-red-500 cursor-pointer hover:bg-red-400  text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded"
            onClick={endCall}
          >
            <PhoneIcon className="w-4" />
          </button>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <button>
            <InformationCircleIcon className="w-5 text-white cursor-pointer scale-100 hover:text-red-500" />
          </button>

          <button
            onClick={() => {
              setOpenChat(!openChat)
              setOpenGroup(false)
            }}
          >
            <ChatAlt2Icon className="w-5 text-white cursor-pointer scale-100 hover:text-red-500" />
          </button>
          <button onClick={shareScreen}>
            <PresentationChartBarIcon className="w-5 text-white cursor-pointer scale-100 hover:text-red-500" />
          </button>

          <button
            className="relative"
            onClick={() => {
              setOpenGroup(!openGroup)
              setOpenChat(false)
            }}
          >
            {users.length > 0 && (
              <p className="absolute rounded-full w-5 h-5 bg-blue-500 text-white -top-3 flex items-center justify-center left-3">
                {users.length}
              </p>
            )}
            <UserGroupIcon className="w-5 text-white cursor-pointer scale-100 hover:text-red-500" />
          </button>
        </div>
        {openGroup && (
          <div className="absolute right-5 bottom-14 transition-opacity w-56 h-96 bg-white rounded  overflow-y-scroll ">
            {users?.map((user, index) => (
              <div key={index} className="flex items-center  space-x-2 p-2">
                <img
                  src={user?.photoUrl}
                  className="w-12 cursor-pointer rounded "
                  alt="user-image"
                />
                <p className="font-medium">{user.username}</p>
              </div>
            ))}
          </div>
        )}
        {openChat && (
          <div className="absolute right-5 bottom-14 transition-opacity w-80 h-96 bg-white rounded  ">
            <div className="overflow-y-scroll w-full h-80 mb-10">
              {messages.length > 0 &&
                messages.map(({ message, username }, index) => (
                  <div key={index} className="flex p-2 flex-col space-y-2 ">
                    <p className="text-gray-600 text-sm">{username}</p>
                    <p className="font-medium text-xl w-56 h-12">{message}</p>
                  </div>
                ))}
            </div>

            <div>
              <form
                onSubmit={sendMessage}
                className="w-full h-12 flex items-center absolute bottom-0"
              >
                <input
                  ref={messageRef}
                  type="text"
                  placeholder="Enter a message"
                  className="flex-grow h-12 outline-none px-2"
                />
                <button
                  onClick={sendMessage}
                  className="w-12 h-12 hover:bg-green-700 flex items-center justify-center cursor-pointer bg-green-800"
                >
                  <ArrowCircleRightIcon className="w-6 text-blue-500 " />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StreamVideo
