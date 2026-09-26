import React from "react";
import ReactDOM from "react-dom/client";
import {
    CssBaseline,
    ThemeProvider,
} from "@mui/material";
import { Provider } from "react-redux";

import App from "./App";
import theme from "./theme/theme";
import store from "./redux/store";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);