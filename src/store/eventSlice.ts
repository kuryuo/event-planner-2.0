import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {EventResponse} from '@/types/api/Event';

interface EventState {
    events: EventResponse[];
}

const initialState: EventState = {
    events: [],
};

export const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setEvents: (state, action: PayloadAction<EventResponse[]>) => {
            state.events = action.payload;
        },
        clearEvents: (state) => {
            state.events = [];
        },
        addEvent: (state, action: PayloadAction<EventResponse>) => {
            state.events.push(action.payload);
        }
    },
});

export const {setEvents, clearEvents, addEvent} = eventSlice.actions;
export default eventSlice.reducer;
