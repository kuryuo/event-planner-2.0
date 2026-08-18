import {Controller, useForm} from 'react-hook-form';
import {Button} from 'antd';
import styles from './AuthForm.module.scss';
import {isValidEmail} from '@/utils/validation.ts';
import {Input} from '@/ui/input/Input';
import {FormField} from '@/ui/form-field/FormField';
import {AuthLayout} from '@/pages/auth/components/AuthLayout';
import {useI18n} from '@/i18n/I18nProvider';

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
    const {t} = useI18n();
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
        <AuthLayout title={t('auth.register.title')}>
            <form onSubmit={submitHandler} className={styles.formInner}>
                <div className={styles.fieldsWrapper}>
                    <div className={styles.nameRow}>
                        <Controller
                            name="firstName"
                            control={control}
                            rules={{
                                required: t('auth.validation.firstNameRequired'),
                                minLength: {value: 2, message: t('auth.validation.minTwoChars')},
                            }}
                            render={({field}) => (
                                <FormField error={errors.firstName?.message}>
                                    <Input
                                        {...field}
                                        placeholder={t('auth.fields.firstName')}
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
                                required: t('auth.validation.lastNameRequired'),
                                minLength: {value: 2, message: t('auth.validation.minTwoChars')},
                            }}
                            render={({field}) => (
                                <FormField error={errors.lastName?.message}>
                                    <Input
                                        {...field}
                                        placeholder={t('auth.fields.lastName')}
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
                            required: t('auth.validation.repeatPasswordRequired'),
                            validate: (value) => value === getValues('password') || t('auth.validation.passwordsMismatch'),
                        }}
                        render={({field}) => (
                            <FormField error={errors.passwordConfirm?.message}>
                                <Input.Password
                                    {...field}
                                    placeholder={t('auth.fields.repeatPassword')}
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
                    {loading ? t('auth.register.loading') : t('common.actions.register')}
                </Button>

                <div className={styles.linkWrapper}>
                    <span className={styles.text}>{t('auth.register.hasAccount')} </span>
                    <button type="button" onClick={onLoginClick} className={styles.link}>
                        {t('common.actions.login')}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
