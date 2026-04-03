import {Controller, useForm} from 'react-hook-form';
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
    const {
        control,
        handleSubmit,
        formState: {errors}
    } = useForm<{ email: string; password: string; rememberMe: boolean }>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        }
    });

    const submitHandler = handleSubmit((values) => {
        onSubmit({email: values.email, password: values.password});
    });

    return (
        <div className={styles.container}>
            <div className={styles.imageSection}>
                <img src={imageSrc} alt="Login" className={styles.image}/>
            </div>
            <div className={styles.formSection}>
                <form onSubmit={submitHandler} className={styles.form}>
                    <h2 className={styles.title}>Вход</h2>

                    <div className={styles.fieldsWrapper}>
                        <Controller
                            name="email"
                            control={control}
                            rules={{required: 'Email обязателен'}}
                            render={({field}) => (
                                <TextField
                                    placeholder="Email"
                                    type="email"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={{required: 'Пароль обязателен'}}
                            render={({field}) => (
                                <TextField
                                    placeholder="Пароль"
                                    type="password"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />

                        <div className={styles.checkboxWrapper}>
                            <Controller
                                name="rememberMe"
                                control={control}
                                render={({field}) => (
                                    <Checkbox
                                        checked={field.value}
                                        onChange={() => field.onChange(!field.value)}
                                    />
                                )}
                            />
                            <span className={styles.checkboxLabel}>Запомнить меня</span>
                        </div>

                        {error && (
                            <div>
                                {error}
                            </div>
                        )}
                        {errors.email?.message && (
                            <div>
                                {errors.email.message}
                            </div>
                        )}
                        {errors.password?.message && (
                            <div>
                                {errors.password.message}
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
