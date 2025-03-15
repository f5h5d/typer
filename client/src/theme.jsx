import React, { createContext, useState, useContext, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import * as CONSTANTS from "../constants/constants.json";
import { useSelector } from "react-redux";
// Create Theme Context
const ThemeContext = createContext();

// Custom Hook to use ThemeContext
export const useTheme = () => useContext(ThemeContext);

const Theme = ({ children }) => {
  // State for theme
  const [theme, setTheme] = useState({
    ...CONSTANTS.BASE_THEME,
    ...CONSTANTS.DARK_THEME,
  });
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    Object.keys(CONSTANTS.BASE_THEME.allFonts).map((font) => {
      const fontFace = new FontFace(
        font,
        `url(${CONSTANTS.BASE_THEME.allFonts[font]}) format('woff2')`
      );
      fontFace
        .load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
        })
        .catch((err) => toast.error("Failed to load fonts"));
    });
  }, []);

  useEffect(() => {
    if (user && user.settings) {
      // user loaded and settings loaded
      setTheme((prevTheme) => ({
        ...prevTheme,
        ...CONSTANTS[user.settings.theme],
        fonts: { main: "Rubik", typingText: user.settings.font },
      }));
    } else {
      setTheme({ ...CONSTANTS.BASE_THEME, ...CONSTANTS.DARK_THEME });
    }
  }, [user]);

  // Function to update font size dynamically
  const updateFontSize = (newFontSizes) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      fontSizes: {
        ...prevTheme.fontSizes,
        ...newFontSizes, // Override only updated values
      },
    }));
  };

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    // setTheme((prevTheme) => (prevTheme === darkTheme ? lightTheme : darkTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateFontSize, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default Theme;
