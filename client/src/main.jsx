import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import Theme from "./theme.jsx";
import "./index.css";
import GlobalStyles from "./components/styles/GlobalStyles.js";
createRoot(document.getElementById("root")).render(
//  <StrictMode>
    <Provider store={store}>
      <Theme>
        <GlobalStyles />
        <App />
      </Theme>
    </Provider>
// </StrictMode>
);
