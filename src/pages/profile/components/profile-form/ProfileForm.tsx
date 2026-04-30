import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import styles from "./ProfileForm.module.scss";
import {Input} from "antd";
import {Button} from "antd";
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
                        <div className="ep-field">
                            <Input
                                placeholder="Имя"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                status={errors.firstName ? "error" : undefined}
                                className="ep-input ep-input--m"
                            />
                            {errors.firstName?.message && (
                                <span className="ep-field__helper ep-field__helper--error">
                                    {String(errors.firstName.message)}
                                </span>
                            )}
                        </div>
                    )}/>
                    <Controller name="lastName" control={control} rules={{
                        required: 'Фамилия обязательна',
                        minLength: {value: 2, message: 'Минимум 2 символа'},
                        maxLength: {value: 50, message: 'Максимум 50 символов'},
                    }} render={({field}) => (
                        <div className="ep-field">
                            <Input
                                placeholder="Фамилия"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                status={errors.lastName ? "error" : undefined}
                                className="ep-input ep-input--m"
                            />
                            {errors.lastName?.message && (
                                <span className="ep-field__helper ep-field__helper--error">
                                    {String(errors.lastName.message)}
                                </span>
                            )}
                        </div>
                    )}/>
                </div>
                <Controller name="profession" control={control} rules={{
                    required: 'Укажите должность',
                    minLength: {value: 2, message: 'Минимум 2 символа'},
                    maxLength: {value: 80, message: 'Максимум 80 символов'},
                }} render={({field}) => (
                    <div className="ep-field">
                        <Input
                            placeholder="Должность"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            status={errors.profession ? "error" : undefined}
                            className="ep-input ep-input--m"
                        />
                        {errors.profession?.message && (
                            <span className="ep-field__helper ep-field__helper--error">
                                {String(errors.profession.message)}
                            </span>
                        )}
                    </div>
                )}/>
                <Controller name="city" control={control} rules={{
                    required: 'Укажите адрес или город',
                    validate: (value) => isValidAddress(value) || 'Введите корректный адрес',
                }} render={({field}) => (
                    <div className="ep-field">
                        <Input
                            placeholder="Город"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            prefix={<GeoAltIcon/>}
                            status={errors.city ? "error" : undefined}
                            className="ep-input ep-input--m"
                        />
                        {errors.city?.message && (
                            <span className="ep-field__helper ep-field__helper--error">
                                {String(errors.city.message)}
                            </span>
                        )}
                    </div>
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
                    <div className="ep-field">
                        <Input
                            placeholder="Телефон"
                            type="tel"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            prefix={<TelephoneIcon/>}
                            status={errors.phoneNumber ? "error" : undefined}
                            className="ep-input ep-input--m"
                        />
                        {errors.phoneNumber?.message && (
                            <span className="ep-field__helper ep-field__helper--error">
                                {String(errors.phoneNumber.message)}
                            </span>
                        )}
                    </div>
                )}/>
                <Controller name="telegram" control={control} rules={{
                    required: 'Укажите Telegram',
                    validate: (value) => isValidTelegram(value) || 'Некорректный Telegram (@username)',
                }} render={({field}) => (
                    <div className="ep-field">
                        <Input
                            placeholder="Telegram"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            prefix={<TelegramIcon/>}
                            status={errors.telegram ? "error" : undefined}
                            className="ep-input ep-input--m"
                        />
                        {errors.telegram?.message && (
                            <span className="ep-field__helper ep-field__helper--error">
                                {String(errors.telegram.message)}
                            </span>
                        )}
                    </div>
                )}/>
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
