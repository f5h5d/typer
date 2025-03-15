import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMultiplayer: false,
  lookingForRoom: true,
  mode: -1, // 0 is quotes 1 is words
  otherPlayersData: {},
  socketID: "",
  racePlacement: 0,
  preRaceTimer: -1, // -1 means that no timer currently
  hasRaceStarted: false,
  roomID: 0, 
};

const multiplayerSlice = createSlice({
  name: "multiplayer",
  initialState,
  reducers: {
    setIsMultiplayer: (state, action) => {
      state.isMultiplayer = action.payload;
    },
    setLookingForRoom: (state, action) => {
      state.lookingForRoom = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setInitalOtherPlayersData: (state, action) => {
      state.otherPlayersData = action.payload;
    },
    setSocketID: (state, action) => {
      state.socketID = action.payload;
    },
    setRacePlacement: (state, action) => {
      state.racePlacement = action.payload;
    },
    setPreRaceTimer: (state, action) => {
      state.preRaceTimer = action.payload;
    },
    setHasRaceStarted: (state, action) => {
      state.hasRaceStarted = action.payload;
    },
    setRoomID: (state, action) => {
      state.roomID = action.payload;
    },


    setOtherPlayersData: (state, action) => {
      state.otherPlayersData = action.payload;
    },

    nextRaceMultiplayerReset: (state) => {
      state.lookingForRoom = initialState.lookingForRoom
      state.otherPlayersData = initialState.otherPlayersData
      state.racePlacement = initialState.racePlacement
      state.preRaceTimer = initialState.preRaceTimer
      state.hasRaceStarted = initialState.hasRaceStarted
      state.roomID = initialState.roomID
    },
    multiplayerMainMenuReset: (state) => {
      state.isMultiplayer = initialState.isMultiplayer
      state.lookingForRoom = initialState.lookingForRoom
      state.mode = initialState.mode
      state.otherPlayersData = initialState.otherPlayersData
      state.socketID = initialState.socketID
      state.racePlacement = initialState.racePlacement
      state.preRaceTimer = initialState.preRaceTimer
      state.hasRaceStarted = initialState.hasRaceStarted
      state.roomID = initialState.roomID
    }
  },
});


export const {
  setMode,
  setLookingForRoom,
  setOtherPlayersData,
  setInitalOtherPlayersData,
  setSocketID,
  setRacePlacement,
  setPreRaceTimer,
  setHasRaceStarted,
  setIsMultiplayer,
  nextRaceMultiplayerReset,
  multiplayerMainMenuReset,
  setRoomID
  // reset,
} = multiplayerSlice.actions;

export default multiplayerSlice.reducer;
