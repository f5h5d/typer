import { useSelector } from "react-redux";



const trackWpm  = (wpm) => {
  setInterval(() => {
    console.log("one second has passed jit" + " " + wpm)
  }, 1000)
}

export default trackWpm