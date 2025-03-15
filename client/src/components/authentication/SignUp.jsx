import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import CornerButton from "../styles/CornerButton";
import toast from "react-hot-toast";
const SignUp = ({ openSignUpModal, setOpenSignUpModal, setOpenLoginModal }) => {
  const API = import.meta.env.VITE_API;
  const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);

  const [matchPassword, setMatchPassword] = useState("");
  const [validMatchPassword, setValidMatchPassword] = useState(false);

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(PASSWORD_REGEX.test(password));
    setValidMatchPassword(password == matchPassword);
  }, [password, matchPassword]);

  const submit = async (e) => {
    e.preventDefault();
    // if any field is invalid then return
    if (!(validUsername && validPassword && validMatchPassword && validEmail))
      return;
    axios
      .post(
        `${API}/auth/register`,
        { username, email, password },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const onLoginClick = () => {
    setOpenSignUpModal(false);
    setOpenLoginModal(true);
  };

  const onBackgroundClick = () => {
    setOpenSignUpModal(false);
  };

  if (!openSignUpModal) {
    return <></>;
  } else {
    return (
      <>
        <Background onClick={onBackgroundClick}></Background>
        <Container>
          <InnerContainer>
            <div className="title">
              <p>SIGN UP</p>
            </div>

            <div className="field username-div">
              <input
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                placeholder="Username"
              />
            </div>

            <div className="field email-div">
              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Email"
              />
            </div>

            <div className="field password-div">
              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                placeholder="Password"
              />
            </div>

            <div className="field re-enter-password-div">
              <input
                onChange={(e) => {
                  setMatchPassword(e.target.value);
                }}
                placeholder="Confirm Password"
              />
            </div>

            <div className="bottom">
              <CornerButton className="button-div">
                <button onClick={(e) => submit(e)} className="corner-button">
                  <span>SIGN UP</span>
                </button>
              </CornerButton>
              <div className="bottom-text">
                <p onClick={onLoginClick}>
                  Already have an account? Login here
                </p>
              </div>
            </div>
          </InnerContainer>
        </Container>
      </>
    );
  }
};

const Container = styled.div`
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 100vw;
  height: 90vh;
  overflow: hidden !important;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .inner-container {
      width: 400px !important;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .inner-container {
      width: 320px !important;
    }
  }
`;

const Background = styled.div`
  background: ${({ theme: { colors } }) => colors.darkBackground};
  z-index: 2;
  height: 200vh;
  width: 100vw;
  opacity: 0.8;
  position: fixed;
`;

const InnerContainer = styled.div`
  position: relative;
  z-index: 10;
  opacity: 1 !important;
  height: 600px;
  width: 500px;
  background: ${({ theme: { colors } }) => colors.lightBackground};
  border-radius: 10px;

  .title {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 20px;

    p {
      font-size: ${(props) => props.theme.fontSizes.largeLabel};
      text-decoration: 4px underline ${(props) => props.theme.colors.accent};
    }
  }

  .field {
    width: 100%;
    margin-left: 10%;

    margin-bottom: 24px;
    margin-top: 24px;
  }

  .username-div {
    margin-top: 50px !important;
  }

  input {
    margin-top: 5px;
    width: 90%;
    background: ${(props) => props.theme.colors.darkBackground};
    color: ${(props) => props.theme.colors.text};
    height: 44px;
    width: 80%;

    padding: 0 10px;
    border-radius: 2px;
    border-bottom: 2px solid ${(props) => props.theme.colors.accent};

    font-size: ${(props) => props.theme.fontSizes.text};
  }

  input::placeholder {
    color: ${(props) => props.theme.colors.textDark};
  }

  .bottom {
    position: absolute;
    bottom: 50px;
    margin: auto;

    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .button-div {
    width: 100%;
    display: flex;
    justify-content: center;

    button {
      background: ${({ theme: { colors } }) => colors.lightBackground};
    }
  }

  .bottom-text {
    margin-top: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    font-size: ${(props) => props.theme.fontSizes.text};
    text-decoration: 2px underline ${(props) => props.theme.colors.accent};

    p {
      cursor: pointer;
    }
  }
`;

export default SignUp;
