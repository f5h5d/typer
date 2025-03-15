import React, { useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import { socket } from "../../Socket";
import {
  setInitalOtherPlayersData,
  setOtherPlayersData,
  setSocketID,
} from "../../redux/multiplayerSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  reset,
  setTypingBackgroundInfo,
  setTypingText,
} from "../../redux/typingSlice";
const OtherPlayersPercentageComplete = ({ typingRef }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const otherPlayersData = useSelector(
    (state) => state.multiplayer.otherPlayersData
  );

  const findDisplayData = (userData) => {
    const screenSize = window.innerWidth;
    const xs = +theme.breakpoints.xs.substring(0, theme.breakpoints.xs.length - 2);
    const sm = +theme.breakpoints.sm.substring(0, theme.breakpoints.sm.length - 2);
    const md = +theme.breakpoints.md.substring(0, theme.breakpoints.md.length - 2);
    const lg = +theme.breakpoints.lg.substring(0, theme.breakpoints.lg.length - 2);

    if (screenSize <= xs) {
      return {
        mostRecentWpm: userData.mostRecentWpm,
        lastTenRacesWpm: userData.lastTenRacesWpm,
      };
    } else if (screenSize <= sm) {
      return {
        mostRecentWpm: userData.mostRecentWpm,
        lastTenRacesWpm: userData.lastTenRacesWpm,
        highestWpm: userData.highestWpm,
        averageWpm: userData.averageWpm,
      };
    } else if (screenSize <= md || screenSize <= lg) {
      return {
        mostRecentWpm: userData.mostRecentWpm,
        totalRaces: userData.totalRaces,
        lastTenRacesWpm: userData.lastTenRacesWpm,
        highestWpm: userData.highestWpm,
        averageWpm: userData.averageWpm,
        totalRacesWon: userData.totalRacesWon,
      };
    } else {
      return {
        mostRecentWpm: userData.mostRecentWpm,
        averageAccuracy: userData.averageAccuracy,
        totalRaces: userData.totalRaces,
        mostRecentAccuracy: userData.mostRecentAccuracy,
        lastTenRacesWpm: userData.lastTenRacesWpm,
        highestWpm: userData.highestWpm,
        averageWpm: userData.averageWpm,
        lastTenRacesAccuracy: userData.lastTenRacesAccuracy,
        totalRacesWon: userData.totalRacesWon,
      };
    }
  };

  return (
    <>
      {Object.keys(otherPlayersData).map((data, index) => {
        const hoverData = findDisplayData(otherPlayersData[data])

        const { wpm, currentWord, percentage, username } =
          otherPlayersData[data];
        return (
          <>
            <PercentageCompleteContainer
              key={index}
            >
              <Percentage percent={percentage} className="percent">
                <div className="wpm-container">
                  <p className="wpm">{wpm} wpm</p>
                </div>
                <div className="outline">
                  <div className="inline"></div>
                </div>
                <div className="username-container">
                  <p className="username">{username}</p>
                </div>
              </Percentage>
              <MoreInfo className="more-info">
                {Object.keys(hoverData).map((dataPoint) => {
                  let label = dataPoint
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .toLowerCase(); // converts label from camel case to normal

                  label = label.replace("races", "");
                  label = label.replace("most", "");
                  return (
                    <div className="point-container">
                      <div className="left-side">{label}</div>
                      <div className="right-side">
                        {otherPlayersData[data][dataPoint]}
                      </div>
                    </div>
                  );
                })}
              </MoreInfo>
            </PercentageCompleteContainer>
          </>
        );
      })}
    </>
  );
};

const MoreInfo = styled.div`
  width: 60vw;
  /* padding: 0 5vw; */
  height: 0px;
  background: ${(props) => props.theme.colors.mediumBackground};
  border-radius: 0 0 10px 10px;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  place-items: center;
  transition: opacity 0.6s ease, transform 0.9s ease;
  visibility: hidden;
  .point-container {
    width: 205px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 33%;

    margin: 0 10px;
  }

  /* overflow-x: hidden !important; */
`;

const PercentageCompleteContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    .more-info {
      .point-container {
        width: 150px;
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .percent,
    .more-info {
      width: 70%;
    }

    .more-info {
      width: 70%;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .more-info {
      width: 80%;
      grid-template-columns: repeat(2, 1fr);
    }
    .percent {
      width: 80%;
      justify-content: space-between;

      .wpm {
        margin-left: 25px;
      }

      .username {
        margin-right: 25px;
      }
      .outline {
        display: none !important;
      }

      .username-container {
        width: 50%;
        justify-content: flex-end;
      }

      .wpm-container {
        width: 50%;
        justify-content: flex-start;
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    .more-info {
      grid-template-columns: repeat(1, 1fr);
    }
  }
`;

const Percentage = styled.div`
  width: 60vw;
  padding: 5px 10px;

  margin: 10px 0px;

  background: ${(props) => props.theme.colors.lightBackground};
  border-radius: 10px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* overflow-x: hidden !important; */

  &:active {
    border-radius: 10px 10px 0px 0px;
    margin-bottom: 0px;
    ~ .more-info {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
      height: 85px !important;
      visibility: visible;
    }
  }

  .username-container {
    width: 25%;
    display: flex;
    justify-content: center;
  }

  .wpm-container {
    width: 25%;
    display: flex;
    justify-content: center;
  }

  .username,
  .wpm {
    text-align: center;
    background: ${(props) => props.theme.colors.mediumBackground};
    padding: 5px 15px;
    border-radius: 10px;
  }

  .wpm {
    width: 70px;
    padding: 5px 0px;
  }

  .outline {
    width: 50%;
    height: 5px;
    border-radius: ${(props) => (props.percent > 1 ? "10" : "0")}px;
    border-radius: 10px;
    background: ${(props) => props.theme.colors.textDark};

    display: flex;
  }

  .inline {
    border-radius: ${(props) => (props.percent > 1 ? "10" : "0")}px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    height: 100%;
    width: ${(props) => props.percent}%;
    background: ${(props) => props.theme.colors.accent};
    position: relative;
  }
`;

export default OtherPlayersPercentageComplete;
