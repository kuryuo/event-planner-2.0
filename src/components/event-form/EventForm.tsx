import {useState} from "react";
import CloseIcon from "@/assets/img/icon-m/x.svg";
import DateTimeSection from "../../ui/date-time/DateTimeSection.tsx";
import SegmentedControl from "../../ui/segmented-control/SegmentedControl.tsx";
import styles from "./EventForm.module.scss";
import TextField from "@/ui/text-field/TextField.tsx";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg";
import Map from "@/assets/img/icon-m/map.svg";
import Avatar from "@/ui/avatar/Avatar.tsx";
import ColorPicker from "@/ui/color-picker/ColorPicker.tsx";

export default function EventForm() {
    const [title, setTitle] = useState("");
    const [format, setFormat] = useState("Очно");
    const [avatarColor, setAvatarColor] = useState("var(--pink-100)");

    return (
        <div className={styles.formWrapper}>
            <div className={styles.header}>
                <input
                    type="text"
                    placeholder="Название мероприятия"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button className={styles.closeButton}>
                    <img src={CloseIcon} alt="close"/>
                </button>
            </div>
            <div className={styles.form}>
                <div className={styles.date}>
                    <span className={styles.title}>Дата и место</span>
                    <DateTimeSection/>
                    <SegmentedControl
                        options={["Очно", "Онлайн", "Гибрид"]}
                        selected={format}
                        onChange={setFormat}
                    />
                    <TextField
                        placeholder="Место"
                        leftIcon={<img src={GeoAltIcon} alt="location"/>}
                        rightIcon={<img src={Map} alt="adornment"/>}
                        fieldSize="M"
                    />
                </div>
                <div className={styles.avatar}>
                    <span className={styles.title}>Аватар и цвет</span>
                    <div className={styles.avatarRow}>
                        <Avatar
                            size="L"
                            variant="update"
                            avatarUrl={undefined}
                            name=""
                        />
                        <ColorPicker
                            value={avatarColor}
                            onChange={setAvatarColor}
                        />
                    </div>
                    <span className={styles.hint}>
                        Рекомендуем изображение шириной минимум 160 пикселей
                    </span>
                </div>
            </div>
        </div>
    );
}