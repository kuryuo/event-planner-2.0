import {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Button} from 'antd';
import styles from './AuthForm.module.scss';
import {isValidEmail} from '@/utils/validation.ts';
import {Input} from '@/ui/input/Input';
import {FormField} from '@/ui/form-field/FormField';
import {AuthLayout} from '@/pages/auth/components/AuthLayout';
import type {RecoverPayload} from '@/types/api/Auth';

interface RecoverPasswordFormProps {
    onSubmit: (data: RecoverPayload) => Promise<{success: boolean; error?: string}>;
    loading?: boolean;
    error?: string;
    onLoginClick?: () => void;
}

export default function RecoverPasswordForm({
    onSubmit,
    loading = false,
    error,
    onLoginClick,
}: RecoverPasswordFormProps) {
    const [isSent, setIsSent] = useState(false);
    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<RecoverPayload>({
        defaultValues: {email: ''},
    });

    const submitHandler = handleSubmit(async (values) => {
        const result = await onSubmit(values);
        if (result.success) {
            setIsSent(true);
        }
    });

    return (
        <AuthLayout title="Восстановление пароля">
            {isSent ? (
                <div className={styles.formInner}>
                    <p className={styles.text}>
                        Если аккаунт с таким email существует, мы отправили инструкции по восстановлению.
                    </p>
                    <button type="button" onClick={onLoginClick} className={styles.link}>
                        Вернуться ко входу
                    </button>
                </div>
            ) : (
                <form onSubmit={submitHandler} className={styles.formInner}>
                    <div className={styles.fieldsWrapper}>
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
                        {error ? <p className={styles.error}>{error}</p> : null}
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={loading}
                        className={`ep-btn ep-btn--m ep-btn--filled-purple ${styles.submitButton}`}
                    >
                        {loading ? 'Отправка...' : 'Отправить'}
                    </Button>

                    <div className={styles.linkWrapper}>
                        <button type="button" onClick={onLoginClick} className={styles.link}>
                            Вернуться ко входу
                        </button>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
