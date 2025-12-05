import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegistrationForm from "@/components/auth/RegistrationForm";
import {useAuth} from "@/hooks/api/useAuth.ts";

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register" | "recover">("login");
    const {login, register, isAuthenticated, loading, error} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/main");
        }
    }, [isAuthenticated, navigate]);

    const handleRegisterClick = () => setMode("register");
    const handleRecoverPasswordClick = () => setMode("recover");
    const handleLoginClick = () => setMode("login");

    return (
        <>
            {mode === "login" ? (
                <LoginForm
                    onSubmit={login}
                    loading={loading}
                    error={error || undefined}
                    onRegisterClick={handleRegisterClick}
                    onRecoverPasswordClick={handleRecoverPasswordClick}
                />
            ) : (
                <RegistrationForm
                    onSubmit={register}
                    loading={loading}
                    error={error || undefined}
                    onLoginClick={handleLoginClick}
                />
            )}
        </>
    );
}