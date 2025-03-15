import { configureStore } from "@reduxjs/toolkit";
import typingReducer from "./typingSlice";
import multiplayerReducer from "./multiplayerSlice";
import privateReducer from "./privateSlice";
import userReducer from "./userSlice";
import guestUserReducer from "./guestUserSlice";

export default configureStore({
  reducer: {
    typing: typingReducer,
    multiplayer: multiplayerReducer,
    private: privateReducer,
    user: userReducer,
    guestUser: guestUserReducer
  },
});
