import { createSlice } from "@reduxjs/toolkit";

import storage from "../../utility/browserStorage";

const initialState = {
    token: storage.getToken(),
    user: storage.getUser(),
    isAuthenticated: Boolean(storage.getToken()),
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        loginSuccess: (state, action) => {
            const { token, user } = action.payload;

            state.token = token;
            state.user = user || null;
            state.isAuthenticated = true;

            storage.setToken(token);

            if (user) {
                storage.setUser(user);
            }
        },

        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;

            storage.clear();
        },

        updateUser: (state, action) => {
            state.user = action.payload;

            storage.setUser(action.payload);
        },
    },
});

export const {
    loginSuccess,
    logout,
    updateUser,
} = authSlice.actions;

export default authSlice.reducer;