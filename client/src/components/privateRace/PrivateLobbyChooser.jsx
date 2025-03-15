import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRoomOwner } from "../../redux/privateSlice";
import { setRoomID } from "../../redux/multiplayerSlice";
import styled from "styled-components";
import { socket } from "../../Socket";
import CornerButton from "../styles/CornerButton";
import toast from "react-hot-toast";
import { GAME_MODES } from "../../../constants/constants.json";

const PrivateLobbyChooser = () => {
  const dispatch = useDispatch();

  const typingType = useSelector((state) => state.typing.typingType);
  const typingMode = useSelector((state) => state.typing.typingMode)

  const roomID = useSelector((state) => state.multiplayer.roomID);

  const user = useSelector((state) => state.user.user);1
  const userStats = useSelector((state) => state.user.userStats);

  const guestWpm = useSelector((state) => state.guestUser.guestWpm);

  const privateGameUserStats = useSelector((state) => state.private.privateGameUserStats)

  const TYPING_MODE = 2;


  const [errMessage, setErrMessage] = useState("")

  let id = "";

  const onCreateRoom = () => {
    socket.emit("create_private_room");
  };

  // creaitng room
  useEffect(() => {
    const onCreatedRoom = (id) => {
      dispatch(setRoomOwner(true));
      dispatch(setRoomID(id));

      const username = user ? user.username : "Guest";

      const userData = {
        username: username,
        wpm: 0,
        currentWord: "",
        percentage: 0,
        id: "",
        roomOwner: false,
        ...privateGameUserStats,
      };

      socket.emit("join_room", [id, GAME_MODES.PRIVATE, userData, typingType]);
    };

    socket.on("created_room", onCreatedRoom);

    return () => {
      socket.off("created_room", onCreatedRoom);
    };
  }, [socket, dispatch]);

  // joining room
  useEffect(() => {
    const onSuccessfulyJoinedPrivateRoom = (roomID) => {
      dispatch(setRoomID(roomID));
    };

    const noRoomDoesntExist = () => {
      toast.error("Invalid room code - room doesn't exist");
    };
    socket.on(
      "successfuly_joined_private_room",
      onSuccessfulyJoinedPrivateRoom
    );

    socket.on("room_doesnt_exist", noRoomDoesntExist);

    return () => {
      socket.off(
        "successfuly_joined_private_room",
        onSuccessfulyJoinedPrivateRoom
      );
      socket.off("room_doesnt_exist", noRoomDoesntExist);
    };
  }, [socket, dispatch]);

  const joinRoom = () => {
    socket.emit("join_private_room", id);

    const username = user ? user.username : "Guest";

    const userData = {
      username: username,
      wpm: 0,
      currentWord: "",
      percentage: 0,
      id: "",
      roomOwner: false,
      ...userStats,
    };
    socket.emit("join_room", [id, GAME_MODES.PRIVATE, userData, typingType]);
  };

  const onRoomIDChange = (e) => {
    if (e.target.value.length > 6) {
      e.target.value = e.target.value.slice(0, 6);
    }
    id = e.target.value;
  };

  return (
    <>
      <Container>
        <div className="modal">
          <h2 className="title">Enter Room Code</h2>

          <input className="input" onChange={(e) => onRoomIDChange(e)} />

          <div className="buttons-container">
            <CornerButton>
              <button className="corner-button" onClick={joinRoom}>
                <span>JOIN ROOM</span>
              </button>
            </CornerButton>
            <div className="or-container">
              <div className="before-line"></div>
              <span className="text">or</span>
              <div className="after-line"></div>
            </div>

            <CornerButton onClick={onCreateRoom}>
              <button className="corner-button">
                <span>CREATE ROOM</span>
              </button>
            </CornerButton>
          </div>
        </div>
      </Container>
    </>
  );
};

export default PrivateLobbyChooser;

const Container = styled.div`
  width: 100vw;

  display: flex;
  justify-content: center;

  .modal {
    margin-top: 100px;
    height: 465px;
    width: 450px;
    border-radius: 10px;
    background: ${(props) => props.theme.colors.lightBackground};

    .title {
      font-size: ${(props) => props.theme.fontSizes.largeLabel};
      text-align: center;
      margin-top: 50px;
    }

    .input {
      background: ${(props) => props.theme.colors.darkBackground};
      width: 90%;
      margin-left: 5%;
      margin-top: 40px;
      margin-bottom: 5%;
      height: 60px;
      border-bottom: 5px solid ${(props) => props.theme.colors.accent};
      border-radius: 2px;

      font-size: ${(props) => props.theme.fontSizes.largeLabel};
      color: ${(props) => props.theme.colors.text};
      text-align: center;
      font-weight: bold;
    }

    .buttons-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      .or-container {
        display: flex;

        width: 100%;
        height: 20px;
        justify-content: space-evenly;
        align-items: center;

        /* position: relative; */
        .before-line,
        .after-line {
          height: 2px;
          border-radius: 10px;
          width: 40%;
          background: ${(props) => props.theme.colors.accent};
          /* position: absolute; */
        }

        .before-line {
        }
      }
    }
    .corner-button {
      margin: 15% 0px;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    .modal {
      width: 300px !important;

      .title {
        font-size: ${(props) => props.theme.fontSizes.label};
      }

      .input {
        height: 45px;
        font-size: ${(props) => props.theme.fontSizes.label};
      }
    }
  }
`;
