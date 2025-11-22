import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

interface DateTimeState {
    startDate: string | null;
    endDate: string | null;
    startTime: string;
    endTime: string;
    showStartDatePicker: boolean;
    showEndDatePicker: boolean;
}

const initialState: DateTimeState = {
    startDate: null,
    endDate: null,
    startTime: '',
    endTime: '',
    showStartDatePicker: false,
    showEndDatePicker: false,
};

export const dateTimeSlice = createSlice({
    name: 'dateTime',
    initialState,
    reducers: {
        setStartDate: (state, action: PayloadAction<string | null>) => {
            state.startDate = action.payload;
            state.showStartDatePicker = false;
        },
        setEndDate: (state, action: PayloadAction<string | null>) => {
            state.endDate = action.payload;
            state.showEndDatePicker = false;
        },
        setStartTime: (state, action: PayloadAction<string>) => {
            state.startTime = action.payload;
        },
        setEndTime: (state, action: PayloadAction<string>) => {
            state.endTime = action.payload;
        },
        toggleStartDatePicker: (state) => {
            state.showStartDatePicker = !state.showStartDatePicker;
            state.showEndDatePicker = false;
        },
        toggleEndDatePicker: (state) => {
            state.showEndDatePicker = !state.showEndDatePicker;
            state.showStartDatePicker = false;
        },
        clearDateTime: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const {
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    toggleStartDatePicker,
    toggleEndDatePicker,
    clearDateTime,
} = dateTimeSlice.actions;

export default dateTimeSlice.reducer;