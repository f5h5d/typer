import {
  faBars,
  faBook,
  faChartArea,
  faChartLine,
  faDoorOpen,
  faGear,
  faHammer,
  faHome,
  faHouse,
  faL,
  faLineChart,
  faLock,
  faQ,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import CornerButton from "./CornerButton";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { GAME_MODES, PAGES, TYPING_TYPE } from "../../../constants/constants.json";
import { Link } from "react-router-dom";
import {
  multiplayerMainMenuReset,
  nextRaceMultiplayerReset,
  setLookingForRoom,
  setMode,
} from "../../redux/multiplayerSlice";
import {
  backToLobbyReset,
  reset,
  setTypingType,
} from "../../redux/typingSlice";
import SignUp from "../authentication/SignUp";
import Login from "../authentication/Login";
import { logoutUser } from "../../redux/userSlice";
import { privateRoomReset } from "../../redux/privateSlice";
import { socket } from "../../Socket";
import ForgotPassword from "../authentication/ForgotPassword";

const Header = (props) => {
  const [toggleHamburger, setToggleHamburger] = useState(false);
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);
  const [toggleUser, setToggleUser] = useState(false);

  const dispatch = useDispatch();
  const currentPage = useSelector((state) => state.user.currentPage);
  const user = useSelector((state) => state.user.user);

  const finishedTest = useSelector((state) => state.typing.finishedTest);
  const typingMode = useSelector((state) => state.typing.typingMode);

  const roomID = useSelector((state) => state.multiplayer.roomID);

  const startPrivateGame = useSelector(
    (state) => state.private.startPrivateGame
  );

  useEffect(() => {
    console.log(user)
  }, [])
  const resetPreviousPageStates = () => {
    if (currentPage == PAGES.QUOTE) {
      dispatch(backToLobbyReset());
      dispatch(multiplayerMainMenuReset());
    } else if (currentPage == PAGES.DICTIONARY) {
      dispatch(backToLobbyReset());
      dispatch(multiplayerMainMenuReset());
    } else if (currentPage == PAGES.PRIVATE) {
      dispatch(privateRoomReset());
      dispatch(multiplayerMainMenuReset());
      dispatch(backToLobbyReset());
      preDisconnect();
    } else if (currentPage == PAGES.SANDBOX) {
      dispatch(backToLobbyReset());
    }
  };

  const preDisconnect = () => {
    socket.emit("pre_disconnect", [typingMode, roomID]);
  };
  return (
    <Container>
      <SignUp
        openSignUpModal={openSignUpModal}
        setOpenSignUpModal={setOpenSignUpModal}
        setOpenLoginModal={setOpenLoginModal}
      />
      <Login
        openLoginModal={openLoginModal}
        setOpenLoginModal={setOpenLoginModal}
        setOpenSignUpModal={setOpenSignUpModal}
        setOpenForgotPasswordModal={setOpenForgotPasswordModal}
      />
      <ForgotPassword 
        openForgotPasswordModal={openForgotPasswordModal}
        setOpenForgotPasswordModal={setOpenForgotPasswordModal}
        setOpenLoginModal={setOpenLoginModal}
      />
      <div className="logo">
        <span className="typed-logo">Typ</span>
        <span className="untyped-logo">er</span>
        <span className="logo-cursor"></span>
      </div>
      {(currentPage == PAGES.QUOTE ||
        currentPage == PAGES.DICTIONARY ||
        (currentPage == PAGES.PRIVATE && startPrivateGame)) &&
      !finishedTest ? (
        ""
      ) : (
        <>
          <div className="navbar navbar-large">
            <div className="navbar-container">
              <Link
                to="/"
                className="navbar-icon"
                onClick={(e) => {
                  if (currentPage == PAGES.HOME) {
                    e.preventDefault();
                    return;
                  }
                  resetPreviousPageStates();
                }}
              >
                <FontAwesomeIcon
                  icon={faHouse}
                  className={`icon ${
                    currentPage == PAGES.HOME ? "current-page" : ""
                  } `}
                />
              </Link>

              <Link
                to="/multiplayer"
                className="navbar-icon"
                onClick={(e) => {
                  if (currentPage == PAGES.QUOTE) {
                    e.preventDefault();
                    return;
                  }
                  resetPreviousPageStates();
                  dispatch(setMode(GAME_MODES.MULTIPLAYER));
                  dispatch(setTypingType(TYPING_TYPE.QUOTES));
                }}
              >
                <FontAwesomeIcon
                  icon={faQ}
                  className={`icon ${
                    currentPage == PAGES.QUOTE ? "current-page" : ""
                  } `}
                />
              </Link>
              <Link
                to="/multiplayer"
                className="navbar-icon"
                onClick={(e) => {
                  if (currentPage == PAGES.DICTIONARY) {
                    e.preventDefault();
                    return;
                  }
                  resetPreviousPageStates();
                  dispatch(setTypingType(TYPING_TYPE.WORDS));
                  dispatch(setMode(GAME_MODES.MULTIPLAYER));
                }}
              >
                <FontAwesomeIcon
                  icon={faBook}
                  className={`icon ${
                    currentPage == PAGES.DICTIONARY ? "current-page" : ""
                  } `}
                />
              </Link>
              <Link
                to="/private-race"
                className="navbar-icon"
                onClick={(e) => {
                  if (currentPage == PAGES.PRIVATE) {
                    e.preventDefault();
                    return;
                  }
                  resetPreviousPageStates();
                  dispatch(setLookingForRoom(true));
                  dispatch(setMode(GAME_MODES.MULTIPLAYER));
                  dispatch(setTypingType(TYPING_TYPE.WORDS)); // fix this later
                }}
              >
                <FontAwesomeIcon
                  icon={faLock}
                  className={`icon ${
                    currentPage == PAGES.PRIVATE ? "current-page" : ""
                  } `}
                />
              </Link>
              <Link
                to="sandbox"
                className="navbar-icon"
                onClick={(e) => {
                  if (currentPage == PAGES.SANDBOX) {
                    e.preventDefault();
                    return;
                  }
                  resetPreviousPageStates();
                }}
              >
                <FontAwesomeIcon
                  icon={faHammer}
                  className={`icon ${
                    currentPage == PAGES.SANDBOX ? "current-page" : ""
                  } `}
                />
              </Link>

              {user ? (
                <>
                  <Link
                    to="stats"
                    className="navbar-icon"
                    onClick={(e) => {
                      if (currentPage == PAGES.STATS) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faLineChart}
                      className={`icon ${
                        currentPage == PAGES.STATS ? "current-page" : ""
                      } `}
                    />
                  </Link>
                  <Link
                    to="settings"
                    className="navbar-icon"
                    onClick={(e) => {
                      if (currentPage == PAGES.SETTINGS) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      className={`icon ${
                        currentPage == PAGES.SETTINGS ? "current-page" : ""
                      } `}
                    />
                  </Link>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="navbar navbar-small">
            <div
              className="hamburger"
              onClick={() => setToggleHamburger(!toggleHamburger)}
            >
              <FontAwesomeIcon
                className={`${toggleHamburger ? "hamburger-accent" : ""}`}
                icon={
                  toggleHamburger
                    ? currentPage == PAGES.HOME
                      ? faHome
                      : currentPage == PAGES.QUOTE
                      ? faQ
                      : currentPage == PAGES.DICTIONARY
                      ? faBook
                      : currentPage == PAGES.PRIVATE
                      ? faLock
                      : faHammer
                    : faBars
                }
              />

              <div
                className={`hamburger-icons ${
                  !toggleHamburger ? "invisible" : ""
                }`}
              >
                <div
                  className={`${
                    currentPage == PAGES.HOME ? "invisible-icon" : ""
                  }`}
                >
                  <Link
                    className={`${!toggleHamburger ? "invisible-icon" : ""}`}
                    to="/"
                    onClick={(e) => {
                      if (currentPage == PAGES.HOME) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                      setToggleHamburger(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHouse}
                      className={`icon ${
                        currentPage == PAGES.HOME ? "current-page" : ""
                      } `}
                    />
                  </Link>
                </div>
                <div
                  className={`${
                    currentPage == PAGES.QUOTE ? "invisible-icon" : ""
                  }`}
                >
                  <Link
                    to="/multiplayer"
                    className={`${!toggleHamburger ? "invisible-icon" : ""}`}
                    onClick={(e) => {
                      if (currentPage == PAGES.QUOTE) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                      dispatch(setMode(GAME_MODES.MULTIPLAYER));
                      dispatch(setTypingType(TYPING_TYPE.QUOTES));
                      dispatch(setLookingForRoom(true));
                      setToggleHamburger(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faQ}
                      className={`icon ${
                        currentPage == PAGES.QUOTE ? "current-page" : ""
                      } `}
                    />
                  </Link>
                </div>
                <div
                  className={`${
                    currentPage == PAGES.DICTIONARY ? "invisible-icon" : ""
                  }`}
                >
                  <Link
                    to="/multiplayer"
                    className={`${!toggleHamburger ? "invisible-icon" : ""}`}
                    onClick={(e) => {
                      if (currentPage == PAGES.DICTIONARY) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                      dispatch(setMode(GAME_MODES.MULTIPLAYER));
                      dispatch(setTypingType(TYPING_TYPE.WORDS));
                      dispatch(setLookingForRoom(true));
                      setToggleHamburger(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faBook}
                      className={`icon ${
                        currentPage == PAGES.DICTIONARY ? "current-page" : ""
                      } `}
                    />
                  </Link>
                </div>
                <div
                  className={`${
                    currentPage == PAGES.PRIVATE ? "invisible-icon" : ""
                  }`}
                >
                  <Link
                    className={`${!toggleHamburger ? "invisible-icon" : ""}`}
                    to="/private-race"
                    onClick={(e) => {
                      if (currentPage == PAGES.PRIVATE) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                      dispatch(setMode(GAME_MODES.MULTIPLAYER));
                      dispatch(setTypingType(TYPING_TYPE.WORDS)); // fix this later
                      setToggleHamburger(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faLock}
                      className={`icon ${
                        currentPage == PAGES.PRIVATE ? "current-page" : ""
                      } `}
                    />
                  </Link>
                </div>
                <div
                  className={`${
                    currentPage == PAGES.SANDBOX ? "invisible-icon" : ""
                  }`}
                >
                  <Link
                    to="/sandbox"
                    className={`${!toggleHamburger ? "invisible-icon" : ""}`}
                    onClick={(e) => {
                      if (currentPage == PAGES.SANDBOX) {
                        e.preventDefault();
                        return;
                      }
                      resetPreviousPageStates();
                      setToggleHamburger(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHammer}
                      className={`icon ${
                        currentPage == PAGES.SANDBOX ? "current-page" : ""
                      } `}
                    />
                  </Link>
                </div>
                {user ? (
                  <>
                    <div
                      className={`${
                        currentPage == PAGES.SANDBOX ? "invisible-icon" : ""
                      }`}
                    >
                      <Link
                        to="/stats"
                        className={`${
                          !toggleHamburger ? "invisible-icon" : ""
                        }`}
                        onClick={(e) => {
                          if (currentPage == PAGES.STATS) {
                            e.preventDefault();
                            return;
                          }
                          resetPreviousPageStates();
                          setToggleHamburger(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faChartLine}
                          className={`icon ${
                            currentPage == PAGES.SANDBOX ? "current-page" : ""
                          } `}
                        />
                      </Link>
                    </div>
                    <div
                      className={`${
                        currentPage == PAGES.SANDBOX ? "invisible-icon" : ""
                      }`}
                    >
                      <Link
                        to="settings"
                        className={`${
                          !toggleHamburger ? "invisible-icon" : ""
                        }`}
                        onClick={(e) => {
                          if (currentPage == PAGES.SETTINGS) {
                            e.preventDefault();
                            return;
                          }
                          resetPreviousPageStates();
                          setToggleHamburger(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faGear}
                          className={`icon ${
                            currentPage == PAGES.SANDBOX ? "current-page" : ""
                          } `}
                        />
                      </Link>
                    </div>
                    <div
                      className={`${
                        currentPage == PAGES.SANDBOX ? "invisible-icon" : ""
                      }`}
                    >
                      <Link
                        to="sandbox"
                        className={`${
                          !toggleHamburger ? "invisible-icon" : ""
                        }`}
                        onClick={() => {
                          resetPreviousPageStates();
                          dispatch(logoutUser());
                          setToggleHamburger(false);
                        }}
                      >
                        <FontAwesomeIcon icon={faL} className="icon logout" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => setOpenLoginModal(true)}
                    className={`${
                      !toggleHamburger ? "invisible-icon" : ""
                    } invisible-until-small login-small`}
                  >
                    <FontAwesomeIcon icon={faDoorOpen} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="user">
            {user ? (
              <div className="user-icon-container">
                <div
                  className="user-icon"
                  onClick={() => setToggleUser(!toggleUser)}
                >
                  <p>{user.username.substring(0, 1).toUpperCase()}</p>
                </div>
                <div
                  className={`user-options ${!toggleUser ? "invisible" : ""}`}
                  onClick={() => {
                    setToggleUser(false);
                    dispatch(logoutUser());
                  }}
                >
                  <div
                    className={`user-option logout ${
                      !toggleUser ? "invisible-icon" : ""
                    }`}
                  >
                    logout
                  </div>
                </div>
              </div>
            ) : (
              <CornerButton>
                <button
                  className="corner-button"
                  onClick={() => setOpenLoginModal(true)}
                >
                  <span>LOGIN</span>
                </button>
              </CornerButton>
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default Header;

const Container = styled.div`
  position: relative;
  /* z-index: 10000000 !important; */
  width: calc(100vw-78px);
  margin: 39px;
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  /* height: 45px; */
  height: 83px;

  .logo {
    flex: 1;
    font-family: ${(props) => props.theme.fonts.main};
    font-size: ${(props) => props.theme.fontSizes.logo.default};
    height: inherit;
    position: relative;
    display: flex;
    align-items: center;
    width: 33%;

    .typed-logo {
      color: ${(props) => props.theme.colors.text};
    }

    .untyped-logo {
      color: ${(props) => props.theme.colors.textDark};
    }

    .logo-cursor {
      position: absolute;
      background: ${(props) => props.theme.colors.accent};

      height: 80%;
      /* left: 80px;
      width: 4px; */

      width: 5px;
      left: 77px;

      border-radius: 10px;
    }
  }

  .navbar {
    flex: 2;
    width: 33%;
    display: flex;
    justify-content: center;

    .navbar-container {
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      height: 38px;
      border-radius: 20px;
      background: ${(props) => props.theme.colors.lightBackground};
      color: ${(props) => props.theme.colors.text};
      font-size: ${(props) => props.theme.fontSizes.navIcons};
      display: flex;

      .icon {
        cursor: pointer;
        color: ${(props) => props.theme.colors.text};
      }

      .navbar-icon {
        width: 50px !important;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .icon:hover {
        color: ${(props) => props.theme.colors.accent};
        opacity: 0.2;
      }

      .current-page {
        color: ${(props) => props.theme.colors.accent};
      }
    }
  }

  .navbar-small {
    display: flex;
    justify-content: flex-end;
    flex-direction: row !important;
    width: 100%;
    display: none;
    position: relative;
    color: ${(props) => props.theme.colors.text} !important;
    transition: max-height 0.4s ease-in-out;
    width: 50px;

    .hamburger {
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      width: inherit;
      height: 38px;
      width: 50px;

      font-size: ${(props) => props.theme.fontSizes.navIcons};

      display: flex;
      justify-content: center;
      align-items: center;
      background: ${(props) => props.theme.colors.lightBackground};
      border-top-right-radius: 10px;
      border-top-left-radius: 10px;
      transition: max-height 0.4s ease-in-out;
    }

    .hamburger-accent {
      color: ${(props) => props.theme.colors.accent};
    }

    .hamburger-icons {
      box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
        rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
      transition: height 0.4s ease-in-out;
      background: ${(props) => props.theme.colors.lightBackground};
      width: 50px;
      /* height: inherit; */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      position: absolute;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;

      height: 300px;
      /* height: 120px !important; */

      .icon {
        color: ${(props) => props.theme.colors.text} !important;
      }

      .login-small {
        cursor: pointer;
      }

      .logout {
        color: ${(props) => props.theme.colors.red} !important;
      }
    }

    .invisible {
      height: 0px;
    }

    .invisible-icon {
      display: none !important;
    }

    .invisible-until-small {
      display: none;
    }
  }

  .user {
    flex: 1;
    width: 33%;
    display: flex;
    justify-content: flex-end;

    .user-icon-container {
      display: flex;
      flex-direction: column;

      .user-icon {
        cursor: pointer;
        width: 144px;
        height: 40px;
        background: ${(props) => props.theme.colors.lightBackground};
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
          rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
          rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;

        display: flex;
        justify-content: center;
        align-items: center;

        p {
          font-size: ${(props) => props.theme.fontSizes.label};
          color: ${(props) => props.theme.colors.text};

          opacity: 1;
        }
      }

      .user-options {
        position: absolute;
        top: 62px;
        transition: 0.4s ease-in-out !important;

        .link {
          text-decoration: none !important;
        }

        .user-option {
          color: ${(props) => props.theme.colors.text};

          cursor: pointer;
          width: 144px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${(props) => props.theme.colors.lightBackground};
          border-top: 1px solid ${(props) => props.theme.colors.darkBackground};
          transition: 0.4s ease-in-out !important;
        }

        .logout {
          background: ${(props) => props.theme.colors.red};
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
      }

      .invisible {
        height: 0px !important;
        transition: 0.4s ease-in-out !important;
      }

      .invisible-icon {
        display: none !important;
        transition: 0.4s ease-in-out !important;
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    height: 50px;
    .logo {
      font-size: ${(props) => props.theme.fontSizes.logo.sm};

      .logo-cursor {
        height: 100%;
        left: 64px;
      }
    }
    .navbar {
      display: none;
    }

    .navbar-small {
      display: flex;
      justify-content: flex-end;
      width: 50%;

      .invisible-until-small {
        display: block;
      }

      .hamburger-icons {
        top: 35px;
      }
    }

    .user {
      display: none;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    .logo {
      width: 50% !important;
    }

    .navbar-small {
      align-items: flex-end;
      width: 50%;

      .invisible-until-small {
        display: block;
      }
    }

    .user {
      display: none;
    }
  }
`;
