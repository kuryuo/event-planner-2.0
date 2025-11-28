import {useEffect} from 'react';
import {useGetEventsQuery} from '@/services/api/eventApi.ts';
import {useDispatch, useSelector} from 'react-redux';
import {setEvents} from '@/store/eventSlice.ts';
import type {EventData} from '@/types/api/Event.ts';
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

    return {events, isLoading, error};
};