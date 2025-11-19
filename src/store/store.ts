import {configureStore} from '@reduxjs/toolkit';
import {baseApi} from '@/services/api/baseApi';
import authReducer from '@/store/authSlice';
import eventReducer from '@/store/eventSlice';
import profileReducer from '@/store/profileSlice';

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        event: eventReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
