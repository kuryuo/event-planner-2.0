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
                <h3 className={styles.sectionTitle}>Личные данные</h3>
                <div className={styles.nameRow}>
                    <Controller
                        name="firstName"
                        control={control}
                        rules={{
                            required: 'Имя обязательно',
                            minLength: {value: 2, message: 'Минимум 2 символа'},
                            maxLength: {value: 40, message: 'Максимум 40 символов'},
                        }}
                        render={({field}) => (
                            <FormField error={errors.firstName?.message}>
                                <Input
                                    {...field}
                                    placeholder="Имя"
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
                            maxLength: {value: 50, message: 'Максимум 50 символов'},
                        }}
                        render={({field}) => (
                            <FormField error={errors.lastName?.message}>
                                <Input
                                    {...field}
                                    placeholder="Фамилия"
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
                        required: 'Укажите должность',
                        minLength: {value: 2, message: 'Минимум 2 символа'},
                        maxLength: {value: 80, message: 'Максимум 80 символов'},
                    }}
                    render={({field}) => (
                        <FormField error={errors.profession?.message}>
                            <Input
                                {...field}
                                placeholder="Должность"
                                status={errors.profession ? 'error' : undefined}
                            />
                        </FormField>
                    )}
                />
                <Controller
                    name="city"
                    control={control}
                    rules={{
                        required: 'Укажите адрес или город',
                        validate: (value) => isValidAddress(value) || 'Введите корректный адрес',
                    }}
                    render={({field}) => (
                        <FormField error={errors.city?.message}>
                            <Input
                                {...field}
                                placeholder="Город"
                                prefix={<GeoAltIcon/>}
                                status={errors.city ? 'error' : undefined}
                            />
                        </FormField>
                    )}
                />
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Контактные данные</h3>
                <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{
                        required: 'Укажите номер телефона',
                        validate: (value) => isValidPhone(value) || 'Введите корректный телефон (+7XXXXXXXXXX)',
                    }}
                    render={({field}) => (
                        <FormField error={errors.phoneNumber?.message}>
                            <Input
                                {...field}
                                placeholder="Телефон"
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
                        required: 'Укажите Telegram',
                        validate: (value) => isValidTelegram(value) || 'Некорректный Telegram (@username)',
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
                    Сохранить изменения
                </Button>
                <Button
                    type="text"
                    className="ep-btn ep-btn--m ep-btn--text"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Отменить изменения
                </Button>
            </div>
        </div>
    );
}
