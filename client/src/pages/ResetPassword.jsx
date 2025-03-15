import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import CornerButton from "../components/styles/CornerButton";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const API = import.meta.env.VITE_API;
  const params = useParams();
  const navigate = useNavigate();
  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);

  const [matchPassword, setMatchPassword] = useState("");
  const [validMatchPassword, setValidMatchPassword] = useState(false);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  useEffect(() => {
    setValidPassword(PASSWORD_REGEX.test(password));
    setValidMatchPassword(password == matchPassword);
  }, [password, matchPassword]);

  const submit = async () => {
    if (!validPassword)
      return toast.error(
        "Ensure password has 8-24 characters, an upper and lower case, a number, and a special character"
      );

    if (!validMatchPassword) return toast.error("Ensure passwords match");

    await axios
      .get(`${API}/auth/setPassword/${password}/${params.token}`)
      .then((response) => {
        if (response.status == 200) {
          toast.success(response.data.message);
          navigate("/");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        navigate("/");
      });
  };

  return (
    <>
      <Container>
        <InnerContainer className="inner-container">
          <div className="title">
            <p>RESET</p>
          </div>

          <div className="field password-div">
            <input
              onKeyDown={(e) => {
                if (e.key == "Enter") submit(e);
              }}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="New Password"
            />
          </div>
          <div className="field confirm-password-div">
            <input
              onKeyDown={(e) => {
                if (e.key == "Enter") submit(e);
              }}
              onChange={(e) => {
                setMatchPassword(e.target.value);
              }}
              placeholder="Confirm New Password"
            />
          </div>

          <div className="bottom-text">
            <CornerButton onClick={submit}>
              <button className="corner-button">
                <span>Submit</span>
              </button>
            </CornerButton>
          </div>
        </InnerContainer>
      </Container>
    </>
  );
};

export default ResetPassword;

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
    margin-top: 50px;
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
