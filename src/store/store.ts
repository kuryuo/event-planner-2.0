import {configureStore} from '@reduxjs/toolkit';
import {baseApi} from '@/services/api/baseApi';
import authReducer from '@/store/authSlice';
import eventReducer from '@/store/eventSlice';

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        event: eventReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
