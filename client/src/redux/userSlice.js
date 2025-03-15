import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
const API = import.meta.env.VITE_API;


export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/auth/fetchUser`, {
        withCredentials: true,
      });

      
      return response.data; // Return user data
    } catch (error) {
      console.log("ERROR CUH")
      toast.error("Can not connect to API");
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to handle logout
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    await axios.get(`${API}/auth/logout`, { withCredentials: true });
    dispatch(logout());
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  userStats: {},
  currentPage: 0,
  reloading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserStats: (state, action) => {
      state.userStats = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setReloading: (state, action) => {
      state.reloading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userStats = {};
    },
    userReset: (state) => {
      state.user = initialState.user;
      state.userStats = initialState.userStats;
      state.currentPage = initialState.currentPage;
    },
  },
  extraReducers: (builder) => {
    // extraReducers used for asyncThunk and its life cycle - runs when the thunk is loading (pending), when it has been fulfilled (completed) and if the request was rejected (failed)
    builder
      .addCase(fetchUser.pending, (state) => {
        // When the `fetchUser` thunk is dispatched and is pending
        state.loading = true; // Set loading state
        state.error = null; // Clear previous errors
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        // When the `fetchUser` thunk resolves successfully
        state.loading = false; // Stop loading
        state.user = action.payload; // Update the user with fetched data
      })
      .addCase(fetchUser.rejected, (state, action) => {
        // When the `fetchUser` thunk fails
        state.loading = false; // Stop loading
        state.error = action.payload; // Set error state
      });
  },
});

export const {
  setUser,
  setUserStats,
  setCurrentPage,
  setReloading,
  logout
  // reset,
} = userSlice.actions;

export default userSlice.reducer;
