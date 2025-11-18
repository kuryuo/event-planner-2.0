import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from '@/store/store';
import {setTokens, clearTokens} from '@/store/authSlice';
import {baseApi} from '@/services/api/baseApi';
import {useLoginMutation, useRegisterMutation, useRecoverPasswordMutation} from '@/services/api/authApi';
import type {LoginPayload, RegisterPayload} from '@/types/api/Auth';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);

    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [recoverPasswordMutation] = useRecoverPasswordMutation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (payload: LoginPayload) => {
        setLoading(true);
        setError(null);
        try {
            const result = await loginMutation(payload).unwrap();
            dispatch(setTokens(result.data));
            setLoading(false);
            return {success: true};
        } catch (err: any) {
            const message = err.data?.message || err.message;
            setError(message);
            setLoading(false);
            return {success: false, error: message};
        }
    };

    const register = async (payload: RegisterPayload) => {
        setLoading(true);
        setError(null);
        try {
            const result = await registerMutation(payload).unwrap();
            dispatch(setTokens(result.data));
            setLoading(false);
            return {success: true};
        } catch (err: any) {
            const message = err.data?.message || err.message;
            setError(message);
            setLoading(false);
            return {success: false, error: message};
        }
    };

    const logout = () => {
        dispatch(clearTokens());
        dispatch(baseApi.util.resetApiState());
    };

    const recoverPassword = async (payload: { email: string }) => {
        try {
            await recoverPasswordMutation(payload).unwrap();
            return {success: true};
        } catch (err: any) {
            return {success: false, error: err.data?.message || err.message};
        }
    };

    return {
        auth,
        login,
        register,
        logout,
        recoverPassword,
        isAuthenticated: !!auth.accessToken,
        loading,
        error,
    };
};
