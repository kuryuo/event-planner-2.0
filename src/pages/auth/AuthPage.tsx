import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import LoginForm from '@/pages/auth/components/LoginForm';
import RegistrationForm from '@/pages/auth/components/RegistrationForm';
import RecoverPasswordForm from '@/pages/auth/components/RecoverPasswordForm';
import {useAuth} from '@/hooks/api/useAuth.ts';
import type {LoginPayload, RecoverPayload} from '@/types/api/Auth';

type AuthMode = 'login' | 'register' | 'recover';

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [formError, setFormError] = useState<string>();
    const {login, register, recoverPassword, isAuthenticated, loading} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/main');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        setFormError(undefined);
    }, [mode]);

    const handleLogin = async (payload: LoginPayload) => {
        const result = await login(payload);
        if (!result.success) {
            setFormError(result.error);
        }
        return result;
    };

    const handleRegister = async (payload: {username: string; email: string; password: string}) => {
        const result = await register(payload);
        if (!result.success) {
            setFormError(result.error);
        }
        return result;
    };

    const handleRecover = async (payload: RecoverPayload) => {
        const result = await recoverPassword(payload);
        if (!result.success) {
            setFormError(result.error);
        }
        return result;
    };

    if (mode === 'register') {
        return (
            <RegistrationForm
                onSubmit={handleRegister}
                loading={loading}
                error={formError}
                onLoginClick={() => setMode('login')}
            />
        );
    }

    if (mode === 'recover') {
        return (
            <RecoverPasswordForm
                onSubmit={handleRecover}
                loading={loading}
                error={formError}
                onLoginClick={() => setMode('login')}
            />
        );
    }

    return (
        <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={formError}
            onRegisterClick={() => setMode('register')}
            onRecoverPasswordClick={() => setMode('recover')}
        />
    );
}
