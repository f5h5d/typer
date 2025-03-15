import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "react-simple-keyboard/build/css/index.css";
import { Link } from "react-router-dom";
import { setLookingForRoom, setMode } from "../redux/multiplayerSlice";
import { useDispatch, useSelector } from "react-redux";
import { GAME_MODES, PAGES, TYPING_TYPE } from "../../constants/constants.json";
import { setTypingType } from "../redux/typingSlice";
import { setCurrentPage } from "../redux/userSlice";
import CornerButton from "../components/styles/CornerButton";
import axios from "axios";
const Main = () => {
  const API = import.meta.env.VITE_API;
  const dispatch = useDispatch();
  const [leaderboardData, setLeaderboardData] = useState([]);
  useEffect(() => {
    dispatch(setCurrentPage(PAGES.HOME));

    axios
      .get(`${API}/races/highestWpm`, { withCredentials: true })
      .then((response) => {
        setLeaderboardData(response.data);
      }).catch(err => {
        toast.error(err.response.data.message);
      })
  }, []);

  return (
    <Container>
      <MainContent>
        <h1 className="main-text">
          practice typing <span className="text-underline">now.</span>
        </h1>
        <div className="buttons">
          <CornerButton className="button">
            <Link
              to="/multiplayer"
              onClick={() => {
                dispatch(setMode(GAME_MODES.MULTIPLAYER));
                dispatch(setTypingType(TYPING_TYPE.QUOTES));
                dispatch(setLookingForRoom(true));
              }}
            >
              <button className="corner-button">
                <span>MULTIPLAYER (QUOTE)</span>
              </button>
            </Link>
          </CornerButton>

          <CornerButton className="button">
            <Link
              to="/multiplayer"
              onClick={() => {
                dispatch(setMode(GAME_MODES.MULTIPLAYER));
                dispatch(setTypingType(TYPING_TYPE.WORDS));
                dispatch(setLookingForRoom(true));
              }}
            >
              <button className="corner-button">
                <span>MULTIPLAYER (DICTIONARY)</span>
              </button>
            </Link>
          </CornerButton>

          <CornerButton className="button">
            <Link
              to="/private-race"
              onClick={() => {
                dispatch(setMode(GAME_MODES.MULTIPLAYER));
                dispatch(setTypingType(TYPING_TYPE.WORDS)); // fix this later
              }}
            >
              <button className="corner-button">
                <span>PRIVATE ROOMS</span>
              </button>
            </Link>
          </CornerButton>

          <CornerButton className="button">
            <Link to="/sandbox">
              <button className="corner-button">
                <span>SANDBOX</span>
              </button>
            </Link>
          </CornerButton>
        </div>
      </MainContent>

      <Leaderboard>
        <div className="leaderboard-text">all time leaderboard</div>
        <div className="leaderboard-header">
          <div className="number">#</div>
          <div className="username">name</div>
          <div className="speed">speed</div>
          <div className="time-ago">time ago</div>
        </div>
        {leaderboardData.map((dataPoint, index) => {
          const daysSince = Math.floor(
            (Date.now() - Date.parse(dataPoint.createdAt)) / 86400000
          );
          return (
            <div
              key={index}
              className={`data-point ${
                index % 2 == 1 ? "data-point-odd" : ""
              } ${
                index == leaderboardData.length - 1 ? "data-point-last" : ""
              } `}
            >
              <div className="data-point-number">{index + 1}.</div>
              <div className="data-point-username">{dataPoint.username}</div>
              <div className="data-point-speed">{dataPoint.wpm}wpm</div>
              <div className="data-point-time-ago">
                {daysSince} Days{" "}
                <span className="invisible-when-small">ago</span>
              </div>
            </div>
          );
        })}
      </Leaderboard>
    </Container>
  );
};

const Container = styled.div`
  /* width: 100vw; */
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    .main-text {
      font-size: ${(props) => props.theme.fontSizes.mainText.md} !important;
    }

    .buttons {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      row-gap: 20px;
    }

    .button:nth-child(even) {
      display: flex;
      justify-content: flex-start;
    }
    .button:nth-child(odd) {
      display: flex;
      justify-content: flex-end;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .main-text {
      font-size: ${(props) => props.theme.fontSizes.mainText.sm} !important;
    }

    .buttons {
      display: grid !important;
      grid-template-columns: repeat(1, 1fr) !important;
      row-gap: 20px;
    }

    .button {
      justify-content: center !important;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    .main-text {
      font-size: ${(props) => props.theme.fontSizes.mainText.xs} !important;
    }

    .invisible-when-small {
      display: none;
    }
    .leaderboard-header {
      width: 320px !important;
    }
  }
`;

const Leaderboard = styled.div`
  margin-top: 50px;
  margin-bottom: 50px;

  .leaderboard-text {
    width: 100%;
    text-align: center;
    margin-bottom: 5px;
    text-decoration: 1px underline ${(props) => props.theme.colors.accent};
  }
  .leaderboard-header {
    display: flex;
    align-items: center;
    width: 400px;
    height: 25px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background: ${(props) => props.theme.colors.darkBackground};

    .number {
      /* outline: 1px solid brown; */
      width: 10%;
      text-align: center;
    }

    .username {
      /* outline: 1px solid brown; */
      width: 35%;
    }

    .speed {
      /* outline: 1px solid brown; */
      width: 25%;
    }

    .time-ago {
      /* outline: 1px solid brown; */
      width: 30%;
    }
  }

  .data-point-odd {
    background: ${(props) => props.theme.colors.lightBackground};
  }

  .data-point-last {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  .data-point {
    display: flex;
    height: 40px;
    align-items: center;

    .data-point-number {
      /* outline: 1px solid brown; */
      width: 10%;
      text-align: center;
    }

    .data-point-username {
      /* outline: 1px solid brown; */
      width: 35%;
    }

    .data-point-speed {
      /* outline: 1px solid brown; */
      width: 25%;
    }

    .data-point-time-ago {
      /* outline: 1px solid brown; */
      width: 30%;
    }
  }
`;

const MainContent = styled.div`
  .main-text {
    text-align: center;
    font-size: ${(props) => props.theme.fontSizes.mainText.default};
    margin-bottom: 30px;
    margin-left: 50px;
    margin-right: 50px;

    .text-underline {
      text-decoration: 6px ${(props) => props.theme.colors.accent} underline;
    }
  }

  .buttons {
    display: flex;
    justify-content: center;
    .corner-button {
      margin: 0 20px;
    }
  }
`;

export default Main;
