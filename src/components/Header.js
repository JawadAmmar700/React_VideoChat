import React from "react"
import { auth } from "../firebase"
import GoogleProvider from "../firebase"
import useCheckIfUserIsLoggedIn from "../hooks/checkUser"
import { signInWithPopup, signOut } from "firebase/auth"
import { Link } from "react-router-dom"

const Header = () => {
  const user = useCheckIfUserIsLoggedIn()

  const signIn = async () => {
    await signInWithPopup(auth, GoogleProvider)
  }

  return (
    <div className="w-full h-14  px-2 flex items-center justify-between ">
      <div className="flex items-center">
        <Link to="/">
          <img
            src="https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_1x_icon_124_40_2373e79660dabbf194273d27aa7ee1f5.png"
            alt="image"
          />
        </Link>
        <p className="ml-2 text-gray-500 text-2xl font-semibold">meet</p>
        <div className="ml-6  space-x-4 hidden lg:flex">
          {["OverView", "How it works", "Plans & pricing"].map(
            (items, index) => (
              <p
                key={index}
                className="text-gray-500 font-medium cursor-pointer h-12 flex items-center justify-center  p-3 rounded hover:bg-gray-100"
              >
                {items}
              </p>
            )
          )}
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center space-x-2">
        {!user && (
          <button
            onClick={signIn}
            className="text-gray-500 font-medium cursor-pointer h-12 flex items-center justify-center  p-3 rounded hover:bg-gray-100"
          >
            Sign in
          </button>
        )}
        {window.location.pathname === "/" && (
          <>
            <button className="border border-gray-200 text-blue-500 font-medium p-5 h-12 rounded  flex items-center justify-center hover:border-blue-600">
              Join a meeting
            </button>
            <button className="p-5 bg-blue-600 font-medium flex items-center justify-center text-white hover:bg-blue-700 rounded h-12">
              Start a meeting
            </button>
          </>
        )}
        {user && (
          <img
            src={user?.photoURL}
            className="w-12 cursor-pointer "
            alt="user-image"
            onClick={() => signOut(auth)}
          />
        )}
      </div>
    </div>
  )
}

export default Header
