import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { fetchUser, setUser } from "../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import CornerButton from "../styles/CornerButton";
import toast from "react-hot-toast";
const ForgotPassword = ({
  openForgotPasswordModal,
  setOpenForgotPasswordModal,
  setOpenLoginModal,
}) => {
  const API = import.meta.env.VITE_API;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  const submit = async (e) => {
    e.preventDefault();

    if (!validEmail) {
      toast.error("Please enter a email in the proper format");
      return;
    }
    axios
      .get(`${API}/auth/resetPassword/${email}`)
      .then((response) => {
        if (response.status == 200) {
          toast.success(response.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const onLoginClick = () => {
    setOpenForgotPasswordModal(false);
    setOpenLoginModal(true);
  };

  const onBackgroundClick = () => {
    setOpenForgotPasswordModal(false);
  };

  if (!openForgotPasswordModal) {
    return <></>;
  } else {
    return (
      <>
        <Background onClick={onBackgroundClick}></Background>
        <Container>
          <InnerContainer className="inner-container">
            <div className="title">
              <p>RESET</p>
            </div>

            <div className="field email-div">
              <input
                onKeyDown={(e) => {
                  if (e.key == "Enter") submit(e);
                }}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Email"
              />
            </div>

            <div className="bottom">
              <CornerButton className="button-div">
                <button onClick={(e) => submit(e)} className="corner-button">
                  <span>SEND EMAIL</span>
                </button>
              </CornerButton>
              <div className="bottom-text">
                <p onClick={onLoginClick}>Remember password? Click here</p>
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
  background-color: ${(props) => props.theme.colors.darkBackground};
  z-index: 1;
  height: 200vh;
  width: 100vw;
  opacity: 0.8;
  position: absolute;
`;

const InnerContainer = styled.div`
  position: relative;
  z-index: 2;
  opacity: 1 !important;
  height: 450px;
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

  .email-div {
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
    align-items: center;
    flex-direction: column;
    font-size: ${(props) => props.theme.fontSizes.text};
    text-decoration: 2px underline ${(props) => props.theme.colors.accent};

    p {
      cursor: pointer;
      margin: 5px 0px;
    }
  }
`;

export default ForgotPassword;
