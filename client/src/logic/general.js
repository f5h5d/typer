import { useDispatch } from "react-redux"
import { setUserTyped } from "../redux/typingSlice"


export const resetTestValues = (dispatch) => {

  dispatch(setUserTyped(""))
  dispatch(setTypedAtAll(false))
  dispatch(set)
}