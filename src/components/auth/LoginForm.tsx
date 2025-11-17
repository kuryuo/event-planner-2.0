import {useState} from "react";
import TextField from "@/ui/text-field/TextField";
import Button from "@/ui/button/Button";

interface LoginFormProps {
    onSubmit: (data: { email: string; password: string }) => void;
    loading?: boolean;
    error?: string;
}

export default function LoginForm({
                                      onSubmit,
                                      loading = false,
                                      error
                                  }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({email, password});
    };

    return (
        <form onSubmit={handleSubmit}>
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

            {error && (
                <div style={{color: "red", marginBottom: "12px"}}>
                    {error}
                </div>
            )}

            <Button type="submit" disabled={loading}>
                {loading ? "Вход..." : "Войти"}
            </Button>
        </form>
    );
}
