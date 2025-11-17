import {useState} from "react";
import TextField from "@/ui/text-field/TextField";
import Button from "@/ui/button/Button";

interface RegistrationFormProps {
    onSubmit: (data: { username: string; email: string; password: string }) => void;
    loading?: boolean;
    error?: string;
}

export default function RegistrationForm({
                                             onSubmit,
                                             loading = false,
                                             error
                                         }: RegistrationFormProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({username, email, password});
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                label="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
                label="Повторите пароль"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
            />

            {error && (
                <div style={{color: "red", marginBottom: "12px"}}>
                    {error}
                </div>
            )}

            <Button type="submit" disabled={loading}>
                {loading ? "Загрузка..." : "Регистрация"}
            </Button>
        </form>
    );
}
