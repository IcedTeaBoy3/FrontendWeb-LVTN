import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        user: null,
    },
    reducers: {
        setUser: (state, action) => {
            console.log("Setting user:", action.payload);
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        updateUser: (state, action) => {
            const updatedUser = action.payload;
            state.user = { ...state.user, ...updatedUser };
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;