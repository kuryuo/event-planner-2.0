import {Controller, useForm} from 'react-hook-form';
import {Button} from 'antd';
import styles from './AuthForm.module.scss';
import {isValidEmail} from '@/utils/validation.ts';
import {Input} from '@/ui/input/Input';
import {FormField} from '@/ui/form-field/FormField';
import {AuthLayout} from '@/pages/auth/components/AuthLayout';

interface RegistrationFormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

interface RegistrationFormProps {
    onSubmit: (data: {username: string; email: string; password: string}) => Promise<{success: boolean; error?: string}> | void;
    loading?: boolean;
    error?: string;
    onLoginClick?: () => void;
}

export default function RegistrationForm({
    onSubmit,
    loading = false,
    error,
    onLoginClick,
}: RegistrationFormProps) {
    const {
        control,
        handleSubmit,
        getValues,
        formState: {errors},
    } = useForm<RegistrationFormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirm: '',
        },
    });

    const submitHandler = handleSubmit((values) => {
        const username = `${values.firstName} ${values.lastName}`.trim();
        onSubmit({username, email: values.email, password: values.password});
    });

    return (
        <AuthLayout title="Регистрация">
            <form onSubmit={submitHandler} className={styles.formInner}>
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
                                <FormField error={errors.firstName?.message}>
                                    <Input
                                        {...field}
                                        placeholder="Имя"
                                        autoComplete="given-name"
                                        status={errors.firstName ? 'error' : undefined}
                                    />
                                </FormField>
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
                                <FormField error={errors.lastName?.message}>
                                    <Input
                                        {...field}
                                        placeholder="Фамилия"
                                        autoComplete="family-name"
                                        status={errors.lastName ? 'error' : undefined}
                                    />
                                </FormField>
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
                            <FormField error={errors.email?.message}>
                                <Input
                                    {...field}
                                    placeholder="Email"
                                    type="email"
                                    autoComplete="email"
                                    status={errors.email ? 'error' : undefined}
                                />
                            </FormField>
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
                            <FormField error={errors.password?.message}>
                                <Input.Password
                                    {...field}
                                    placeholder="Пароль"
                                    autoComplete="new-password"
                                    status={errors.password ? 'error' : undefined}
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        name="passwordConfirm"
                        control={control}
                        rules={{
                            required: 'Повторите пароль',
                            validate: (value) => value === getValues('password') || 'Пароли не совпадают',
                        }}
                        render={({field}) => (
                            <FormField error={errors.passwordConfirm?.message}>
                                <Input.Password
                                    {...field}
                                    placeholder="Повторите пароль"
                                    autoComplete="new-password"
                                    status={errors.passwordConfirm ? 'error' : undefined}
                                />
                            </FormField>
                        )}
                    />

                    {error ? <p className={styles.error}>{error}</p> : null}
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={loading}
                    className={`ep-btn ep-btn--m ep-btn--filled-purple ${styles.submitButton}`}
                >
                    {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                </Button>

                <div className={styles.linkWrapper}>
                    <span className={styles.text}>Уже есть аккаунт? </span>
                    <button type="button" onClick={onLoginClick} className={styles.link}>
                        Войти
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
