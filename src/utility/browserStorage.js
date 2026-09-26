const TOKEN_KEY = "libraryhub_token";
const USER_KEY = "libraryhub_user";

export const storage = {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    },

    setUser(user) {
        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );
    },

    getUser() {
        const user = localStorage.getItem(USER_KEY);

        if (!user) {
            return null;
        }

        try {
            return JSON.parse(user);
        } catch {
            return null;
        }
    },

    removeUser() {
        localStorage.removeItem(USER_KEY);
    },

    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

export default storage;