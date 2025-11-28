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
        addEvent: (state, action: PayloadAction<EventData>) => {
            state.events.push(action.payload);
        }
    },
});

export const {setEvents, clearEvents, addEvent} = eventSlice.actions;
export default eventSlice.reducer;
