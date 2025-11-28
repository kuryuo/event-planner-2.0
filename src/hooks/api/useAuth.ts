import {useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from '@/store/store.ts';
import {setTokens, clearTokens} from '@/store/authSlice.ts';
import {baseApi} from '@/services/api/baseApi.ts';
import {useLoginMutation, useRegisterMutation, useRecoverPasswordMutation} from '@/services/api/authApi.ts';
import type {LoginPayload, RegisterPayload} from '@/types/api/Auth.ts';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);

    const [loginMutation, {isLoading: isLoginLoading, error: loginError}] = useLoginMutation();
    const [registerMutation, {isLoading: isRegisterLoading, error: registerError}] = useRegisterMutation();
    const [recoverPasswordMutation, {isLoading: isRecoverPasswordLoading}] = useRecoverPasswordMutation();

    const isLoading = isLoginLoading || isRegisterLoading || isRecoverPasswordLoading;

    const error = loginError || registerError;

    const login = async (payload: LoginPayload) => {
        try {
            const result = await loginMutation(payload).unwrap();
            dispatch(setTokens(result.data));
            return {success: true};
        } catch (err: any) {
            const message = err.data?.message || err.message;
            return {success: false, error: message};
        }
    };

    const register = async (payload: RegisterPayload) => {
        try {
            const result = await registerMutation(payload).unwrap();
            dispatch(setTokens(result.data));
            return {success: true};
        } catch (err: any) {
            const message = err.data?.message || err.message;
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
        loading: isLoading,
        error: error ? (typeof error === 'string' ? error : 'Произошла ошибка') : null,
    };
};
