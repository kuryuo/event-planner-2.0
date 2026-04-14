import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import {baseApi} from '@/services/api/baseApi';
import authReducer from '@/store/authSlice';
import eventReducer from '@/store/eventSlice';
import profileReducer from '@/store/profileSlice';
import dateTimeReducer from '@/store/dateTimeSlice';
import realtimeReducer from '@/store/realtimeSlice';
import {localStorageMiddleware} from '@/store/middleware/localStorageMiddleware';

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        event: eventReducer,
        profile: profileReducer,
        dateTime: dateTimeReducer,
        realtime: realtimeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(baseApi.middleware)
            .concat(localStorageMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
