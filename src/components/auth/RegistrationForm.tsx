import {useState} from "react";
import TextField from "@/ui/text-field/TextField";
import Button from "@/ui/button/Button";
import styles from "./AuthForm.module.scss";
import imageSrc from "@/assets/img/image.png";

interface RegistrationFormProps {
    onSubmit: (data: { username: string; email: string; password: string }) => void;
    loading?: boolean;
    error?: string;
    onLoginClick?: () => void;
}

export default function RegistrationForm({
                                             onSubmit,
                                             loading = false,
                                             error,
                                             onLoginClick
                                         }: RegistrationFormProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const username = `${firstName} ${lastName}`.trim();
        onSubmit({username, email, password});
    };

    return (
        <div className={styles.container}>
            <div className={styles.imageSection}>
                <img src={imageSrc} alt="Registration" className={styles.image}/>
            </div>
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.title}>Регистрация</h2>

                    <div className={styles.fieldsWrapper}>
                        <div className={styles.nameRow}>
                            <TextField
                                placeholder="Имя"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <TextField
                                placeholder="Фамилия"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

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
                            helperText="Минимум 6 символов"
                        />

                        <TextField
                            placeholder="Повторите пароль"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}
                    </div>

                    <Button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? "Загрузка..." : "Зарегистрироваться"}
                    </Button>

                    <div className={styles.linkWrapper}>
                        <span className={styles.text}>Уже есть аккаунт? </span>
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className={styles.link}
                        >
                            Войти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}