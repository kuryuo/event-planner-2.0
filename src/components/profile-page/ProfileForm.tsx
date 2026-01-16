import {useEffect, useState} from "react";
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
    const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
    const [lastName, setLastName] = useState(initialData?.lastName ?? "");
    const [profession, setProfession] = useState(initialData?.profession ?? "");
    const [city, setCity] = useState(initialData?.city ?? "");
    // const [email, setEmail] = useState(initialData?.email ?? "");
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber ?? "");
    const [telegram, setTelegram] = useState(initialData?.telegram ?? "");

    useEffect(() => {
        if (!initialData) return;
        setFirstName(initialData.firstName ?? "");
        setLastName(initialData.lastName ?? "");
        setProfession(initialData.profession ?? "");
        setCity(initialData.city ?? "");
        // setEmail(initialData.email ?? "");
        setPhoneNumber(initialData.phoneNumber ?? "");
        setTelegram(initialData.telegram ?? "");
    }, [initialData]);

    const handleSubmit = () => {
        const formData = {
            firstName,
            lastName,
            profession,
            city,
            phoneNumber,
            telegram,
        };
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const handleCancel = () => {
        if (initialData) {
            setFirstName(initialData.firstName ?? "");
            setLastName(initialData.lastName ?? "");
            setProfession(initialData.profession ?? "");
            setCity(initialData.city ?? "");
            // setEmail(initialData.email ?? "");
            setPhoneNumber(initialData.phoneNumber ?? "");
            setTelegram(initialData.telegram ?? "");
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
                    <TextField
                        placeholder="Имя"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fieldSize="M"
                    />
                    <TextField
                        placeholder="Фамилия"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fieldSize="M"
                    />
                </div>
                <TextField
                    placeholder="Должность"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    fieldSize="M"
                />
                <TextField
                    placeholder="Город"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    leftIcon={<GeoAltIcon/>}
                    fieldSize="M"
                />
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
                <TextField
                    placeholder="Телефон"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    leftIcon={<TelephoneIcon/>}
                    fieldSize="M"
                />
                <TextField
                    placeholder="Telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    leftIcon={<TelegramIcon/>}
                    fieldSize="M"
                />
            </div>

            <div>
                <Button
                    variant="Filled"
                    color="gray"
                    onClick={handleSubmit}
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
