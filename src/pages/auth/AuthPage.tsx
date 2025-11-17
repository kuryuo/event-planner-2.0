import {useState} from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegistrationForm from "@/components/auth/RegistrationForm";
import Button from "@/ui/button/Button";
import {useAuth} from "@/hooks/useAuth";
import type {LoginPayload, RegisterPayload} from "@/types/api/Auth.ts";

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {login, register, isAuthenticated} = useAuth();

    const toggleMode = () => {
        setMode((prev) => (prev === "login" ? "register" : "login"));
        setError(null);
    };

    const handleLogin = async (data: LoginPayload) => {
        setLoading(true);
        setError(null);
        const result = await login(data);
        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleRegister = async (data: RegisterPayload) => {
        setLoading(true);
        setError(null);

        const result = await register(data);
        if (!result.success) {
            setError(result.error);
        }

        setLoading(false);
    };

    if (isAuthenticated) {
        return <div>Вы уже вошли в систему</div>;
    }

    return (
        <div style={{
            width: 400,
            margin: "60px auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
        }}>
            <h2 style={{textAlign: "center"}}>
                {mode === "login" ? "Вход" : "Регистрация"}
            </h2>

            {mode === "login" ? (
                <LoginForm onSubmit={handleLogin} loading={loading} error={error || undefined}/>
            ) : (
                <RegistrationForm onSubmit={handleRegister} loading={loading} error={error || undefined}/>
            )}

            <Button
                variant="Text"
                onClick={toggleMode}
                style={{marginTop: 10}}
            >
                {mode === "login"
                    ? "Нет аккаунта? Зарегистрироваться"
                    : "Уже есть аккаунт? Войти"}
            </Button>
        </div>
    );
}
