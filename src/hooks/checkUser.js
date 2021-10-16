import React, { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

const useCheckIfUserIsLoggedIn = () => {
  //state to store user information
  const [user, setUser] = useState(null)

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        localStorage.setItem("userPhoto", user.photoURL)
        if (localStorage.getItem("user") === null) {
          const name = user.displayName
          localStorage.setItem("user", name)
        }
        setUser(user)
      } else {
        localStorage.removeItem("user")
        localStorage.removeItem("userPhoto")
        setUser(null)
      }
    })
  }, [])

  return user
}

export default useCheckIfUserIsLoggedIn
