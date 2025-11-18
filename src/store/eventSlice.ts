import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {EventData} from '@/types/api/Event';

interface EventState {
    events: EventData[];
}

const initialState: EventState = {
    events: [],
};

export const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setEvents: (state, action: PayloadAction<EventData[]>) => {
            state.events = action.payload;
        },
        clearEvents: (state) => {
            state.events = [];
        },
    },
});

export const {setEvents, clearEvents} = eventSlice.actions;
export default eventSlice.reducer;
