import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCK2XtbVeh7w8kpSM2gR_VQsS9Ohrgj6QY",
  authDomain: "react-chatapp-57b17.firebaseapp.com",
  projectId: "react-chatapp-57b17",
  storageBucket: "react-chatapp-57b17.appspot.com",
  messagingSenderId: "597799592467",
  appId: "1:597799592467:web:b59992b7e5db918a8495e6",
  measurementId: "G-RFTRVRYVR7",
}

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth()
const GoogleProvider = new GoogleAuthProvider()

export { auth }
export default GoogleProvider
