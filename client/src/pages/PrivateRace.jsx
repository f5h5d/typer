import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import PrivateLobbyChooser from "../components/privateRace/PrivateLobbyChooser";
import MainTypingGame from "../components/generalTyping/MainTypingGame";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../Socket";
import PrivateLobby from "../components/privateRace/PrivateLobby";
import { setHasRaceStarted, setIsMultiplayer } from "../redux/multiplayerSlice";
import { backToLobbyReset, reset, setTypingMode } from "../redux/typingSlice";
import { setRoomOwner, setStartPrivateGame } from "../redux/privateSlice";
import { GAME_MODES, PAGES } from "../../constants/constants.json";
import { setCurrentPage, setReloading } from "../redux/userSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PrivateRace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const reloading = useSelector((state) => state.user.reloading);

  const roomID = useSelector((state) => state.multiplayer.roomID);
  const startPrivateGame = useSelector(
    (state) => state.private.startPrivateGame
  );

  const typingMode = useSelector((state) => state.typing.typingMode);

  const hasEmitted = useRef(false);

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
    dispatch(setIsMultiplayer(true));
    dispatch(setTypingMode(GAME_MODES.PRIVATE));
    dispatch(setCurrentPage(PAGES.PRIVATE));
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onConnectError = () => {
      toast.error("Error connecting to server");
      navigate("/");
    };
    const onUsersBackToLobby = () => {
      dispatch(setStartPrivateGame(false));
      dispatch(setHasRaceStarted(false));
    };

    const onStartNewPrivateGame = () => {
      console.log("resetinggg!!!!");
      dispatch(reset());
      dispatch(setHasRaceStarted(false));
      dispatch(setStartPrivateGame(false));
    };

    const onNewPrivateRoomOwner = () => {
      dispatch(setRoomOwner(true));
    };

    socket.on("connect_error", onConnectError);
    socket.on("users_back_to_lobby", onUsersBackToLobby);
    socket.on("start_new_private_game", onStartNewPrivateGame);
    socket.on("new_private_room_owner", onNewPrivateRoomOwner);

    return () => {
      socket.off("users_back_to_lobby", onUsersBackToLobby);
      socket.off("start_new_private_game", onStartNewPrivateGame);
    };
  }, [socket, dispatch]);

  return (
    <>
      {roomID == "" ? (
        <PrivateLobbyChooser />
      ) : !startPrivateGame ? (
        <PrivateLobby />
      ) : (
        <MainTypingGame />
      )}
    </>
  );
};

export default PrivateRace;
