import {useEffect} from 'react';
import {useGetEventsQuery} from '@/services/api/eventApi';
import {useDispatch, useSelector} from 'react-redux';
import {setEvents} from '@/store/eventSlice';
import type {EventData} from '@/types/api/Event';
import type {RootState} from "@/store/store.ts";

export const useEvents = (filters?: any) => {
    const dispatch = useDispatch();
    const events = useSelector((state: RootState) => state.event.events) as EventData[];

    const {data, isLoading, error} = useGetEventsQuery(filters || {count: 50});

    useEffect(() => {
        if (data?.result) {
            dispatch(setEvents(data.result));
        }
    }, [data, dispatch]);

    // console.log('Events in state:', events);
    return {events, isLoading, error};
};