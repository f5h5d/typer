import { createSlice } from "@reduxjs/toolkit";
import { setPrivateLobbyLeaderboardData } from "./privateSlice";

const initialState = {
  typingMode: 0, // 0 is sandbox, 1 is multiplayer, 2 is private game
  typingText: ``,
  userTyped: "",
  typingBackgroundInfo: [],
  incorrectText: [0, 0],
  wordsTyped: 0,
  mouseY: 0,
  mouseX: 0,
  wordsPerLine: [0], // each index represents a line, showing how many words in each => start at -1 because of just how it starts cba to fix it
  selectedLength: 0,
  typingType: 0, // this is for type as in either quotes or words
  selectedDifficulty: 1,
  currentSelection: 0, // 0 is type, 1 is length, 2 is difficulty
  wpm: 0,
  startTime: 0,
  endTime: 0,
  totalTime: 0,
  elapsedTime: 0,
  finishedTest: false,
  typedAtAll: false,
  mistakes: 0,
  wpmRecord: [],
  refillTypingText: 0, // this is for when user is doing timed test and if user has typed almost all of the typing text and more is needed (adds by 1 every time)
  lastTyped: 0, // this is a date, used for checking if user has typed in the last 10 seconds if not it voids the test
  restart: false,
  savedData: false,
  keepTypingText: false, // this is for when user wants to practice from stats page, it doesn't change the currnet typing text if true
  lastSecondRecorded: -1, // last second that the typing tracker has recorded
  reloadedPage: false,

  mistakesList: [],
};

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    setTypingMode: (state, action) => {
      state.typingMode = action.payload;
    },
    setTypingText: (state, action) => {
      state.typingText = action.payload;
    },
    setTypingBackgroundInfo: (state, action) => {
      state.typingBackgroundInfo = action.payload;
    },
    setUserTyped: (state, action) => {
      state.userTyped = action.payload;
    },
    setIncorrectText: (state, action) => {
      state.incorrectText = action.payload;
    },
    setWordsTyped: (state, action) => {
      state.wordsTyped = action.payload;
    },
    setMouseY: (state, action) => {
      state.mouseY = action.payload;
    },
    setMouseX: (state, action) => {
      state.mouseX = action.payload;
    },
    setWordsPerLine: (state, action) => {
      state.wordsPerLine = action.payload;
    },
    setSelectedLength: (state, action) => {
      state.selectedLength = action.payload;
    },
    setTypingType: (state, action) => {
      state.typingType = action.payload;
    },
    setWpm: (state, action) => {
      state.wpm = action.payload;
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setFinishedTest: (state, action) => {
      state.finishedTest = action.payload;
    },
    setTypedAtAll: (state, action) => {
      state.typedAtAll = action.payload;
    },
    setEndTime: (state, action) => {
      state.endTime = action.payload;
    },
    setMistakes: (state, action) => {
      state.mistakes = action.payload;
    },
    setWpmRecord: (state, action) => {
      state.wpmRecord = action.payload;
    },
    setRestart: (state, action) => {
      state.restart = action.payload;
    },
    setTotalTime: (state, action) => {
      state.totalTime = action.payload;
    },
    setElapsedTime: (state, action) => {
      state.elapsedTime = action.payload;
    },
    setSelectedDifficulty: (state, action) => {
      state.selectedDifficulty = action.payload;
    },
    setCurrentSelection: (state, action) => {
      state.currentSelection = action.payload;
    },
    setRefillTypingText: (state, action) => {
      state.refillTypingText = state.refillTypingText + action.payload;
    },
    setLastTyped: (state, action) => {
      state.lastTyped = action.payload;
    },
    setSavedData: (state, action) => {
      state.savedData = action.payload;
    },
    setReloadedPage: (state, action) => {
      state.reloadedPage = action.payload;
    },
    setLastSecondRecorded: (state, action) => {
      state.lastSecondRecorded = action.payload;
    },
    addToMistakesList: (state, action) => {
      state.mistakesList.push(action.payload);
    },

    setKeepTypingText: (state, action) => {
      state.keepTypingText = action.payload;
    },
    reset: (state) => {
      state.typingText = initialState.typingText;
      state.typingBackgroundInfo = initialState.typingBackgroundInfo;
      state.userTyped = initialState.userTyped;
      state.incorrectText = initialState.incorrectText;
      state.wordsTyped = initialState.wordsTyped;
      state.mouseY = initialState.mouseY;
      state.mouseX = initialState.mouseX;
      state.wordsPerLine = initialState.wordsPerLine;
      // state.selectedLength = initialState.selectedLength;
      state.wpm = initialState.wpm;
      state.startTime = initialState.startTime;
      state.finishedTest = initialState.finishedTest;
      state.typedAtAll = initialState.typedAtAll;
      state.endTime = initialState.endTime;
      state.mistakes = initialState.mistakes;
      state.wpmRecord = initialState.wpmRecord;
      state.restart = initialState.restart;
      // state.totalTime = initialState.totalTime;
      state.elapsedTime = initialState.elapsedTime;
      state.refillTypingText = initialState.refillTypingText;
      state.lastTyped = initialState.lastTyped;
      state.savedData = initialState.savedData;
      state.reloadedPage = initialState.reloadedPage;
      state.mistakesList = initialState.mistakesList;
      state.keepTypingText = initialState.keepTypingText;
      state.lastSecondRecorded = initialState.lastSecondRecorded;
    },

    backToLobbyReset: (state) => {
      state.typingMode = initialState.typingMode;
      state.typingText = initialState.typingText;
      state.typingBackgroundInfo = initialState.typingBackgroundInfo;
      state.userTyped = initialState.userTyped;
      state.incorrectText = initialState.incorrectText;
      state.wordsTyped = initialState.wordsTyped;
      state.mouseY = initialState.mouseY;
      state.mouseX = initialState.mouseX;
      state.wordsPerLine = initialState.wordsPerLine;
      state.selectedLength = initialState.selectedLength;
      state.typingType = initialState.typingType;
      state.wpm = initialState.wpm;
      state.startTime = initialState.startTime;
      state.finishedTest = initialState.finishedTest;
      state.typedAtAll = initialState.typedAtAll;
      state.endTime = initialState.endTime;
      state.mistakes = initialState.mistakes;
      state.wpmRecord = initialState.wpmRecord;
      state.restart = initialState.restart;
      state.totalTime = initialState.totalTime;
      state.elapsedTime = initialState.elapsedTime;
      state.selectedDifficulty = initialState.selectedDifficulty;
      state.currentSelection = initialState.currentSelection;
      state.refillTypingText = initialState.refillTypingText;
      state.lastTyped = initialState.lastTyped;
      state.savedData = initialState.savedData;
      state.reloadedPage = initialState.reloadedPage;
      state.mistakesList = initialState.mistakesList;
      state.keepTypingText = initialState.keepTypingText;
      state.lastSecondRecorded = initialState.lastSecondRecorded;
    },
  },
});

export const {
  setTypingMode,
  setTypingText,
  setTypingBackgroundInfo,
  setUserTyped,
  setIncorrectText,
  setWordsTyped,
  setMouseY,
  setMouseX,
  setWordsPerLine,
  setSelectedLength,
  setTypingType,
  setWpm,
  setStartTime,
  setFinishedTest,
  setTypedAtAll,
  setEndTime,
  setMistakes,
  setWpmRecord,
  setRestart,
  setTotalTime,
  setElapsedTime,
  setSelectedDifficulty,
  setCurrentSelection,
  setRefillTypingText,
  setLastTyped,
  addToMistakesList,
  setReloadedPage,
  reset,
  backToLobbyReset,
  setSavedData,
  setKeepTypingText,
  setLastSecondRecorded
} = typingSlice.actions;

export default typingSlice.reducer;
