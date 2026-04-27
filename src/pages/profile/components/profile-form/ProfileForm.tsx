import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import styles from "./ProfileForm.module.scss";
import TextField from "@/ui/text-field/TextField.tsx";
import Button from "@/ui/button/Button.tsx";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg?react";
// import EnvelopeIcon from "@/assets/img/icon-m/envelope.svg?react";
import TelephoneIcon from "@/assets/img/icon-m/telephone.svg?react";
import TelegramIcon from "@/assets/img/icon-m/telegram.svg?react";
import {isValidAddress, isValidPhone, isValidTelegram} from '@/utils/validation.ts';

interface ProfileFormProps {
    onSubmit?: (data: any) => void;
    onCancel?: () => void;
    loading?: boolean;
    initialData?: {
        firstName?: string;
        lastName?: string;
        profession?: string;
        city?: string;
        email?: string;
        phoneNumber?: string;
        telegram?: string;
    };
}

export default function ProfileForm({
                                        onSubmit,
                                        onCancel,
                                        loading = false,
                                        initialData,
                                    }: ProfileFormProps) {
    const {control, handleSubmit, reset, formState: {errors}} = useForm({
        mode: 'onBlur',
        defaultValues: {
            firstName: initialData?.firstName ?? '',
            lastName: initialData?.lastName ?? '',
            profession: initialData?.profession ?? '',
            city: initialData?.city ?? '',
            phoneNumber: initialData?.phoneNumber ?? '',
            telegram: initialData?.telegram ?? '',
        }
    });

    useEffect(() => {
        if (!initialData) return;
        reset({
            firstName: initialData.firstName ?? '',
            lastName: initialData.lastName ?? '',
            profession: initialData.profession ?? '',
            city: initialData.city ?? '',
            phoneNumber: initialData.phoneNumber ?? '',
            telegram: initialData.telegram ?? '',
        });
    }, [initialData, reset]);

    const submitForm = (formData: any) => {
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const handleCancel = () => {
        if (initialData) {
            reset({
                firstName: initialData.firstName ?? '',
                lastName: initialData.lastName ?? '',
                profession: initialData.profession ?? '',
                city: initialData.city ?? '',
                phoneNumber: initialData.phoneNumber ?? '',
                telegram: initialData.telegram ?? '',
            });
        }
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className={styles.formWrapper}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Личные данные</h3>
                <div className={styles.nameRow}>
                    <Controller name="firstName" control={control} rules={{
                        required: 'Имя обязательно',
                        minLength: {value: 2, message: 'Минимум 2 символа'},
                        maxLength: {value: 40, message: 'Максимум 40 символов'},
                    }} render={({field}) => (
                        <TextField
                            placeholder="Имя"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            fieldSize="M"
                            error={Boolean(errors.firstName)}
                            helperText={errors.firstName?.message as string | undefined}
                        />
                    )}/>
                    <Controller name="lastName" control={control} rules={{
                        required: 'Фамилия обязательна',
                        minLength: {value: 2, message: 'Минимум 2 символа'},
                        maxLength: {value: 50, message: 'Максимум 50 символов'},
                    }} render={({field}) => (
                        <TextField
                            placeholder="Фамилия"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            fieldSize="M"
                            error={Boolean(errors.lastName)}
                            helperText={errors.lastName?.message as string | undefined}
                        />
                    )}/>
                </div>
                <Controller name="profession" control={control} rules={{
                    required: 'Укажите должность',
                    minLength: {value: 2, message: 'Минимум 2 символа'},
                    maxLength: {value: 80, message: 'Максимум 80 символов'},
                }} render={({field}) => (
                    <TextField
                        placeholder="Должность"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        fieldSize="M"
                        error={Boolean(errors.profession)}
                        helperText={errors.profession?.message as string | undefined}
                    />
                )}/>
                <Controller name="city" control={control} rules={{
                    required: 'Укажите адрес или город',
                    validate: (value) => isValidAddress(value) || 'Введите корректный адрес',
                }} render={({field}) => (
                    <TextField
                        placeholder="Город"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        leftIcon={<GeoAltIcon/>}
                        fieldSize="M"
                        error={Boolean(errors.city)}
                        helperText={errors.city?.message as string | undefined}
                    />
                )}/>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Контактные данные</h3>
                {/* <TextField
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<EnvelopeIcon/>}
                    fieldSize="M"
                    disabled
                /> */}
                <Controller name="phoneNumber" control={control} rules={{
                    required: 'Укажите номер телефона',
                    validate: (value) => isValidPhone(value) || 'Введите корректный телефон (+7XXXXXXXXXX)',
                }} render={({field}) => (
                    <TextField
                        placeholder="Телефон"
                        type="tel"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        leftIcon={<TelephoneIcon/>}
                        fieldSize="M"
                        error={Boolean(errors.phoneNumber)}
                        helperText={errors.phoneNumber?.message as string | undefined}
                    />
                )}/>
                <Controller name="telegram" control={control} rules={{
                    required: 'Укажите Telegram',
                    validate: (value) => isValidTelegram(value) || 'Некорректный Telegram (@username)',
                }} render={({field}) => (
                    <TextField
                        placeholder="Telegram"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        leftIcon={<TelegramIcon/>}
                        fieldSize="M"
                        error={Boolean(errors.telegram)}
                        helperText={errors.telegram?.message as string | undefined}
                    />
                )}/>
            </div>

            <div>
                <Button
                    variant="Filled"
                    color="gray"
                    onClick={handleSubmit(submitForm)}
                    disabled={loading}
                >
                    Сохранить изменения
                </Button>
                <Button
                    variant="Text"
                    color="default"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Отменить изменения
                </Button>
            </div>
        </div>
    );
}
