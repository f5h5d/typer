import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  setElapsedTime,
  setEndTime,
  setFinishedTest,
  setWpm,
  setWpmRecord,
  setRestart,
  setLastSecondRecorded,
} from "../../redux/typingSlice";

const TypingTracker = () => {
  const dispatch = useDispatch();
  const typingText = useSelector((state) => state.typing.typingText);
  const userTyped = useSelector((state) => state.typing.userTyped);
  const wordsTyped = useSelector((state) => state.typing.wordsTyped);
  const startTime = useSelector((state) => state.typing.startTime);
  const wpm = useSelector((state) => state.typing.wpm);
  const wpmRecord = useSelector((state) => state.typing.wpmRecord);
  const mistakes = useSelector((state) => state.typing.mistakes);
  const finishedTest = useSelector((state) => state.typing.finishedTest);
  const typingType = useSelector((state) => state.typing.typingType);
  const selectedLength = useSelector((state) => state.typing.selectedLength);
  const typedAtAll = useSelector((state) => state.typing.typedAtAll);
  const elapsedTime = useSelector((state) => state.typing.elapsedTime);
  const totalTime = useSelector((state) => state.typing.totalTime);
  const lastTyped = useSelector((state) => state.typing.lastTyped);
  const lastSecondRecorded = useSelector(
    (state) => state.typing.lastSecondRecorded
  );

  const preRaceTimer = useSelector((state) => state.multiplayer.preRaceTimer);
  const isMultiplayer = useSelector((state) => state.multiplayer.isMultiplayer);
  const hasRaceStarted = useSelector(
    (state) => state.multiplayer.hasRaceStarted
  );
  const deltaTime = useRef(startTime);

  const wpmRef = useRef(wpm);
  const mistakesRef = useRef(mistakes);
  const wordsTypedRef = useRef(wordsTyped);
  const wpmRecordRef = useRef(wpmRecord);
  const typingTextRef = useRef(typingText);
  const startTimeRef = useRef(startTime);
  const typedAtAllRef = useRef(typedAtAll);
  const selectedTypeRef = useRef(typingType);
  const selectedLengthRef = useRef(selectedLength);
  const totalTimeRef = useRef(totalTime);
  const lastTypedRef = useRef(lastTyped);
  const isMultiplayerRef = useRef(isMultiplayer);
  const preRaceTimerRef = useRef(preRaceTimer);
  const hasRaceStartedRef = useRef(hasRaceStarted);
  const lastSecondRecordedRef = useRef(lastSecondRecorded);

  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

  useEffect(() => {
    mistakesRef.current = mistakes;
  }, [mistakes]);

  useEffect(() => {
    wordsTypedRef.current = wordsTyped;
  }, [wordsTyped]);

  useEffect(() => {
    wpmRecordRef.current = wpmRecord;
  }, [wpmRecord]);

  useEffect(() => {
    typingTextRef.current = typingText;
  }, [typingText]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    typedAtAllRef.current = typedAtAll;
  }, [typedAtAll]);

  useEffect(() => {
    selectedTypeRef.current = typingType;
  }, [typingType]);

  useEffect(() => {
    selectedLengthRef.current = selectedLength;
  }, [selectedLength]);

  useEffect(() => {
    totalTimeRef.current = totalTime;
  }, [totalTime]);

  useEffect(() => {
    lastTypedRef.current = lastTyped;
  }, [lastTyped]);

  useEffect(() => {
    isMultiplayerRef.current = isMultiplayer;
  }, [isMultiplayer]);

  useEffect(() => {
    preRaceTimerRef.current = preRaceTimer;
  }, [preRaceTimer]);

  useEffect(() => {
    hasRaceStartedRef.current = hasRaceStarted;
  }, [hasRaceStarted]);
  useEffect(() => {
    lastSecondRecordedRef.current = lastSecondRecorded;
  }, [lastSecondRecorded]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      if (
        (!isMultiplayerRef.current && !typedAtAllRef.current) ||
        (isMultiplayerRef.current && !hasRaceStartedRef.current)
      ) {
        return; // Don't track time if race hasn't started
      }

      const elapsedTime = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      ); // Track whole seconds only

      // Ensure each second is recorded **only once**
      if (
        elapsedTime > lastSecondRecordedRef.current &&
        startTimeRef.current !== 0
      ) {
        // needs startTimeRef.current !== 0 because if it is not set in time, elapsed time is a massive number making wpm always 0
        dispatch(setLastSecondRecorded(elapsedTime)); // Update last recorded second

        if ((Date.now() - lastTypedRef.current) / 1000 > 20) {
          dispatch(setRestart(true)); // If user hasn't typed for 20s, reset
        }

        if (selectedTypeRef.current == 0 || selectedLengthRef.current >= 4) {
          dispatch(setElapsedTime(Date.now() - startTimeRef.current));

          if (totalTimeRef.current > 0 && elapsedTime >= totalTimeRef.current) {
            dispatch(setEndTime(Date.now()));
            dispatch(setFinishedTest(true));
          }
        }

        // Fix WPM calculation & ensure correct updates
        const lettersTyped = typingTextRef.current
          .split(" ")
          .slice(0, wordsTypedRef.current)
          .join(" ").length;
        const newWpm = Math.round(
          (lettersTyped / 5 / ((Date.now() - startTimeRef.current) / 60000))
        );

        
        dispatch(setWpm(newWpm));

        if (elapsedTime !== 0) {
          // do not want to keep track on the 0th second because wpm will always be 0
          dispatch(
            setWpmRecord([
              ...wpmRecordRef.current,
              { time: elapsedTime, wpm: newWpm, mistakes: mistakesRef.current },
            ])
          );
        }
      }
    }, 150); // Increase interval to 50ms for better accuracy

    return () => clearInterval(intervalID);
  }, [
    wpmRef,
    mistakesRef,
    wordsTypedRef,
    wpmRecordRef,
    typingTextRef,
    startTimeRef,
    typedAtAllRef,
    selectedTypeRef,
    selectedLengthRef,
    totalTimeRef,
    lastTypedRef,
    isMultiplayerRef,
    preRaceTimerRef,
    hasRaceStartedRef,
    lastSecondRecordedRef,
  ]);

  const accuracy = Math.round(
    (typingText.length / (mistakes + typingText.length)) * 100
  );
  let firstSection = "";

  if (typingType == 0) {
    firstSection = `${Math.trunc(elapsedTime / 1000)}s`;
  } else if (selectedLength >= 4) {
    firstSection = `${totalTime - Math.trunc(elapsedTime / 1000)}s`;
  } else {
    firstSection = `${wordsTyped}/${typingText.split(" ").length} words`;
  }
  return (
    <Container>
      <div className="tracking-container">
        <div className="first-section">{firstSection}</div>
        <div className="wpm">{wpm}wpm</div>
        <div className="acc">{accuracy}%</div>
      </div>
    </Container>
  );
};

export default TypingTracker;

const Container = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;

  .tracking-container {
    width: 60vw;
    height: 25px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    background: ${(props) => props.theme.colors.lightBackground};

    border-top-left-radius: 2px;
    border-top-right-radius: 2px;

    div {
      width: 100%;
      height: 100%;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: ${(props) => props.theme.fontSizes.text};
    }

    div:nth-child(1),
    div:nth-child(2) {
      border-right: 2px solid ${(props) => props.theme.colors.darkBackground};
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .tracking-container {
      width: 70vw;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .tracking-container {
      width: 80vw;
    }
  }
`;
