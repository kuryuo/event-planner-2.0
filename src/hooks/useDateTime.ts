import {useDispatch, useSelector} from 'react-redux';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import type {RootState, AppDispatch} from '@/store/store';
import {
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    toggleStartDatePicker,
    toggleEndDatePicker,
} from '@/store/dateTimeSlice';

export const useDateTime = () => {
    const dispatch = useDispatch<AppDispatch>();
    const dateTime = useSelector((state: RootState) => state.dateTime);

    const startDate = dateTime.startDate ? new Date(dateTime.startDate) : undefined;
    const endDate = dateTime.endDate ? new Date(dateTime.endDate) : undefined;

    return {
        startDate,
        endDate,
        startTime: dateTime.startTime,
        endTime: dateTime.endTime,
        showStartDatePicker: dateTime.showStartDatePicker,
        showEndDatePicker: dateTime.showEndDatePicker,

        formattedStartDate: startDate
            ? format(startDate, 'd MMM yyyy', {locale: ru})
            : '',
        formattedEndDate: endDate
            ? format(endDate, 'd MMM yyyy', {locale: ru})
            : '',

        setStartTime: (time: string) => dispatch(setStartTime(time)),
        setEndTime: (time: string) => dispatch(setEndTime(time)),
        setStartDate: (date: Date | undefined) => {
            dispatch(setStartDate(date ? date.toISOString() : null));
        },
        setEndDate: (date: Date | undefined) => {
            dispatch(setEndDate(date ? date.toISOString() : null));
        },
        toggleStartDatePicker: () => dispatch(toggleStartDatePicker()),
        toggleEndDatePicker: () => dispatch(toggleEndDatePicker()),
    };
};