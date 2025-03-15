import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  guestTotalRaces: 0,
  guestWpm: 9,
  guestAccuracy: 0,
  guestRacesWon: 0,
  guestHighestWpm: 0,
  guestMostRecentWpm: 0,
};

const privateSlice = createSlice({
  name: "privateLobby",
  initialState,
  reducers: {
    updateGuestTotalRaces: (state, action) => {
      state.guestTotalRaces += action.payload;
    },
    updateGuestRacesWon: (state, action) => {
      state.guestRacesWon += action.payload;
    },
    setGuestWpm: (state, action) => {
      state.guestWpm = action.payload;
    },
    setGuestHighestWpm: (state, action) => {
      state.guestHighestWpm = action.payload;
    },
    setGuestMostRecentWpm: (state, action) => {
      state.guestMostRecentWpm = action.payload;
    },
    setGuestAccuracy: (state, action) => {
      state.guestAccuracy = action.payload;
    },
  },
});


export const {
  updateGuestTotalRaces,
  updateGuestRacesWon,
  setGuestWpm,
  setGuestHighestWpm,
  setGuestMostRecentWpm,
  setGuestAccuracy,
} = privateSlice.actions;

export default privateSlice.reducer;
