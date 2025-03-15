import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import "react-simple-keyboard/build/css/index.css";
import TypingTracker from "./TypingTracker";
import TypingSection from "./TypingSection";
import PercentageComplete from "./PercentageComplete";
import { useDispatch, useSelector } from "react-redux";
import NumberInfo from "./NumberInfo";
import {
  reset,
  setSelectedLength,
  setStartTime,
  setTotalTime,
  setTypingBackgroundInfo,
  setTypingText,
  setTypingType,
} from "../../redux/typingSlice";
import OtherPlayersPercentageComplete from "../multiplayer/OtherPlayersPercentageComplete";
import {
  setHasRaceStarted,
  setIsMultiplayer,
  setOtherPlayersData,
  setPreRaceTimer,
  setRacePlacement,
  setSocketID,
} from "../../redux/multiplayerSlice";
import { socket } from "../../Socket";
import OptionSelector from "../sandbox/OptionSelector";
import { GAME_MODES } from "../../../constants/constants.json";
import { useNavigate } from "react-router-dom";

const MainTypingGame = ({ lookingForRoomRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const finishedTest = useSelector((state) => state.typing.finishedTest);
  const wpm = useSelector((state) => state.typing.wpm);
  const wordsTyped = useSelector((state) => state.typing.wordsTyped);
  const typingText = useSelector((state) => state.typing.typingText);
  const wpmRecord = useSelector((state) => state.typing.wpmRecord);
  const typingMode = useSelector((state) => state.typing.typingMode);
  const mistakes = useSelector((state) => state.typing.mistakes);
  const typedAtAll = useSelector((state) => state.typing.typedAtAll);
  const typingRef = useRef(null);

  const preRaceTimer = useSelector((state) => state.multiplayer.preRaceTimer);
  const hasRaceStarted = useSelector(
    (state) => state.multiplayer.hasRaceStarted
  );
  const roomID = useSelector((state) => state.multiplayer.roomID);

  const user = useSelector((state) => state.user.user);

  const percentage = (wordsTyped / typingText.split(" ").length) * 100;

  const accuracy = 100;

  const userStats = useSelector((state) => state.user.userStats);

  const typingModeRef = useRef(null);

  // useEffect(() => {
  //   console.log("GHI")
  // })

  useEffect(() => {
    typingModeRef.current = typingMode;
  }, [typingMode]);

  // for when user reloads => adds property to session storage to tell it reloaded after reload complete ==> should only happen for multiplayer mode
  useEffect(() => {

    const handleBeforeUnload = (e) => {
      if (typingModeRef.current == GAME_MODES.MULTIPLAYER) {
        sessionStorage.setItem("reloadedPage", "true");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [typingModeRef]);

  // checks if user reloaded, if they did then sends them back to the main page cuz in this page they are currently typing and after reload they should go back to main
  useEffect(() => {
    if (sessionStorage.getItem("reloadedPage") === "true") {
      navigate("/");
      navigate(0);
      sessionStorage.removeItem("reloadedPage");
    }
  }, []);

  useEffect(() => {
    const onUpdatePrivateTypingParams = ({ typingType, selectedLength }) => {
      dispatch(setTypingType(typingType));
      dispatch(setSelectedLength(selectedLength));

      if (typingType == 1) {
        if (selectedLength == 4) {
          dispatch(setTotalTime(30));
        } else if (selectedLength == 5) {
          dispatch(setTotalTime(60));
        }
      }
    };
    const onInitializeTypingQuote = (data) => {
      // dispatch(reset())
      dispatch(setTypingText(data.typingText));
      dispatch(setTypingBackgroundInfo(data));
      typingRef.current.value = "";
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

    const onPreGameTimer = (data) => {
      console.log(typingMode, GAME_MODES.SANDBOX )
      dispatch(setPreRaceTimer(data));
      if (data == -1) {
        dispatch(setHasRaceStarted(true));
        setTimeout(() => {
          dispatch(setStartTime(Date.now()));
        }, 300);
      }
    };

    const updateUsersData = (data) => {
      const users = {};
      for (let x in data) {
        // loop through and keep everyone but the user
        if (data[x].id !== socket.id) users[data[x].id] = data[x];
      }

      dispatch(setOtherPlayersData(users));
    };

    const onUserFinishedPosition = (data) => {
      dispatch(setRacePlacement(data));
    };

    socket.on("update_private_typing_params", onUpdatePrivateTypingParams);
    socket.on("initialize_typing_quote", onInitializeTypingQuote);

    socket.on("initialize_user_data_for_others", onInitializeUserDataForOthers);

    socket.on("initialize_other_users_data", onInitializeOtherUsersData);

    socket.on("pre_game_timer", onPreGameTimer);

    socket.on("update_users_data", updateUsersData);

    socket.on("user_finished_position", onUserFinishedPosition);

    return () => {
      socket.off("initialize_typing_quote", onInitializeTypingQuote);
      socket.off(
        "initialize_user_data_for_others",
        onInitializeUserDataForOthers
      );
      socket.off("initialize_other_users_data", onInitializeOtherUsersData);
      socket.off("pre_game_timer", onPreGameTimer);
      socket.off("update_users_data", updateUsersData);
      socket.off("user_finished_position", onUserFinishedPosition);
    };
  }, [socket, dispatch]);

  const username = user ? user.username : "Guest";

  useEffect(() => {
    if (socket.id == undefined || !roomID) return; // return if socket doesnt exist yet or if roomID not assigneed yet
    socket.emit("update_users_scores", typingMode, roomID, {
      username: username,
      wpm: wpm,
      currentWord: typingText.split(" ")[wordsTyped],
      percentage: percentage,
      id: socket.id,
    });
  }, [wpmRecord]);

  useEffect(() => {
    if (!finishedTest || typingMode == GAME_MODES.SANDBOX) return;

    socket.emit("user_finished_test", typingMode, roomID, {
      username: username,
      wpm: wpm,
      currentWord: "",
      percentage: 100,
      id: socket.id,
      accuracy:
        Math.round(
          (typingText.length / (typingText.length + mistakes)) * 100 * 100
        ) / 100,
    });
  }, [finishedTest]);

  return (
    <>
      {finishedTest ? (
        <PostTypingContainer>
          <PercentageCompleteSection>
            <div className="percentages-container">
              <PercentageComplete />
              <OtherPlayersPercentageComplete typingRef={typingRef} />
            </div>
          </PercentageCompleteSection>
          <NumberInfo />
        </PostTypingContainer>
      ) : (
        <Container>
          {!hasRaceStarted && typingMode !== GAME_MODES.SANDBOX ? (
            <PreRaceTimer>
              <div className="timer">{preRaceTimer}</div>
            </PreRaceTimer>
          ) : (
            ""
          )}
          <PercentageCompleteSection>
            <div className="percentages-container">
              <PercentageComplete />
              <OtherPlayersPercentageComplete typingRef={typingRef} />
            </div>
          </PercentageCompleteSection>
          <TypingContainer>
            <TypingTracker />
            <TypingSection typingRef={typingRef} />
          </TypingContainer>

          <Info>
            {typingMode == GAME_MODES.SANDBOX && !typedAtAll ? (
              <p>press tab to reset...</p>
            ) : (
              ""
            )}
          </Info>
          <Options className={`${typingMode == GAME_MODES.SANDBOX ? "" : "options-invisible"}`}>
            {typingMode == GAME_MODES.SANDBOX ? (
              <OptionSelector typingRef={typingRef} />
            ) : (
              ""
            )}
          </Options>
        </Container>
      )}
    </>
  );
};

export default MainTypingGame;

const PreRaceTimer = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  background: ${(props) => props.theme.colors.darkBackground};
  z-index: 10000;
  top: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  .timer {
    width: 100px;
    height: 100px;
    background: ${(props) => props.theme.colors.mainBackground};
    color: ${(props) => props.theme.colors.accent};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50px;
    font-weight: bold;
    border-radius: 10px;
  }
`;

const Info = styled.div`
  height: 150px;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    font-size: ${(props) => props.theme.fontSizes.label};
    color: ${(props) => props.theme.colors.textDark};
  }
`;
const Container = styled.div`
  /* max-height: 100vh; */
  width: 100vw;
  overflow-y: hidden !important;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;

  /* overflow-y: auto; */
  overflow-x: hidden;

  .options-invisible {
    display: none;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .percentages-container {
      width: 100vw !important;
    }
  }
`;

const PostTypingContainer = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const TypingContainer = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Options = styled.div`
  height: 15vh;
`;

const PercentageCompleteSection = styled.div`
  overflow-y: auto;

  display: flex;

  flex-direction: column;

  justify-content: space-evenly;

  margin-bottom: 50px;

  .percentages-container {
    display: flex;
    flex-direction: column;

    min-height: 105px;
    max-height: 230px;

    border-radius: 2px;
    width: 65vw;
  }
`;
