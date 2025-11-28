import {useCreateEventMutation} from "@/services/api/eventApi.ts";
import {useDispatch} from "react-redux";
import {addEvent} from "@/store/eventSlice.ts";
import type {CreateEventPayload} from "@/types/api/Event.ts";

export const useCreateEvent = () => {
    const dispatch = useDispatch();
    const [createEventMutation, {isLoading, error}] = useCreateEventMutation();

    const createEvent = async (payload: CreateEventPayload) => {
        try {
            const result = await createEventMutation(payload).unwrap();
            dispatch(addEvent(result.result));
        } catch (err) {
            console.error('Ошибка создания события:', err);
            throw err;
        }
    };
    return {createEvent, isLoading, error}
}
