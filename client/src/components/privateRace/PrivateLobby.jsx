import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { setOtherPlayersData, setSocketID } from "../../redux/multiplayerSlice";
import { socket } from "../../Socket";
import {
  privateRoomReset,
  setPrivateLobbyLeaderboardData,
  setRoomOwner,
  setStartPrivateGame,
} from "../../redux/privateSlice";
import { setRoomID } from "../../redux/multiplayerSlice";
import { useNavigate } from "react-router-dom";
import { backToLobbyReset, reset } from "../../redux/typingSlice";
import { GAME_MODES } from "../../../constants/constants.json";
import CornerButton from "../styles/CornerButton";
import OptionSelector from "../sandbox/OptionSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiamond } from "@fortawesome/free-solid-svg-icons";
const PrivateLobby = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const otherPlayersData = useSelector(
    (state) => state.multiplayer.otherPlayersData
  );
  const roomID = useSelector((state) => state.multiplayer.roomID);

  const roomOwner = useSelector((state) => state.private.roomOwner);
  const privateLobbyLeaderboardData = useSelector(
    (state) => state.private.privateLobbyLeaderboardData
  );
  const privateGameTypingParams = useSelector(
    (state) => state.private.privateGameTypingParams
  );

  const typingMode = useSelector((state) => state.typing.typingMode);
  const typingType = useSelector((state) => state.typing.typingType);

  useEffect(() => {
    const onInitializeUserId = (data) => {
      dispatch(setSocketID(data));
    };

    const updateLeaderboardData = (data) => {
      dispatch(setPrivateLobbyLeaderboardData(data));
    };

    const onInitializeUserDataForOthers = (data) => {
      const users = {};
      for (let x in data) {
        // loop through and keep everyone but the user
        if (data[x].id !== socket.id) users[data[x].id] = data[x];
      }
      dispatch(setOtherPlayersData(users));
    };

    const onInitializeOtherUsersData = (data) => {
      const users = {};
      for (let x in data) {
        // loop through and keep everyone but the user
        if (data[x].id !== socket.id) users[data[x].id] = data[x];
      }
      dispatch(setOtherPlayersData(users));
    };

    const onStartedGame = () => {
      dispatch(setStartPrivateGame(true));
    };

    socket.on("initialize_user_id", onInitializeUserId);

    socket.on("leaderboard_data", updateLeaderboardData);

    socket.on("initialize_user_data_for_others", onInitializeUserDataForOthers);

    socket.on("initialize_other_users_data", onInitializeOtherUsersData);

    socket.on("started_game", onStartedGame);

    return () => {
      socket.off("initialize_user_id", onInitializeUserId);
      socket.off(
        "initialize_user_data_for_others",
        onInitializeUserDataForOthers
      );
      socket.off("initialize_other_users_data", onInitializeOtherUsersData);
      socket.off("started_game", onStartedGame);
    };
  }, [socket, dispatch]);

  const onStartClick = () => {
    dispatch(setStartPrivateGame(true))
    socket.emit(
      "start_game",
      GAME_MODES.PRIVATE,
      roomID,
      typingType,
      privateGameTypingParams
    );
  };

  const onMenuClick = () => {
    dispatch(privateRoomReset());
    dispatch(backToLobbyReset())
    socket.emit("pre_disconnect", [typingMode, roomID]);
    dispatch(setRoomID(""));
  };

  return (
    <Container>
      <CodeContainer className="code-container">
        <h1 className="label">ROOM CODE</h1>
        <h1 className="code">{roomID}</h1>
      </CodeContainer>

      <UsersTable className="users-table">
        <div className="table">
          <div className="table-header">
            <div className="table-header-content">
              <div className="number">#</div>
              <div className="username">name</div>
              <div className="speed">speed</div>
              <div className="acc">acc</div>
            </div>
          </div>

          <div className="data-points">
            {privateLobbyLeaderboardData.map((dataPoint, index) => {
              return (
                <div className="data-point" key={index}>
                  <div className="data-point-number">{index + 1}</div>
                  <div className="data-point-username">
                    {dataPoint.username}
                    {dataPoint.roomOwner ? (
                      <FontAwesomeIcon className="icon" icon={faDiamond} />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="data-point-speed">{dataPoint.wpm}wpm</div>
                  <div className="data-point-acc">{dataPoint.accuracy}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </UsersTable>

      <Options>{roomOwner ? <OptionSelector /> : ""}</Options>

      <Buttons>
        <CornerButton>
          <button className="corner-button" onClick={onMenuClick}>
            <span>MENU</span>
          </button>
        </CornerButton>
        {roomOwner ? (
          <CornerButton>
            <button className="corner-button" onClick={onStartClick}>
              <span>START GAME</span>
            </button>
          </CornerButton>
        ) : (
          ""
        )}
      </Buttons>
    </Container>
  );
};

export default PrivateLobby;

const Container = styled.div`
  width: 100vw;

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .users-table > .table {
      width: 400px;
      font-size: ${(props) => props.theme.fontSizes.text};
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    .code-container > .code {
      font-size: ${(props) => props.theme.fontSizes.mainText.sm};
    }

    .code-container > .label {
      font-size: ${(props) => props.theme.fontSizes.label};
    }

    .users-table > .table {
      width: 320px;
    }
  }
`;

const Options = styled.div`
  margin-top: 50px;
  margin-bottom: 50px;
`;

const Buttons = styled.div`
  width: 100%;

  display: flex;
  justify-content: space-around;
`;

const UsersTable = styled.div`
  margin-top: 50px;
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;

  .table {
    width: 655px;
    font-size: ${(props) => props.theme.fontSizes.label};
  }

  .table-header {
    background: ${(props) => props.theme.colors.darkBackground};
    height: 58px;

    .table-header-content {
      width: 95%;
      margin-left: 2.5%;

      display: flex;
      align-items: center;
      height: 100%;

      .number {
        width: 15%;
        text-align: center;
      }

      .username {
        width: 45%;
      }

      .speed {
        width: 25%;
      }

      .acc {
        width: 15%;
      }
    }
  }

  .data-points {
    background: ${(props) => props.theme.colors.lightBackground};
    display: block;
    flex-direction: column;
    overflow-y: scroll !important;
    max-height: 235px;

    .data-point {
      width: 95%;
      margin-left: 2.5%;
      margin-top: 10px;
      margin-bottom: 10px;
      height: 43px !important;
      display: flex;
      align-items: center;
      background: ${(props) => props.theme.colors.darkBackground};
      border-radius: 10px;

      .data-point-number {
        text-align: center;

        width: 15%;
      }
      .data-point-username {
        width: 45%;
      }
      .data-point-speed {
        width: 25%;
      }
      .data-point-acc {
        width: 15%;
      }

      .icon {
        color: ${(props) => props.theme.colors.special};
        font-size: ${(props) => props.theme.fontSizes.text};
        margin-left: 5px;
      }
    }

    .data-point:first-child {
      margin-top: 20px !important;
    }

    .data-point:last-child {
      margin-bottom: 20px !important;
    }
  }
`;

const CodeContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    color: ${(props) => props.theme.colors.accent};
    font-size: ${(props) => props.theme.fontSizes.largeLabel};
    margin: 0px;
  }

  .code {
    font-size: ${(props) => props.theme.fontSizes.mainText.default};
    margin-top: 0px;
    text-decoration: 12px underline ${(props) => props.theme.colors.accent};
  }
`;
