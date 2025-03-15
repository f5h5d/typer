import styled from "styled-components";

const CornerButton = styled.div`
  span {
    letter-spacing: 2px; // might need to add everywhere
  }
  .corner-button:before,
  .corner-button span:before,
  .corner-button:after,
  .corner-button span:after {
    overflow-x: visible !important;
    overflow-y: visible !important;
      display: block;
      content: "";
      width: 33px;
      height: 15px;
      position: absolute;
      text-align: center;
      justify-content: center;
      align-items: center;
  }

  .corner-button {
    font-family: ${props => props.theme.fonts.main} !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
    display: inline-block;
    font-family: "Roboto", sans-serif;
    font-size: ${props => props.theme.fontSizes.text};
    letter-spacing: 5px;
    text-align: center;
    position: relative;
    min-width: 100px;
    min-height: 10px;
    background: none;
    border: none;
    text-decoration: none;
    cursor: pointer;
    color: ${props => props.theme.colors.text};
    border-radius: 10px;
    padding: 10px 20px;
    box-sizing: content-box;
    border: 2px solid transparent;
    text-align: center;
    line-height: 30px;
    transition: 0.75s ease;
    
  }
  .corner-button:before {
    overflow-x: visible !important;
    overflow-y: visible !important;
      top: -2px;
      left: -2px;
      border-top: 2px solid ${props => props.theme.colors.accent};
      border-top-left-radius: 8px;
      border-left: 2px solid ${props => props.theme.colors.accent};
      transition: 0.75s all;
  }
  .corner-button:after {
    overflow-x: visible !important;
    overflow-y: visible !important;
      top: -2px;
      right: -2px;
      border-top: 2px solid ${props => props.theme.colors.accent};
      border-top-right-radius: 8px;
      border-right: 2px solid ${props => props.theme.colors.accent};
      transition: 0.75s all;
  }
  .corner-button span {
    overflow-x: visible !important;
    overflow-y: visible !important;
      display: block;
      text-align: center;
      justify-content: center;
      align-items: center;
      margin-left: 8px;
  }
  .corner-button span:before {
    overflow-x: visible !important;
    overflow-y: visible !important;
      bottom: -2px;
      left: -2px;
      border-bottom: 2px solid ${props => props.theme.colors.accent};
      border-bottom-left-radius: 8px;
      border-left: 2px solid ${props => props.theme.colors.accent};
      transition: 0.75s all;
  }
  .corner-button span:after {
    overflow-x: visible !important;
    overflow-y: visible !important;
      bottom: -2px;
      right: -2px;
      border-bottom: 2px solid ${props => props.theme.colors.accent};
      border-bottom-right-radius: 8px;
      border-right: 2px solid ${props => props.theme.colors.accent};
      transition: 0.75s all;
  }
  .corner-button:hover {
    overflow-x: visible !important;
    overflow-y: visible !important;
      color: ${props => props.theme.colors.text};
      border-radius: 10px;
  }
  .corner-button:hover:before,
  .corner-button:hover:after {
    overflow-x: visible !important;
    overflow-y: visible !important;
      border-color: ${props => props.theme.colors.accent};;
      width: 100%;
      height: 100%;
      border-radius: 10px;
  }
  .corner-button:hover span:before,
  .corner-button:hover span:after {
    overflow-x: visible !important;
    overflow-y: visible !important;
      border-color: ${props => props.theme.colors.accent};;
      width: 100%;
      height: 100%;
      border-radius: 10px;
  }
  button:hover span::before,
  button:hover span::after {
    overflow-x: visible !important;
    overflow-y: visible !important;
      width: 50px;
      height: 50px;
      border-radius: 10px;
  }


  @media (max-width: ${props => props.theme.breakpoints.sm}) {

  .corner-button:before,
  .corner-button span:before,
  .corner-button:after,
  .corner-button span:after {
      width: 25px;
      height: 10px;
  }
    .corner-button {
      min-width: 76px;
      line-height: 20px;
    }
  }
`;

export default CornerButton;