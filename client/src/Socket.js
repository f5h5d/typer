import { useSelector } from "react-redux";
import { io } from "socket.io-client"

const API = import.meta.env.VITE_API;

// "undefined" means the URL will be computed from the `window.location` object

export const socket = io(API, { 
  autoConnect: false
})