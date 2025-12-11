import {useState} from "react";
import styles from "./ProfileForm.module.scss";
import TextField from "@/ui/text-field/TextField.tsx";
import Button from "@/ui/button/Button.tsx";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg?react";
import EnvelopeIcon from "@/assets/img/icon-m/envelope.svg?react";
import TelephoneIcon from "@/assets/img/icon-m/telephone.svg?react";
import TelegramIcon from "@/assets/img/icon-m/telegram.svg?react";

interface ProfileFormProps {
    onSubmit?: (data: any) => void;
    onCancel?: () => void;
    loading?: boolean;
}

export default function ProfileForm({
                                        onSubmit,
                                        onCancel,
                                        loading = false
                                    }: ProfileFormProps) {
    const [firstName, setFirstName] = useState("Мария");
    const [lastName, setLastName] = useState("Пшеничная");
    const [position, setPosition] = useState("Продуктовый менеджер");
    const [location, setLocation] = useState("г. Екатеринбург");

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("+7 (994) 430-11-34");
    const [telegram, setTelegram] = useState("@pshenica_maria");

    const handleSubmit = () => {
        const formData = {
            firstName,
            lastName,
            position,
            location,
            email,
            phone,
            telegram,
        };
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const handleCancel = () => {
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
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    fieldSize="M"
                />
                <TextField
                    placeholder="Местоположение"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    leftIcon={<GeoAltIcon/>}
                    fieldSize="M"
                />
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Контактные данные</h3>
                <TextField
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<EnvelopeIcon/>}
                    fieldSize="M"
                />
                <TextField
                    placeholder="Телефон"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
