import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import CountUp from "react-countup";
import { useTheme } from "styled-components";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Label,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import {
  nextRacePrivateReset,
  privateRoomReset,
  setStartPrivateGame,
} from "../../redux/privateSlice";
import {
  backToLobbyReset,
  reset,
  setKeepTypingText,
  setSavedData,
  setTypingBackgroundInfo,
  setTypingText,
} from "../../redux/typingSlice";
import { socket } from "../../Socket";
import {
  multiplayerMainMenuReset,
  nextRaceMultiplayerReset,
  setHasRaceStarted,
  setLookingForRoom,
} from "../../redux/multiplayerSlice";
import { GAME_MODES, PAGES } from "../../../constants/constants.json";
import axios from "axios";
import { setUser, setUserStats } from "../../redux/userSlice";
import CornerButton from "../styles/CornerButton";

const NumberInfo = () => {
  const API = import.meta.env.VITE_API;
  const [currentOption, setCurrentOption] = useState(0); // 0 == graph / 1 == text

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const mistakes = useSelector((state) => state.typing.mistakes);
  const typingText = useSelector((state) => state.typing.typingText);
  const wpmRecord = useSelector((state) => state.typing.wpmRecord);
  const typingBackgroundInfo = useSelector(
    (state) => state.typing.typingBackgroundInfo
  );
  const typingType = useSelector((state) => state.typing.typingType);
  const wordsTyped = useSelector((state) => state.typing.wordsTyped);
  const typingMode = useSelector((state) => state.typing.typingMode);
  const savedData = useSelector((state) => state.typing.savedData);
  const mistakesList = useSelector((state) => state.typing.mistakesList);

  const roomOwner = useSelector((state) => state.private.roomOwner);
  const roomID = useSelector((state) => state.multiplayer.roomID);

  const racePlacement = useSelector((state) => state.multiplayer.racePlacement);

  const user = useSelector((state) => state.user.user);
  const userStats = useSelector((state) => state.user.userStats);

  const currentPage = useSelector((state) => state.user.currentPage)

  const privateGameTypingParams = useSelector(
    (state) => state.private.privateGameTypingParams
  );

  const prompts = ["WPM", "Accuracy", "Time", "Mistakes"];

  const roomOwnerRef = useRef(roomOwner);

  useEffect(() => {
    roomOwnerRef.current = roomOwner;
  }, [roomOwner]);

  const onHomeClick = () => {
    if (typingMode !== GAME_MODES.SANDBOX) {
      socket.emit("leave_room", typingMode, roomID);
      socket.emit("pre_disconnect", [typingMode, roomID]);
      socket.disconnect();
    }
    dispatch(multiplayerMainMenuReset());
    dispatch(backToLobbyReset());
    if (currentPage == PAGES.PRIVATE) dispatch(privateRoomReset());

    navigate("/");
  };

  // wpm, accuracy, time, mistakes
  const values = [
    wpmRecord[wpmRecord.length - 1].wpm,
    Math.round(
      (typingText.length / (typingText.length + mistakes)) * 100 * 100
    ) / 100,
    wpmRecord[wpmRecord.length - 1].time,
    mistakes,
  ];

  useEffect(() => {
    if (racePlacement == 0 || typingMode == GAME_MODES.SANDBOX) return; // the race placement updates after this runs so without this it would just have race placement = 0 for all

    if (!user) {
      console.log("Race placement: " + racePlacement);
      // if guest user
      const mostRecentWpm = values[0];
      const mostRecentAccuracy = values[1];
      const totalRaces = userStats.totalRaces + 1;
      const averageWpm = Math.round(
        (userStats.averageWpm * (totalRaces-1) + mostRecentWpm) /
          (totalRaces)
      );
      const averageAccuracy = Math.round(
        (userStats.averageAccuracy * (totalRaces-1) +
          parseInt(mostRecentAccuracy)) /
          (totalRaces)
      );

      console.log(totalRaces);
      const lastTenRacesWpm =
      totalRaces > 10
          ? Math.random((userStats.lastTenRacesWpm * 9 + mostRecentWpm) / 10)
          : averageWpm;
      const lastTenRacesAccuracy =
      totalRaces > 10
          ? Math.round((userStats.lastTenRacesAccuracy * 9 + mostRecentAccuracy) / 10)
          : averageAccuracy;
      const racesWon = userStats.racesWon + (racePlacement == 1 ? 1 : 0);
      const highestWpm =
        userStats.highestWpm > mostRecentWpm
          ? userStats.highestWpm
          : mostRecentWpm;


      const roundedMostRecentAccuracy = Math.round(mostRecentAccuracy)
      dispatch(
        setUserStats({
          averageAccuracy,
          averageWpm,
          guest: true,
          highestWpm,
          lastTenRacesAccuracy,
          lastTenRacesWpm,
          mostRecentWpm,
          mostRecentAccuracy: roundedMostRecentAccuracy,
          racesWon,
          totalRaces,
        })
      );
    }

    if (!user || typingMode == GAME_MODES.SANDBOX || savedData) return;

    const words_id = typingBackgroundInfo.words_id
      ? typingBackgroundInfo.words_id
      : null;
    const quote_id = typingBackgroundInfo.quote_id
      ? typingBackgroundInfo.quote_id
      : null;

    const saveRaceData = async () => {
      const info = {
        user_id: user.user_id,
        words_id,
        quote_id,
        wpm: values[0],
        accuracy: Math.round(values[1]),
        duration: values[2],
        mistakes: mistakesList,
        won: racePlacement == 1,
        ranked: false,
      };

      const response = await axios.post(`${API}/races/track`, info, {
        withCredentials: true,
      });
      dispatch(setUserStats(response.data));
      dispatch(setSavedData(true));
    };

    if (!savedData) {
      saveRaceData();
    }
  }, [racePlacement, savedData]);

  let typedText = typingText.split(" ").slice(0, wordsTyped).join(" ");

  const onBackToLobby = () => {
    dispatch(reset());
    socket.emit("reset_game_values", roomID);
    socket.emit("back_to_lobby", roomID);
    // reset things
    dispatch(setStartPrivateGame(false));
    dispatch(setHasRaceStarted(false));
  };

  const onNextRace = () => {
    if (typingMode == GAME_MODES.MULTIPLAYER) {
      socket.emit("leave_room", typingMode, roomID);
    }
    dispatch(reset());



    if (typingMode == GAME_MODES.MULTIPLAYER) {
      // multiplayer
      dispatch(nextRaceMultiplayerReset());
    } else if (typingMode == GAME_MODES.PRIVATE) {
      socket.emit("reset_game_values", roomID);
      socket.emit(
        "start_game",
        GAME_MODES.PRIVATE,
        roomID,
        typingType,
        privateGameTypingParams
      );
    }
  };

  const onPractice = () => {
    socket.emit("leave_room", typingMode, roomID);
    const backgroundInfo = { ...typingBackgroundInfo };

    dispatch(multiplayerMainMenuReset());
    dispatch(reset());

    dispatch(setKeepTypingText(true));
    dispatch(setTypingBackgroundInfo(backgroundInfo));
    dispatch(
      setTypingText(
        backgroundInfo.typingText
          ? backgroundInfo.typingText
          : backgroundInfo.content
          ? backgroundInfo.content
          : backgroundInfo.quote
      )
    );

    navigate("/sandbox");
  };

  return (
    <Container>
      <MainContent className="main-content">
        <NumberInfoContainer className="number-info-container">
          {prompts.map((prompt, index) => {
            const unit =
              prompt == "Accuracy" ? "%" : prompt == "Time" ? "s" : "";
            return (
              <div
                key={index}
                className={`prompt-container prompt-container-${index}`}
              >
                {racePlacement == 1 && prompt == "WPM" ? (
                  <FontAwesomeIcon icon={faCrown} className="crown" />
                ) : (
                  ""
                )}
                <div className="prompt">{prompt}</div>
                <div>
                  <CountUp
                    className="value"
                    end={values[index]}
                    duration={1}
                    decimals={index == 2 ? 2 : 0}
                  ></CountUp>{" "}
                  {/* for decimals only show decimals on second index (the time) */}
                  <span className="value">{unit}</span>
                </div>
              </div>
            );
          })}
        </NumberInfoContainer>
        <RightSideContainer className="right-side-container">
          <SwitchButtons>
            <button
              className={`option-button left-button ${
                currentOption == 0 ? "highlighted" : ""
              }`}
              onClick={() => setCurrentOption(0)}
            >
              Graph
            </button>
            <button
              className={`option-button right-button ${
                currentOption == 1 ? "highlighted" : ""
              }`}
              onClick={() => setCurrentOption(1)}
            >
              Text
            </button>
          </SwitchButtons>
          <div className="graph-container">
            {currentOption == 0 ? (
              <div className="graph-inner-container">
                <ResponsiveContainer>
                  <ComposedChart data={wpmRecord}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={`${theme.colors.accent}`}
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor={`${theme.colors.accent}`}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={`${theme.colors.darkBackground}`} />
                    <XAxis
                      height={50}
                      dy={10}
                      tickCount={10}
                      angle={0}
                      interval="equidistantPreserveStart"
                      dataKey="time"
                      stroke={`${theme.colors.darkBackground}`}
                      tick={{fill: `${theme.colors.accent}`}}
                    >
                      <Label dy={20} value="Time (Seconds)" position="middle" style={{fill: `${theme.colors.accent}`}} />
                    </XAxis>
                    <YAxis
                      yAxisId="left"
                      stroke={`${theme.colors.darkBackground}`}
                      tick={{fill: `${theme.colors.accent}`}}
                      domain={[0, "dataMax + 30"]}
                      tickCount={6}
                    >
                      <Label
                        dy={20}
                        value="WPM"
                        angle={270}
                        position="insideLeft"
                        style={{fill: `${theme.colors.accent}`}}
                      />
                    </YAxis>
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={`${theme.colors.darkBackground}`}
                      tick={{fill: `${theme.colors.accent}`}}
                      domain={[0, "dataMax + 5"]}
                    >
                      <Label
                        dy={40}
                        value="Mistakes"
                        angle={90}
                        position="insideRight"
                        style={{fill: `${theme.colors.accent}`}}
                      />
                    </YAxis>
                    <Tooltip
                      contentStyle={{
                        background: theme.colors.darkBackground,
                        border: `1px solid ${theme.colors.mediumBackground}`,
                        borderRadius: "5px",
                      }}
                      cursor={{ stroke: "transparent" }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="wpm"
                      stroke={`${theme.colors.accent}`}
                      fillOpacity={1}
                      fill="url(#colorUv)"
                      className="area"
                    />
                    <Line
                      dot={false}
                      yAxisId="right"
                      dataKey="mistakes"
                      fill="transparent"
                      stroke={`${theme.colors.red}`}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-container">
                <div className="text">{typedText}</div>
                <div className="other-info">
                  <div className="author">-{typingBackgroundInfo.author}</div>
                </div>
              </div>
            )}
          </div>
        </RightSideContainer>
      </MainContent>
      <Buttons className="buttons">
        <CornerButton className="button">
          <button className="corner-button" onClick={onHomeClick}>
            <span>Home</span>
          </button>
        </CornerButton>
        <CornerButton className="button">
          <button className="corner-button" onClick={onPractice}>
            <span>Practice</span>
          </button>
        </CornerButton>
        {typingMode == GAME_MODES.PRIVATE && roomOwner ? (
          <CornerButton className="button">
            <button className="corner-button" onClick={onBackToLobby}>
              <span>To Lobby</span>
            </button>
          </CornerButton>
        ) : (
          ""
        )}{" "}
        {/* only allow to go back to lobby if it is private game and user is the owner */}
        {typingMode != GAME_MODES.PRIVATE ||
        (typingMode == GAME_MODES.PRIVATE && roomOwnerRef.current) ? (
          <CornerButton className="button">
            <button className="corner-button " onClick={onNextRace}>
              <span>Next Race</span>
            </button>
          </CornerButton>
        ) : (
          ""
        )}{" "}
        {/* people in private lobby should not be able to start game, only lobby owner*/}
      </Buttons>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  transform: scale(0.85);

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    transform: scale(0.9);

    .right-side-container {
      width: 75vw;
    }

    .number-info-container {
      width: 15vw;
    }
  }
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .main-content {
      display: block !important;
    }
    .right-side-container {
      min-height: 600px;
      margin-left: 0px;
      width: 100vw;
      margin-top: 5px;

      .graph-container {
        margin-bottom: 7px;
      }
    }

    .number-info-container {
      min-height: 200px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 5px;
      width: 100vw;
      height: 20vh;
      margin-top: 5px;

      .prompt-container {
        width: 100%;
        height: 100%;
        /* margin: 2.5px; */
        border: 1px solid ${({ theme: { colors } }) => colors.darkBackground};
      }

      .prompt-container {
        /* width: 50%; */
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .buttons {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      row-gap: 20px;
      column-gap: 20px;

      .button:nth-child(even) {
        display: flex;
        justify-content: flex-start;
      }

      .button:nth-child(odd) {
        display: flex;
        justify-content: flex-end;
      }

      .button:nth-child(odd):last-child {
        grid-column: span 2;
        display: flex;
        justify-content: center;
      }
    }
  }
`;

const BottomRow = styled.div`
  height: 25%;
`;

const SwitchButtons = styled.div`
  position: absolute;
  right: 30px;
  top: 20px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
    rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  height: 30px;
  border-radius: 10px;

  .option-button {
    border: 1px solid ${({ theme: { colors } }) => colors.accent};
    background: ${({ theme: { colors } }) => colors.accent};
    opacity: 0.5;
    width: 100px;
    height: 30px;
    color: white;
    transition: 0.1s linear;
    cursor: pointer;
    /* border: 1px solid black; */
  }

  .right-button {
    /* border-left: none; */
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .left-button {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  .highlighted {
    opacity: 1;
  }

  .red {
    background: ${({ theme: { colors } }) => colors.red};
    opacity: 1;
    border: 1px solid ${({ theme: { colors } }) => colors.red};
  }
`;

const Buttons = styled.div`
  margin-top: 50px;
  top: 30px;
  width: 90vw;
  height: 50px;
  margin-bottom: 50px;

  display: flex;

  justify-content: space-between;

  align-items: center;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  width: 100vw;
`;

const RightSideContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80vw;
  height: 70vh;
  min-height: 300px;

  /* margin-left: 7px; */

  .graph-container,
  .text-container {
    /* height: calc(48% + 6px); */
    width: 100%;
    background: ${(props) => props.theme.colors.lightBackground};
  }

  .graph-container {
    border: 1px solid ${(props) => props.theme.colors.darkBackground};
    height: 100%;
    border-bottom: none;
    width: 100%;

    border-bottom: none;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .graph-inner-container {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 95%;
    height: 80%;
    padding-top: 20px;
  }
  .text-container {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .text {
    width: 85%;
    height: 50%;
    background: ${(props) => props.theme.colors.mediumBackground};
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    margin-top: 10px;
    padding: 10px 20px;
    font-size: ${(props) => props.theme.fontSizes.text};
    overflow-y: auto;
  }

  .other-info {
    display: flex;
    align-items: center;
    width: 85%;
    height: 10%;
    background: ${(props) => props.theme.colors.mediumBackground};
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding: 10px 20px;
  }
`;

const NumberInfoContainer = styled.div`
  width: 10vw;
  height: 70vh;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex-wrap: wrap;

  .prompt-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: calc(25%);
    background: ${(props) => props.theme.colors.lightBackground};
    border: 1px solid ${(props) => props.theme.colors.darkBackground};
    border-right: none;
    /* margin: 2.5px 0px; */
    /* box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px; */
    position: relative !important;
  }

  .prompt-container-1 {
    border-top: none;
  }

  .prompt-container-2 {
    border-bottom: none;
    border-top: none;
  }

  .prompt {
    color: ${(props) => props.theme.colors.accent};
    font-size: ${(props) => props.theme.fontSizes.label};
  }

  .value {
    font-size: ${(props) => props.theme.fontSizes.largeLabel} !important;
  }

  .crown {
    position: absolute;
    font-size: 35px;
    top: -10px;
    right: -10px;
    color: ${({ theme: { colors } }) => colors.special};
    padding: 10px;
    border-radius: 50%;
  }
`;

export default NumberInfo;
