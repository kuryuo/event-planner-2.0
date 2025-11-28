import type {Middleware} from '@reduxjs/toolkit';
import {setTokens, clearTokens} from '@/store/authSlice';

export const localStorageMiddleware: Middleware = () => (next) => (action) => {
    if (setTokens.match(action)) {
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
    }
    if (clearTokens.match(action)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
    return next(action);
};