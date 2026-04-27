import {Controller, useForm} from 'react-hook-form';
import TextField from "@/ui/text-field/TextField";
import Button from "@/ui/button/Button";
import styles from "./AuthForm.module.scss";
import imageSrc from "@/assets/img/image.png";
import {isValidEmail} from '@/utils/validation.ts';

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
    const {
        control,
        handleSubmit,
        watch,
        formState: {errors}
    } = useForm<{ firstName: string; lastName: string; email: string; password: string; passwordConfirm: string }>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirm: '',
        }
    });

    const submitHandler = handleSubmit((values) => {
        const username = `${values.firstName} ${values.lastName}`.trim();
        onSubmit({username, email: values.email, password: values.password});
    });

    return (
        <div className={styles.container}>
            <div className={styles.imageSection}>
                <img src={imageSrc} alt="Registration" className={styles.image}/>
            </div>
            <div className={styles.formSection}>
                <form onSubmit={submitHandler} className={styles.form}>
                    <h2 className={styles.title}>Регистрация</h2>

                    <div className={styles.fieldsWrapper}>
                        <div className={styles.nameRow}>
                            <Controller
                                name="firstName"
                                control={control}
                                rules={{
                                    required: 'Имя обязательно',
                                    minLength: {value: 2, message: 'Минимум 2 символа'},
                                }}
                                render={({field}) => (
                                    <TextField placeholder="Имя" value={field.value} onChange={field.onChange}/>
                                )}
                            />
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{
                                    required: 'Фамилия обязательна',
                                    minLength: {value: 2, message: 'Минимум 2 символа'},
                                }}
                                render={({field}) => (
                                    <TextField placeholder="Фамилия" value={field.value} onChange={field.onChange}/>
                                )}
                            />
                        </div>

                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: 'Email обязателен',
                                validate: (value) => isValidEmail(value) || 'Введите корректный email',
                            }}
                            render={({field}) => (
                                <TextField placeholder="Email" type="email" value={field.value} onChange={field.onChange}/>
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={{required: 'Пароль обязателен', minLength: {value: 6, message: 'Минимум 6 символов'}}}
                            render={({field}) => (
                                <TextField
                                    placeholder="Пароль"
                                    type="password"
                                    value={field.value}
                                    onChange={field.onChange}
                                    helperText="Минимум 6 символов"
                                />
                            )}
                        />

                        <Controller
                            name="passwordConfirm"
                            control={control}
                            rules={{
                                required: 'Повторите пароль',
                                validate: (value) => value === watch('password') || 'Пароли не совпадают'
                            }}
                            render={({field}) => (
                                <TextField
                                    placeholder="Повторите пароль"
                                    type="password"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}
                        {(errors.firstName?.message || errors.lastName?.message || errors.email?.message || errors.password?.message || errors.passwordConfirm?.message) && (
                            <div className={styles.error}>
                                {errors.firstName?.message || errors.lastName?.message || errors.email?.message || errors.password?.message || errors.passwordConfirm?.message}
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
