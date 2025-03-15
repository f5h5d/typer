import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  roomID: "",
  startPrivateGame: false,
  roomOwner: false,
  privateGameUserStats: {
    wpm: 0,
    acc: 0,
    username: "Guest",
    id: "",
    owner: false,
  }, // private stats should be seperate from normal user stats
  privateLobbyLeaderboardData: [], // leaderboard data for the private lobby leaderboard
  privateGameTypingParams: {},
};

const privateSlice = createSlice({
  name: "privateLobby",
  initialState,
  reducers: {
    setRoomID: (state, action) => {
      state.roomID = action.payload;
    },
    setStartPrivateGame: (state, action) => {
      state.startPrivateGame = action.payload;
    },
    setRoomOwner: (state, action) => {
      state.roomOwner = action.payload;
    },
    setPrivateGameUserStats: (state, action) => {
      state.userStats = action.payload;
    },
    setPrivateLobbyLeaderboardData: (state, action) => {
      state.privateLobbyLeaderboardData = action.payload;
    },
    setPrivateGameTypingParams: (state, action) => {
      state.privateGameTypingParams = action.payload;
    },

    nextRacePrivateReset: (state) => {
      state.startPrivateGame = initialState.startPrivateGame;
    },

    privateRoomReset: (state) => {
      state.roomID = initialState.roomID;
      state.startPrivateGame = initialState.startPrivateGame;
      state.roomOwner = initialState.roomOwner;
      state.userStats = initialState.userStats;
      state.privateLobbyLeaderboardData = initialState.privateLobbyLeaderboardData;
      state.privateGameTypingParams = initialState.privateGameTypingParams;
    },
  },
});

export const {
  setRoomID,
  setStartPrivateGame,
  setRoomOwner,
  nextRacePrivateReset,
  setPrivateGameUserStats,
  setPrivateLobbyLeaderboardData,
  setPrivateGameTypingParams,
  privateRoomReset
  // reset,
} = privateSlice.actions;

export default privateSlice.reducer;
