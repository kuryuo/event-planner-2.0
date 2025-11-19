import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {UserProfile} from "@/types/api/Profile.ts";

interface ProfileState {
    profile: UserProfile | null;
}

const initialState: ProfileState = {
    profile: null,
}

export const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<UserProfile>) => {
            state.profile = action.payload;
        },
        clearProfile: (state) => {
            state.profile = null;
        }
    }
})

export const {setProfile, clearProfile} = profileSlice.actions;
export default profileSlice.reducer;