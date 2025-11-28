import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegistrationForm from "@/components/auth/RegistrationForm";
import Button from "@/ui/button/Button";
import {useAuth} from "@/hooks/api/useAuth.ts";

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const {login, register, isAuthenticated, loading, error} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/main");
        }
    }, [isAuthenticated, navigate]);

    const toggleMode = () => setMode(prev => (prev === "login" ? "register" : "login"));

    return (
        <div style={{width: 400, margin: "60px auto", display: "flex", flexDirection: "column", gap: "20px"}}>
            <h2 style={{textAlign: "center"}}>
                {mode === "login" ? "Вход" : "Регистрация"}
            </h2>

            {mode === "login" ? (
                <LoginForm onSubmit={login} loading={loading} error={error || undefined}/>
            ) : (
                <RegistrationForm onSubmit={register} loading={loading} error={error || undefined}/>
            )}

            <Button variant="Text" color="red" onClick={toggleMode} style={{marginTop: 10}}>
                {mode === "login"
                    ? "Нет аккаунта? Зарегистрироваться"
                    : "Уже есть аккаунт? Войти"}
            </Button>
        </div>
    );
}