import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* width */
  ::-webkit-scrollbar {
    width: 10px;
    border-radius: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.lightBackground};
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.darkBackground};
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.mediumBackground};
  }
`;

export default GlobalStyles;
