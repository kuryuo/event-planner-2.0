import {Controller, useForm} from 'react-hook-form';
import {Button} from "antd";
import {Checkbox} from "antd";
import styles from "./AuthForm.module.scss";
import imageSrc from "@/assets/img/image.png";
import {isValidEmail} from '@/utils/validation.ts';
import {Input} from "antd";

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
                            rules={{
                                required: 'Email обязателен',
                                validate: (value) => isValidEmail(value) || 'Введите корректный email',
                            }}
                            render={({field}) => (
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    className="ep-input ep-input--m"
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={{
                                required: 'Пароль обязателен',
                                minLength: {value: 6, message: 'Минимум 6 символов'},
                            }}
                            render={({field}) => (
                                <Input.Password
                                    placeholder="Пароль"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    className="ep-input ep-input--m"
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
                                        className="ep-checkbox"
                                        onChange={(e) => field.onChange(e.target.checked)}
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

                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={loading}
                        className={`ep-btn ep-btn--m ep-btn--filled-purple ${styles.submitButton}`}
                    >
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
