import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
import { useTheme } from "../theme";
import CornerButton from "../components/styles/CornerButton";
import axios from "axios";
import { setCurrentPage, setUser } from "../redux/userSlice";
import { PAGES, THEMES, BASE_THEME } from "../../constants/constants.json";
import { setIsMultiplayer } from "../redux/multiplayerSlice";
const Settings = () => {
  const API = import.meta.env.VITE_API;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [madeChange, setMadeChange] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState({});
  const [changedSettings, setChangedSettings] = useState({ ...user.settings });

  useEffect(() => {
    dispatch(setCurrentPage(PAGES.SETTINGS));
    dispatch(setIsMultiplayer(false));

    axios
      .get(`${API}/settings/defaultSettings`, { withCredentials: true })
      .then((response) => {
        setDefaultSettings(response.data);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  }, []);

  const onChangeFontSize = (e) => {
    if (isNaN(e.target.value)) {
      return;
    }

    const parsedInput = +e.target.value;

    if (parsedInput > 3) {
      return;
    }

    if (e.target.value.length > 5) {
      // more than 3 decimal places
      return;
    }

    setChangedSettings({ ...changedSettings, fontSize: e.target.value });

    if (!madeChange) setMadeChange(true);
  };

  const onThemeClick = (theme) => {
    if (changedSettings.theme == theme) return; // already selected this theme
    setChangedSettings({ ...changedSettings, theme });
    if (!madeChange) setMadeChange(true);
  };

  const onFontClick = (font) => {
    if (changedSettings.font == font) return; // already selected this font
    setChangedSettings({ ...changedSettings, font });
    if (!madeChange) setMadeChange(true);
  };

  const onSubmit = async () => {
    if (changedSettings.fontSize > 3 || changedSettings.fontSize < 1) {
      toast.error("Please enter a valid font size (between 1 and 3)");
      return;
    }

    axios
      .post(`${API}/settings/update`, changedSettings, {
        withCredentials: true,
      })
      .then((response) => {
        setMadeChange(false);
        toast.success(response.data.message);
        dispatch(setUser({ ...user, settings: changedSettings }));
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const reset = () => {
    setChangedSettings(defaultSettings);
    if (!madeChange) setMadeChange(true);
  };

  return (
    <Container>
      {/* <Setting className="first-setting setting">
        <div className="left-side">
          <div className="sub-title">Cursor Type</div>
          <div className="sub-text">
            The cursor is the blinking icon that appears at the current letter
            when typing
          </div>
        </div>
        <div className="right-side">
          <SwitchButtons>
            {cursorOptions.map((option, index) => {
              const firstOrLast =
                index == 0
                  ? "left-button"
                  : index == cursorOptions.length - 1
                  ? "right-button"
                  : "";
              const highlighted =
                currentCursorOption == index ? "highlighted" : "";
              return (
                <button
                  key={index}
                  className={`option-button ${firstOrLast} ${highlighted}`}
                  onClick={() => setCurrentCursorOption(index)}
                >
                  {option}
                </button>
              );
            })}
          </SwitchButtons>
        </div>
      </Setting> */}

      <CornerButton>
        <button className="corner-button" onClick={reset}>
          <span>RESET TO DEFAULT</span>
        </button>
      </CornerButton>
      <Setting className="setting">
        <div className="left-side">
          <div className="sub-title">Typing Text Font Size</div>
          <div className="sub-text">
            Change font size of typing text within the range 1 - 3 (1 is 20px
            and the entered multiplier is applied on).
          </div>
          <div className="sub-text-small">Enter value between 1 - 3</div>
        </div>
        <div className="right-side">
          <input
            className="typing-text-font-size-input"
            type="number"
            value={changedSettings.fontSize}
            onChange={(e) => onChangeFontSize(e)}
          />
        </div>
      </Setting>
      <VerticalSetting className="setting">
        <div className="top">
          <div className="sub-title">Theme</div>
          <div className="sub-text">
            Choose the current theme of the website from the following, more to
            come!
          </div>
        </div>
        <div className="bottom">
          {Object.keys(THEMES).map((theme, index) => {
            const themeName = theme
              .toLowerCase()
              .substring(0, theme.lastIndexOf("_"))
              .replace("_", " ");

            const currentlySelected = changedSettings.theme == theme;
            return (
              <div
                key={index}
                className={`theme-option ${
                  currentlySelected ? "current-selection" : ""
                }`}
                onClick={() => onThemeClick(theme)}
                style={{
                  background: `${THEMES[theme].background}`,
                  color: `${THEMES[theme].text}`,
                }}
              >
                {themeName}
              </div>
            );
          })}
        </div>
      </VerticalSetting>
      <VerticalSetting className="setting last-setting">
        <div className="top">
          <div className="sub-title">Typing Text Font</div>
          <div className="sub-text">
            Choose the font of the text that you type
          </div>
        </div>
        <div className="bottom">
          {Object.keys(BASE_THEME.allFonts).map((font, index) => {
            console.log(font);
            const fontName = font.toLowerCase().replaceAll("_", " ");
            const currentlySelected = changedSettings.font == font;

            console.log(currentlySelected);
            return (
              <div
                key={index}
                className={`font-option ${
                  currentlySelected ? "current-selection" : ""
                }`}
                onClick={() => onFontClick(font)}
                style={{
                  fontFamily: `${font}`,
                }}
              >
                {fontName}
              </div>
            );
          })}
        </div>
      </VerticalSetting>
      <ConfirmButton>
        <div
          className={`confirm-button-inner-container ${
            madeChange ? "confirm-button-show" : ""
          }`}
        >
          <CornerButton>
            <button className="corner-button" onClick={onSubmit}>
              <span>SAVE CHANGES</span>
            </button>
          </CornerButton>
        </div>
      </ConfirmButton>
    </Container>
  );
};

const slideIn = keyframes`
  from {
    bottom: 0px;
  }

  to {
    bottom : 50px;
  }
`;

const Container = styled.div`
  /* min-height: 100vh; */
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;

  .corner-button {
    padding: 7px 10px;
  }

  .reset {
    background: ${(props) => props.theme.colors.lightBackground};
    padding: 10px 15px;
    color: ${(props) => props.theme.colors.text};
    border-radius: 20px;
    cursor: pointer;
    outline: 1px solid ${(props) => props.theme.colors.accent};
  }

  .first-setting {
    margin-top: 100px !important;
  }

  .last-setting {
    margin-bottom: 150px;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .setting {
      & > * {
        margin: 0 0px;
      }

      .left-side {
        width: 80%;
        margin-left: 20px;
      }

      .right-side {
        width: 20%;
        display: flex;
        justify-content: flex-end;
        margin-right: 20px;
      }
      .sub-title {
        font-size: ${(props) => props.theme.fontSizes.text};
      }

      .sub-text {
        display: none;
      }
      .sub-text-small {
        display: block;
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    flex-direction: column !important;
    .setting {
      flex-direction: column !important;
      justify-content: center;
      align-items: center !important;

      .left-side {
        /* width: 100% !important; */
        text-align: center;
        margin-left: 0px;
        margin-bottom: 10px;
      }

      .right-side {
        /* width: 100%; */
        justify-content: center;
        margin-right: 0px;
      }
    }
  }
`;

const ConfirmButton = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  .confirm-button-inner-container {
    position: fixed;
    display: none;
    animation: ${slideIn} 500ms ease-out;
  }

  .confirm-button-show {
    display: block !important;
    bottom: 50px;
  }
`;

const VerticalSetting = styled.div`
  width: 80%;
  background: ${(props) => props.theme.colors.lightBackground};
  border-radius: 10px;
  margin: 25px;

  .top {
    display: block;
    margin: 25px 50px !important;

    .sub-title {
      font-size: ${(props) => props.theme.fontSizes.label};
      text-decoration: 2px underline ${(props) => props.theme.colors.accent};
      margin-bottom: 5px;
    }
  }

  .bottom {
    display: flex;
    flex-wrap: wrap;
    margin: 25px 50px !important;
    .theme-option,
    .font-option {
      padding: 8px 40px;
      margin-right: 10px;
      margin-bottom: 10px;
      border-radius: 2px;
      cursor: pointer;
    }

    .current-selection {
      outline: 3px solid ${(props) => props.theme.colors.special} !important;
    }

    .font-option {
      background: ${(props) => props.theme.colors.darkBackground};
    }
  }
`;

const Setting = styled.div`
  width: 80%;
  height: 110px;
  background: ${(props) => props.theme.colors.lightBackground};
  border-radius: 10px;
  margin: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left-side {
    width: 95%;
  }

  .right-side {
    width: 5%;
  }

  .sub-title {
    font-size: ${(props) => props.theme.fontSizes.label};
    text-decoration: 2px underline ${(props) => props.theme.colors.accent};
    margin-bottom: 5px;
  }

  .sub-text-small {
    display: none;
  }

  & > * {
    margin: 0 50px;
  }

  .typing-text-font-size-input {
    border-bottom: 2px solid ${(props) => props.theme.colors.accent};
    width: 50px;
    text-align: center;
    color: ${(props) => props.theme.colors.text};
    font-size: ${(props) => props.theme.fontSizes.label};
    text-decoration: none;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Hide arrows for Firefox */
    &[type="number"] {
      -moz-appearance: textfield;
    }
  }

  .check-button {
    width: 35px;
    height: 30px;
    background: ${(props) => props.theme.colors.accent};
    opacity: 50%;
    font-size: ${(props) => props.theme.fontSizes.label};
    color: ${(props) => props.theme.colors.text};
    border-radius: 10px;
    margin-left: 20px;
  }
`;

const SwitchButtons = styled.div`
  right: 30px;
  top: 20px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
    rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  height: 30px;
  border-radius: 5px;

  .option-button {
    border: 1px solid ${({ theme: { colors } }) => colors.accent};
    background: ${({ theme: { colors } }) => colors.accent};
    opacity: 0.5;
    width: 130px;
    height: 30px;
    color: white;
    transition: 0.1s linear;
    cursor: pointer;
    /* border: 1px solid black; */
  }

  .right-button {
    /* border-left: none; */
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .left-button {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  .highlighted {
    opacity: 1;
  }

  .red {
    background: ${({ theme: { colors } }) => colors.red};
    opacity: 1;
    border: 1px solid ${({ theme: { colors } }) => colors.red};
  }
`;

export default Settings;
