import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import styled from "styled-components";
import Main from "./pages/Main";
import Sandbox from "./pages/Sandbox";
import Multiplayer from "./pages/Multiplayer";
import PrivateRace from "./pages/PrivateRace";
import SignUp from "./components/authentication/SignUp";
import Login from "./components/authentication/Login";
import { useTheme } from "./theme";
import { useTheme as styledTheme } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, setUser, setUserStats } from "./redux/userSlice";
import axios from "axios";
import EmailVerified from "./pages/EmailVerified";
import Header from "./components/styles/Header";
import toast, { Toaster } from "react-hot-toast";
import { setPrivateGameUserStats } from "./redux/privateSlice";
import Stats from "./pages/Stats";
import { PrivateRoute } from "./reactRouter/PrivateRoute";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const API = import.meta.env.VITE_API;
  const dispatch = useDispatch();
  const { updateFontSize } = useTheme();
  const theme = styledTheme();
  const user = useSelector((state) => state.user.user);
  const userStats = useSelector((state) => state.user.userStats);
  const loading = useSelector((state) => state.user.loading);

  const privateGameUserStats = useSelector(
    (state) => state.private.privateGameUserStats
  );

  useEffect(() => {
    try {
      dispatch(fetchUser());
    } catch (err) {
      console.log("error");
    }
  }, [dispatch]);

  // if is a guest user
  useEffect(() => {
    if (!user) {
      axios.get(`${API}/races/guestStatInfo`).then(response => {
        dispatch(setUserStats(response.data));
      }).catch(err => {
        toast.error(err.response.data.message)
      })
      
    }
  }, [user]);

  // get user wpm and acc data once actual user is loaded
  useEffect(() => {
    if (user && privateGameUserStats.username == "Guest") {
      // update the users name in the private stats
      dispatch(
        setPrivateGameUserStats({
          ...privateGameUserStats,
          username: user.username,
        })
      );
    }

    console.log(user);
    if (user && user.settings) {
      updateFontSize({ typingText: user.settings.fontSize + "rem" });
    }

    if (user && userStats.guest && user.user_id) {
      axios.get(`${API}/races/stats/${user.user_id}`).then((response) => {
        dispatch(setUserStats({ ...response.data }));
      }).catch(err => {
        toast.error(err.response.data.message);
      })
    }
  }, [user]);

  if (loading) {
    console.log("LOADING");
  }

  return (
    <Router>
      <Container>
        
        <Header />
        <Toaster
          position="bottom-right"
          style={{zIndex: 999999}}
          toastOptions={{
            duration: 20000,
            style: {
              background: theme.colors.lightBackground,
              color: theme.colors.text,
              position: "relative",
              zIndex: 999999
            },

            success: {
              iconTheme: {
                primary: theme.colors.accent,
                secondary: theme.colors.text,
              },
            },

            error: {
              iconTheme: {
                primary: theme.colors.red,
                secondary: theme.colors.text,
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Main />}></Route>
          <Route path="/sandbox" element={<Sandbox />}></Route>
          <Route path="/multiplayer" element={<Multiplayer />}></Route>
          <Route path="/private-race" element={<PrivateRace />}></Route>
          <Route path="/verify/:token" element={<EmailVerified />}></Route>
          <Route path="/reset/:token" element={<ResetPassword />}></Route>
          <Route element={<PrivateRoute />}>
            <Route path="/stats" element={<Stats />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
          </Route>
        </Routes>
      </Container>
    </Router>
  );
}

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;

  background: ${(props) => props.theme.colors.mainBackground};

  overflow-x: hidden !important;
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.text};
  font-family: ${(props) => props.theme.fonts.main} !important;
`;

export default App;
