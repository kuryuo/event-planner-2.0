import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Button} from 'antd';
import styles from './ProfileForm.module.scss';
import {Input} from '@/ui/input/Input';
import {FormField} from '@/ui/form-field/FormField';
import GeoAltIcon from '@/assets/img/icon-m/geo-alt.svg?react';
import TelephoneIcon from '@/assets/img/icon-m/telephone.svg?react';
import TelegramIcon from '@/assets/img/icon-m/telegram.svg?react';
import {isValidAddress, isValidPhone, isValidTelegram} from '@/utils/validation.ts';
import {useI18n} from '@/i18n/I18nProvider';

interface ProfileFormValues {
    firstName: string;
    lastName: string;
    profession: string;
    city: string;
    phoneNumber: string;
    telegram: string;
}

interface ProfileFormProps {
    onSubmit?: (data: ProfileFormValues) => void;
    onCancel?: () => void;
    loading?: boolean;
    initialData?: Partial<ProfileFormValues> & {email?: string};
}

const emptyValues: ProfileFormValues = {
    firstName: '',
    lastName: '',
    profession: '',
    city: '',
    phoneNumber: '',
    telegram: '',
};

const toFormValues = (data?: ProfileFormProps['initialData']): ProfileFormValues => ({
    firstName: data?.firstName ?? '',
    lastName: data?.lastName ?? '',
    profession: data?.profession ?? '',
    city: data?.city ?? '',
    phoneNumber: data?.phoneNumber ?? '',
    telegram: data?.telegram ?? '',
});

export default function ProfileForm({
    onSubmit,
    onCancel,
    loading = false,
    initialData,
}: ProfileFormProps) {
    const {t} = useI18n();
    const {control, handleSubmit, reset, formState: {errors}} = useForm<ProfileFormValues>({
        mode: 'onBlur',
        defaultValues: toFormValues(initialData),
    });

    useEffect(() => {
        if (!initialData) return;
        reset(toFormValues(initialData));
    }, [initialData, reset]);

    const submitForm = (formData: ProfileFormValues) => {
        onSubmit?.(formData);
    };

    const handleCancel = () => {
        reset(initialData ? toFormValues(initialData) : emptyValues);
        onCancel?.();
    };

    return (
        <div className={styles.formWrapper}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('profile.personalData')}</h3>
                <div className={styles.nameRow}>
                    <Controller
                        name="firstName"
                        control={control}
                        rules={{
                            required: t('auth.validation.firstNameRequired'),
                            minLength: {value: 2, message: t('auth.validation.minTwoChars')},
                            maxLength: {value: 40, message: t('profile.validation.max40')},
                        }}
                        render={({field}) => (
                            <FormField error={errors.firstName?.message}>
                                <Input
                                    {...field}
                                    placeholder={t('auth.fields.firstName')}
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
                            maxLength: {value: 50, message: t('profile.validation.max50')},
                        }}
                        render={({field}) => (
                            <FormField error={errors.lastName?.message}>
                                <Input
                                    {...field}
                                    placeholder={t('auth.fields.lastName')}
                                    status={errors.lastName ? 'error' : undefined}
                                />
                            </FormField>
                        )}
                    />
                </div>
                <Controller
                    name="profession"
                    control={control}
                    rules={{
                        required: t('profile.validation.professionRequired'),
                        minLength: {value: 2, message: t('auth.validation.minTwoChars')},
                        maxLength: {value: 80, message: t('profile.validation.max80')},
                    }}
                    render={({field}) => (
                        <FormField error={errors.profession?.message}>
                            <Input
                                {...field}
                                placeholder={t('profile.profession')}
                                status={errors.profession ? 'error' : undefined}
                            />
                        </FormField>
                    )}
                />
                <Controller
                    name="city"
                    control={control}
                    rules={{
                        required: t('profile.validation.cityRequired'),
                        validate: (value) => isValidAddress(value) || t('profile.validation.validAddress'),
                    }}
                    render={({field}) => (
                        <FormField error={errors.city?.message}>
                            <Input
                                {...field}
                                placeholder={t('profile.city')}
                                prefix={<GeoAltIcon/>}
                                status={errors.city ? 'error' : undefined}
                            />
                        </FormField>
                    )}
                />
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('profile.contactData')}</h3>
                <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{
                        required: t('profile.validation.phoneRequired'),
                        validate: (value) => isValidPhone(value) || t('profile.validation.validPhone'),
                    }}
                    render={({field}) => (
                        <FormField error={errors.phoneNumber?.message}>
                            <Input
                                {...field}
                                placeholder={t('profile.phone')}
                                type="tel"
                                prefix={<TelephoneIcon/>}
                                status={errors.phoneNumber ? 'error' : undefined}
                            />
                        </FormField>
                    )}
                />
                <Controller
                    name="telegram"
                    control={control}
                    rules={{
                        required: t('profile.validation.telegramRequired'),
                        validate: (value) => isValidTelegram(value) || t('profile.validation.validTelegram'),
                    }}
                    render={({field}) => (
                        <FormField error={errors.telegram?.message}>
                            <Input
                                {...field}
                                placeholder="Telegram"
                                prefix={<TelegramIcon/>}
                                status={errors.telegram ? 'error' : undefined}
                            />
                        </FormField>
                    )}
                />
            </div>

            <div>
                <Button
                    type="default"
                    className="ep-btn ep-btn--m ep-btn--filled-gray"
                    onClick={handleSubmit(submitForm)}
                    disabled={loading}
                >
                    {t('profile.saveChanges')}
                </Button>
                <Button
                    type="text"
                    className="ep-btn ep-btn--m ep-btn--text"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    {t('profile.cancelChanges')}
                </Button>
            </div>
        </div>
    );
}
