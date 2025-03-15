import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTypingMode } from "../redux/typingSlice";
import { setIsMultiplayer, setLookingForRoom } from "../redux/multiplayerSlice";
import { socket } from "../Socket";
import MainTypingGame from "../components/generalTyping/MainTypingGame";
import { setRoomID } from "../redux/multiplayerSlice";
import { GAME_MODES, PAGES, TYPING_TYPE } from "../../constants/constants.json";
import { setCurrentPage } from "../redux/userSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Multiplayer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const typingText = useSelector((state) => state.typing.typingText);
  const typingMode = useSelector((state) => state.typing.typingMode);
  const finishedTest = useSelector((state) => state.typing.finishedTest);
  const typingType = useSelector((state) => state.typing.typingType);

  const mode = useSelector((state) => state.multiplayer.mode);
  const roomID = useSelector((state) => state.multiplayer.roomID);
  const lookingForRoom = useSelector(
    (state) => state.multiplayer.lookingForRoom
  );

  const guestWpm = useSelector((state) => state.guestUser.guestWpm);
  const guestAccuracy = useSelector((state) => state.guestUser.guestAccuracy);
  const guestTotalRaces = useSelector(
    (state) => state.guestUser.guestTotalRaces
  );

  const user = useSelector((state) => state.user.user);
  const userStats = useSelector((state) => state.user.userStats);
  const currentPage = useSelector((state) => state.user.currentPage);

  const lookingForRoomRef = useRef(lookingForRoom);

  const hasEmitted = useRef(false);

  useEffect(() => {
    lookingForRoomRef.current = lookingForRoom;
  }, [lookingForRoom]);

  // when user reloads calls this to do things in backend related to leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasEmitted.current) return;
      hasEmitted.current = true;
      socket.emit("pre_disconnect", [typingMode, roomID]);
    };

    window.addEventListener("beforeunload", handleBeforeUnload, { once: true });
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [socket, typingMode, roomID]);

  useEffect(() => {
    if (mode == -1) {
      // user reached here by typing "/multiplayer themselves in the bar if the mode was not already set by the code"
      navigate("/");
      return;
    }
    dispatch(setIsMultiplayer(true));
    dispatch(setTypingMode(GAME_MODES.MULTIPLAYER));
    dispatch(
      setCurrentPage(
        typingType == TYPING_TYPE.QUOTES ? PAGES.QUOTE : PAGES.DICTIONARY
      )
    );
  }, [typingType]);

  const joinRoom = () => {
    const username = user?.username || "Guest"; // checks if user is signed in and gives that username, otherwise uses Guest

    const userData = {
      username: username,
      wpm: 0,
      currentWord: typingText.split(" ")[0],
      percentage: 0,
      id: "",
      ...userStats,
    };

    console.log("JOININ ROOOM")

    socket.emit("join_room", [0, GAME_MODES.MULTIPLAYER, userData, typingType]);
    dispatch(setLookingForRoom(false));
  };

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    if (lookingForRoom) joinRoom();
  }, [lookingForRoom])



  useEffect(() => {
    const onConnectError = () => {
      toast.error("Error connecting to server");
      navigate("/");
    };
    const onGetRoomId = (id) => {
      dispatch(setRoomID(id));

      console.log("GETTING ROOM ID: " + id);
      socket.emit("track_user", GAME_MODES.MULTIPLAYER, id);
    };

    const tellUserToStartGame = (roomID) => {
      console.log("STARTING GAME")
      socket.emit("start_game", GAME_MODES.MULTIPLAYER, roomID, typingType);
    };

    socket.on("connect_error", onConnectError);

    socket.on("get_room_id", onGetRoomId);

    socket.on("tell_user_to_start_game", tellUserToStartGame);

    return () => {
      socket.off("get_room_id", onGetRoomId);
      socket.off("tell_user_to_start_game", tellUserToStartGame);
    };
  }, [dispatch, socket, typingType]);

  return <MainTypingGame lookingForRoomRef={lookingForRoomRef} />;
};

export default Multiplayer;
