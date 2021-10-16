import { atom } from "recoil"

const userState = atom({
  key: "PeerId",
  default: null,
})

export default userState
