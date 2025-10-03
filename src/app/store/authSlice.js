import { createSlice } from "@reduxjs/toolkit";

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const userDataFromStorage = isBrowser && localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;

const initialState = {
    status : !!userDataFromStorage,
    userData : userDataFromStorage
}
const authSlice = createSlice({
    name : 'auth',
    initialState,
    reducers:{
        login: (state, action)=>{
            state.status = true;
            state.userData = action.payload;
            if (isBrowser) {
                localStorage.setItem('userData', JSON.stringify(action.payload));
            }
        },
        logout: (state)=>{
            state.status = false;
            state.userData = null;
            if (isBrowser) {
                localStorage.removeItem('userData');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        },
        updateProfile: (state, action) => {
            state.userData = { ...state.userData, ...action.payload };
            if (isBrowser) {
                localStorage.setItem('userData', JSON.stringify(state.userData));
            }
        }
    }
})

export const {login, logout, updateProfile} = authSlice.actions;

export default authSlice.reducer;