import {useState} from "react";
import CloseIcon from "@/assets/img/icon-m/x.svg";
import DateTimeSection from "../../ui/date-time/DateTimeSection.tsx";
import SegmentedControl from "../../ui/segmented-control/SegmentedControl.tsx";
import styles from "./EventForm.module.scss";
import TextField from "@/ui/text-field/TextField.tsx";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg";
import Map from "@/assets/img/icon-m/map.svg";
import Plus from "@/assets/img/icon-s/plus-lg.svg";
import Avatar from "@/ui/avatar/Avatar.tsx";
import ColorPicker from "@/ui/color-picker/ColorPicker.tsx";
import Switch from "@/ui/switch/Switch.tsx";
import Select from "@/ui/select/Select.tsx";
import {useChips} from "@/hooks/useChips.ts";
import Chip from "@/ui/chip/Chip.tsx";
import PeopleIcon from "@/assets/img/icon-m/people.svg";
import Checkbox from "@/ui/checkbox/Checkbox.tsx";
import TextArea from "@/ui/text-area/TextArea.tsx";
import Button from "@/ui/button/Button.tsx";


export default function EventForm() {
    const [title, setTitle] = useState("");
    const [format, setFormat] = useState("Очно");
    const [avatarColor, setAvatarColor] = useState("var(--pink-100)");
    const [isPrivate, setIsPrivate] = useState(false);
    const [showCategorySelect, setShowCategorySelect] = useState(false);
    const [participants, setParticipants] = useState("");
    const [isParticipantsUnlimited, setIsParticipantsUnlimited] = useState(true);
    const [roles, setRoles] = useState<string[]>(["Организатор"]);
    const [roleValue, setRoleValue] = useState("");
    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [description, setDescription] = useState("");

    const {
        chips: categories,
        inputValue,
        setInputValue,
        removeChip,
        handleKeyDown,
    } = useChips();


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

                <div className={styles.categories}>
                    <span className={styles.title}>Категория</span>
                    <button
                        className={styles.categoryButton}
                        onClick={() => setShowCategorySelect(prev => !prev)}
                    >
                        <img src={Plus} alt="Добавить"/>
                    </button>

                    {showCategorySelect && (
                        <>
                            <Select
                                placeholder="Выберите категорию"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                options={[
                                    {label: 'Маркетинг', description: 'SMM, PR, digital'},
                                    {label: 'IT', description: 'Разработка и технологии'},
                                    {label: 'Дизайн', description: 'UX/UI, графика'},
                                ]}
                            />

                            <div className={styles.chipContainer}>
                                {categories.map((category) => (
                                    <Chip
                                        key={category}
                                        text={category}
                                        closable
                                        onClose={() => removeChip(category)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <Switch
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                        label="Закрытое мероприятие"
                        labelPosition="right"
                        size="M"
                        disabled={false}
                    />
                </div>

                <div className={styles.participants}>
                    <span className={styles.title}>Участники</span>
                    <div className={styles.participantsRow}>
                        <TextField
                            placeholder="Количество"
                            leftIcon={<img src={PeopleIcon} alt="people"/>}
                            type="number"
                            inputMode="numeric"
                            pattern="\d*"
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value.replace(/\D/g, ""))}
                            disabled={isParticipantsUnlimited}
                            fieldSize="M"
                        />
                        <div className={styles.participantsToggle}>
                            <Checkbox
                                checked={isParticipantsUnlimited}
                                onChange={() => setIsParticipantsUnlimited(prev => !prev)}
                            />
                            <span className={styles.participantsToggleLabel}>не ограничено</span>
                        </div>
                    </div>

                    <div className={styles.participantsRoles}>
                        <div className={styles.chipContainer}>
                            {roles.map((role) => (
                                <Chip
                                    key={role}
                                    text={role}
                                    closable={role !== "Организатор"}
                                    onClose={() =>
                                        setRoles((prev) => prev.filter((item) => item !== role))
                                    }
                                />
                            ))}
                        </div>

                        <button
                            className={styles.categoryButton}
                            onClick={() => setShowRoleSelect((prev) => !prev)}
                        >
                            <img src={Plus} alt="Добавить роль"/>
                        </button>
                    </div>

                    {showRoleSelect && (
                        <Select
                            placeholder="Выберите роль"
                            value={roleValue}
                            onChange={(e) => {
                                const value = e.target.value;
                                setRoleValue(value);
                                if (value && !roles.includes(value)) {
                                    setRoles((prev) => [...prev, value]);
                                }
                            }}
                            options={[
                                {label: "Организатор", description: "Отвечает за мероприятие"},
                                {label: "Спикер", description: "Выступающий"},
                                {label: "Гость", description: "Посетитель"},
                            ]}
                        />
                    )}
                </div>

                <div className={styles.description}>
                    <TextArea
                        placeholder="Описание"
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className={styles.actions}>
                    <Button variant="Filled" color="purple" type="submit">
                        Создать
                    </Button>
                </div>
            </div>
        </div>
    );
}