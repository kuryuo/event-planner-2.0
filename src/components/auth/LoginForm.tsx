import {useState} from "react";
import TextField from "@/ui/text-field/TextField";
import Button from "@/ui/button/Button";
import Checkbox from "@/ui/checkbox/Checkbox";
import styles from "./AuthForm.module.scss";
import imageSrc from "@/assets/img/image.png";

interface LoginFormProps {
    onSubmit: (data: { email: string; password: string }) => void;
    loading?: boolean;
    error?: string;
    onRegisterClick?: () => void;
    onRecoverPasswordClick?: () => void;
}

export default function LoginForm({
                                      onSubmit,
                                      loading = false,
                                      error,
                                      onRegisterClick,
                                      onRecoverPasswordClick
                                  }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({email, password});
    };

    return (
        <div className={styles.container}>
            <div className={styles.imageSection}>
                <img src={imageSrc} alt="Login" className={styles.image}/>
            </div>
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.title}>Вход</h2>

                    <div className={styles.fieldsWrapper}>
                        <TextField
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <TextField
                            placeholder="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className={styles.checkboxWrapper}>
                            <Checkbox
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <span className={styles.checkboxLabel}>Запомнить меня</span>
                        </div>

                        {error && (
                            <div>
                                {error}
                            </div>
                        )}
                    </div>

                    <Button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? "Вход..." : "Войти"}
                    </Button>

                    <div className={styles.links}>
                        <div className={styles.linkWrapper}>
                            <span className={styles.text}>Нет аккаунта? </span>
                            <button
                                type="button"
                                onClick={onRegisterClick}
                                className={styles.link}
                            >
                                Зарегистрироваться
                            </button>
                        </div>
                        <div className={styles.linkWrapper}>
                            <span className={styles.text}>Забыли пароль? </span>
                            <button
                                type="button"
                                onClick={onRecoverPasswordClick}
                                className={styles.link}
                            >
                                Восстановить пароль
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}