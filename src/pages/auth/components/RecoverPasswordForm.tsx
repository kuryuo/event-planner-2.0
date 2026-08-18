import {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Button} from 'antd';
import styles from './AuthForm.module.scss';
import {isValidEmail} from '@/utils/validation.ts';
import {Input} from '@/ui/input/Input';
import {FormField} from '@/ui/form-field/FormField';
import {AuthLayout} from '@/pages/auth/components/AuthLayout';
import type {RecoverPayload} from '@/types/api/Auth';
import {useI18n} from '@/i18n/I18nProvider';

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
    const {t} = useI18n();
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
        <AuthLayout title={t('auth.recover.title')}>
            {isSent ? (
                <div className={styles.formInner}>
                    <p className={styles.text}>
                        {t('auth.recover.success')}
                    </p>
                    <button type="button" onClick={onLoginClick} className={styles.link}>
                        {t('common.actions.backToLogin')}
                    </button>
                </div>
            ) : (
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
                        {error ? <p className={styles.error}>{error}</p> : null}
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={loading}
                        className={`ep-btn ep-btn--m ep-btn--filled-purple ${styles.submitButton}`}
                    >
                        {loading ? t('auth.recover.loading') : t('common.actions.submit')}
                    </Button>

                    <div className={styles.linkWrapper}>
                        <button type="button" onClick={onLoginClick} className={styles.link}>
                            {t('common.actions.backToLogin')}
                        </button>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
