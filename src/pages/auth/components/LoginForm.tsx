import {Controller, useForm} from 'react-hook-form';
import {Button, Checkbox} from 'antd';
import styles from './AuthForm.module.scss';
import {isValidEmail} from '@/utils/validation.ts';
import {Input} from '@/ui/input/Input';
import {FormField} from '@/ui/form-field/FormField';
import {AuthLayout} from '@/pages/auth/components/AuthLayout';
import type {LoginPayload} from '@/types/api/Auth';
import {useI18n} from '@/i18n/I18nProvider';

interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface LoginFormProps {
    onSubmit: (data: LoginPayload) => Promise<{success: boolean; error?: string}> | void;
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
    onRecoverPasswordClick,
}: LoginFormProps) {
    const {t} = useI18n();
    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormValues>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const submitHandler = handleSubmit((values) => {
        onSubmit({email: values.email, password: values.password});
    });

    return (
        <AuthLayout title={t('auth.login.title')}>
            <form onSubmit={submitHandler} className={styles.formInner}>
                <div className={styles.fieldsWrapper}>
                    <Controller
                        name="email"
                        control={control}
                        rules={{
                            required: t('auth.validation.emailRequired'),
                            validate: (value) => isValidEmail(value) || t('auth.validation.validEmail'),
                        }}
                        render={({field}) => (
                            <FormField error={errors.email?.message}>
                                <Input
                                    {...field}
                                    placeholder={t('auth.fields.email')}
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
                            required: t('auth.validation.passwordRequired'),
                            minLength: {value: 6, message: t('auth.validation.passwordMin')},
                        }}
                        render={({field}) => (
                            <FormField error={errors.password?.message}>
                                <Input.Password
                                    {...field}
                                    placeholder={t('auth.fields.password')}
                                    autoComplete="current-password"
                                    status={errors.password ? 'error' : undefined}
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({field}) => (
                            <Checkbox
                                checked={field.value}
                                className={`ep-checkbox ${styles.checkbox}`}
                                onChange={(e) => field.onChange(e.target.checked)}
                            >
                                <span className={styles.checkboxLabel}>{t('auth.login.rememberMe')}</span>
                            </Checkbox>
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
                    {loading ? t('auth.login.loading') : t('common.actions.login')}
                </Button>

                <div className={styles.links}>
                    <div className={styles.linkWrapper}>
                        <span className={styles.text}>{t('auth.login.noAccount')} </span>
                        <button type="button" onClick={onRegisterClick} className={styles.link}>
                            {t('common.actions.register')}
                        </button>
                    </div>
                    <div className={styles.linkWrapper}>
                        <span className={styles.text}>{t('auth.login.forgotPassword')} </span>
                        <button type="button" onClick={onRecoverPasswordClick} className={styles.link}>
                            {t('common.actions.recoverPassword')}
                        </button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
