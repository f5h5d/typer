import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedLength,
  setTypingType,
  setTypingText,
  reset,
  setTypingBackgroundInfo,
  setTotalTime,
  setSelectedDifficulty,
  setCurrentSelection,
  setRefillTypingText,
  setKeepTypingText,
} from "../../redux/typingSlice";
import axios from "axios";

import styled from "styled-components";

import { PAGES } from "../../../constants/constants.json";
import { setPrivateGameTypingParams } from "../../redux/privateSlice";
import { current } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const OptionSelector = ({ typingRef = useRef(null) }) => {
  const API = import.meta.env.VITE_API;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedLength = useSelector((state) => state.typing.selectedLength);
  const typingType = useSelector((state) => state.typing.typingType);
  const restart = useSelector((state) => state.typing.restart);
  const currentSelection = useSelector(
    (state) => state.typing.currentSelection
  );
  const selectedDifficulty = useSelector(
    (state) => state.typing.selectedDifficulty
  );
  const refillTypingText = useSelector(
    (state) => state.typing.refillTypingText
  );
  const typingText = useSelector((state) => state.typing.typingText);
  const keepTypingText = useSelector((state) => state.typing.keepTypingText);

  const currentPage = useSelector((state) => state.user.currentPage);

  useEffect(() => {
    // for text lengths!
    if (keepTypingText) return;

    let minLength;
    let maxLength;

    if (typingType == 0) {
      // quotes
      if (selectedLength == 0) {
        // short
        minLength = 50;
        maxLength = 199;
      } else if (selectedLength == 1) {
        // medium
        minLength = 200;
        maxLength = 249;
      } else if (selectedLength == 2) {
        // long
        minLength = 250;
        maxLength = 299;
      } else {
        // extra long
        minLength = 300;
        maxLength = 1000;
      }

      if (currentPage == PAGES.SANDBOX) {
        quoteGetter(minLength, maxLength);
      }

      if (currentPage == PAGES.PRIVATE) {
        dispatch(
          setPrivateGameTypingParams({
            minLength,
            maxLength,
            typingType,
            selectedLength,
          })
        );
      }
    } else if (typingType == 1) {
      let words = 0;
      if (selectedLength == 0) {
        words = 10;
      } else if (selectedLength == 1) {
        words = 25;
      } else if (selectedLength == 2) {
        words = 50;
      } else if (selectedLength == 3) {
        words = 100;
      } else if (selectedLength == 4) {

        console.log("TIMMEEEEE")
        // timer
        words = 100;
        dispatch(setTotalTime(30));
      } else if (selectedLength == 5) {
        // timer
        words = 100;
        dispatch(setTotalTime(60));
      }

      if (currentPage == PAGES.SANDBOX) {
        if (typingType == 0 || selectedLength < 4) {
          dispatch(setTotalTime(0)); // reset the totalTime value as it should only be not 0 when it is a timed trial
        }
        wordsGetter(selectedDifficulty, words);
      }

      if (currentPage == PAGES.PRIVATE) {
        dispatch(
          setPrivateGameTypingParams({
            difficulty: selectedDifficulty,
            words,
            typingType,
            selectedLength,
          })
        );
      }
    }
  }, [
    selectedLength,
    typingType,
    selectedDifficulty,
    restart,
    refillTypingText,
    currentPage,
  ]);

  const quoteGetter = async (minLength, maxLength) => {
    await axios
      .get(`${API}/quotes/${minLength}/${maxLength}`)
      .then((response) => {
        dispatch(reset())
        if (typingRef.current != null) typingRef.current.value = "";
        dispatch(setTypingText(response.data.quote));
        dispatch(setTypingBackgroundInfo(response.data));
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        navigate("/");
      });
  };

  const wordsGetter = async (level, words) => {
    await axios
      .get(`${API}/words/${level}/${words}`)
      .then((response) => {
        if (refillTypingText) {
          dispatch(
            setTypingBackgroundInfo({
              content: typingText + response.data.words,
              author: "Google",
            })
          );
          dispatch(setTypingText(typingText + " " + response.data.words));
        } else {
          dispatch(reset())
          if (typingRef.current != null) typingRef.current.value = ""; // for private room there is no typing area yet so no need
          dispatch(setTypingText(response.data.words));
          dispatch(
            setTypingBackgroundInfo({
              content: response.data.words,
              author: "Google",
            })
          );
        }
      })
      .catch((err) => {
        toast.error(err.message.response.data);
        navigate("/");
      });
  };

  const onButtonClick = (e, selection) => {
    if (currentSelection > 0 && selection == buttonsToLoad.length - 1) {
      // this is back button
      dispatch(setCurrentSelection(currentSelection - 1));
      return;
    }
    if (currentSelection == 0) {
      dispatch(setTypingType(selection));
    } else if (currentSelection == 1) {
      dispatch(setSelectedLength(selection));
    } else if (currentSelection == 2) {
      dispatch(setSelectedDifficulty(selection + 1));
    }
    // once current selection goes to 2 it should reset back to 0 and show but if option one is selected it should not show last section
    // since option 2 is value of 1 adding 1 to 2 would allow third section to show
    dispatch(setCurrentSelection((currentSelection + 1) % (2 + typingType)));
  };

  let buttonsToLoad = [];

  if (currentSelection == 0) {
    buttonsToLoad = ["Quote", "Dictionary"];
  } else if (currentSelection == 1) {
    if (typingType == 0) {
      // quotes
      buttonsToLoad = ["short", "medium", "long", "extra long", "Back"];
    } else if (typingType == 1) {
      buttonsToLoad = [
        "10 Words",
        "25 Words",
        "50 Words",
        "100 Words",
        "30 Seconds",
        "1 Minute",
        "Back",
      ];
    }
  } else if (currentSelection == 2) {
    buttonsToLoad = ["easy", "normal", "hard", "Back"];
  }

  return (
    <OptionsContainer>
      <OptionsDiv>
        {buttonsToLoad.map((element, index) => {
          const borderClass =
            index == 0
              ? "left-button"
              : index == buttonsToLoad.length - 1
              ? "right-button"
              : "";
          const highlightedClass =
            (index == typingType && currentSelection == 0) ||
            (index == selectedLength && currentSelection == 1) ||
            (index == selectedDifficulty - 1 && currentSelection == 2)
              ? "highlighted"
              : "";
          const red =
            currentSelection > 0 && index == buttonsToLoad.length - 1
              ? "red"
              : "";
          return (
            <button
              key={index}
              className={`option-button ${borderClass} ${highlightedClass} ${red}`}
              onClick={(e) => onButtonClick(e, index)}
            >
              {element}
            </button>
          );
        })}
      </OptionsDiv>
    </OptionsContainer>
  );
};

export default OptionSelector;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  position: relative;
  width: 100vw;
  margin: 0 auto;
`;

const OptionsDiv = styled.div`
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
    rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  height: 30px;

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

const Options = styled.div`
  display: flex;
  overflow: hidden;
  justify-content: center;
  scroll-behavior: smooth;
  transition: all 0.5s ease;
  width: 350px;
  flex-wrap: wrap;

  .option {
    background: ${({ theme: { colors } }) => colors.textDark};
    padding: 5px 10px;
    margin: 5px;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  }

  .option:hover {
    cursor: pointer;
    background: ${({ theme: { colors } }) => colors.blue};
    opacity: 0.4;
  }

  .selected {
    background: ${({ theme: { colors } }) => colors.blue};
    opacity: 1;
  }
`;
