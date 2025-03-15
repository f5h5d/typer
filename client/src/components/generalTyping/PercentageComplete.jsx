import React from 'react'
import { useSelector } from 'react-redux';
import styled from "styled-components"

const PercentageComplete = () => {
  const wordsTyped = useSelector((state) => state.typing.wordsTyped);
  const typingText = useSelector((state) => state.typing.typingText);
  const wpm = useSelector((state) => state.typing.wpm);
  const typingType = useSelector((state) => state.typing.typingType);
  const selectedLength = useSelector((state) => state.typing.selectedLength);
  const totalTime = useSelector((state) => state.typing.totalTime)
  const elapsedTime = useSelector((state) => state.typing.elapsedTime)

  const socketID = useSelector((state) => state.multiplayer.socketID)

  const user = useSelector((state) => state.user.user)

  let percent = 0
  if (typingType == 0 || (typingType == 1 && selectedLength < 4)) { // if percent should be based on words completed
    percent = (wordsTyped / typingText.split(" ").length) * 100;
  } else { // percent should be based on time
    percent = ((Math.trunc(elapsedTime/1000)) / totalTime) * 100
  }
  return (
    <PercentageCompleteContainer>
      <Percentage percent={percent}>
        <div className="wpm-container">
          <p className="wpm">{wpm} wpm</p>
        </div>
        <div className="outline">
          <div className="inline">
          </div>
          <div className="dot-container">
          </div>
        </div>
        <div className="username-container">
          <p className="username">{user == null ? "Guest" : user.username}</p>
        </div>
      </Percentage>
    </PercentageCompleteContainer>
  )
}


const PercentageCompleteContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

`

const Percentage = styled.div`
  width: 60vw;
  padding: 5px 10px;

  margin: 10px 0px;

  background: ${props => props.theme.colors.lightBackground};
  border-radius: 10px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;

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

  .username, .wpm {
    text-align: center;
    background: ${props => props.theme.colors.mediumBackground};
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
    border-radius: ${props => props.percent > 1 ? "10" : "0"}px;
    border-radius: 10px;
    background: ${props => props.theme.colors.textDark};

    display: flex;

  }

  .inline {
    border-radius: ${props => props.percent > 1 ? "10" : "0"}px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    height: 100%;
    width: ${props => props.percent}%;
    background: ${props => props.theme.colors.accent};
    position: relative;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 70%;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
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
`

export default PercentageComplete