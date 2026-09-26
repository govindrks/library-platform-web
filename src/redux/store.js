import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./reducer/authReducer";

const store = configureStore({
    reducer: {
        auth: authReducer,
    },

    devTools: import.meta.env.DEV,
});

export default store;