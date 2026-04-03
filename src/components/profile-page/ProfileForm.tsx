import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import styles from "./ProfileForm.module.scss";
import TextField from "@/ui/text-field/TextField.tsx";
import Button from "@/ui/button/Button.tsx";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg?react";
// import EnvelopeIcon from "@/assets/img/icon-m/envelope.svg?react";
import TelephoneIcon from "@/assets/img/icon-m/telephone.svg?react";
import TelegramIcon from "@/assets/img/icon-m/telegram.svg?react";

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
    const {control, handleSubmit, reset, getValues} = useForm({
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

    const submitForm = () => {
        const formData = getValues();
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
                    <Controller name="firstName" control={control} render={({field}) => (
                        <TextField placeholder="Имя" value={field.value} onChange={field.onChange} fieldSize="M"/>
                    )}/>
                    <Controller name="lastName" control={control} render={({field}) => (
                        <TextField placeholder="Фамилия" value={field.value} onChange={field.onChange} fieldSize="M"/>
                    )}/>
                </div>
                <Controller name="profession" control={control} render={({field}) => (
                    <TextField placeholder="Должность" value={field.value} onChange={field.onChange} fieldSize="M"/>
                )}/>
                <Controller name="city" control={control} render={({field}) => (
                    <TextField
                        placeholder="Город"
                        value={field.value}
                        onChange={field.onChange}
                        leftIcon={<GeoAltIcon/>}
                        fieldSize="M"
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
                <Controller name="phoneNumber" control={control} render={({field}) => (
                    <TextField
                        placeholder="Телефон"
                        type="tel"
                        value={field.value}
                        onChange={field.onChange}
                        leftIcon={<TelephoneIcon/>}
                        fieldSize="M"
                    />
                )}/>
                <Controller name="telegram" control={control} render={({field}) => (
                    <TextField
                        placeholder="Telegram"
                        value={field.value}
                        onChange={field.onChange}
                        leftIcon={<TelegramIcon/>}
                        fieldSize="M"
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
