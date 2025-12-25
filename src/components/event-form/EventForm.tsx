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
import Chip from "@/ui/chip/Chip.tsx";
import PeopleIcon from "@/assets/img/icon-m/people.svg";
import Checkbox from "@/ui/checkbox/Checkbox.tsx";
import TextArea from "@/ui/text-area/TextArea.tsx";
import Button from "@/ui/button/Button.tsx";
import {useEventForm} from "@/hooks/ui/useEventForm.ts";
import type {CreateEventPayload, EventResponse} from "@/types/api/Event.ts";
import {filterDigits} from "@/utils/string.ts";
import {useNavigate} from "react-router-dom";
import {useGetCategoriesQuery} from "@/services/api/categoryApi.ts";
import {useRef} from "react";

interface EventFormProps {
    eventData?: EventResponse | null;
    onSubmit: (data: CreateEventPayload | any) => void;
    loading?: boolean;
    error?: string | null;
    isEditMode?: boolean;
}

export default function EventForm({
                                      eventData,
                                      onSubmit,
                                      loading: _loading = false,
                                      error: _error,
                                      isEditMode = false
                                  }: EventFormProps) {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const {data: categoriesData, isLoading: isLoadingCategories} = useGetCategoriesQuery();

    const categoryOptions = categoriesData?.result
        ? categoriesData.result.map(category => ({
            label: category.name,
            description: undefined
        }))
        : [];

    const {
        title,
        setTitle,
        format,
        setFormat,
        location,
        setLocation,
        avatarColor,
        setAvatarColor,
        avatarFile: _avatarFile,
        avatarPreview,
        handleAvatarChange,
        isPrivate,
        setIsPrivate,
        showCategorySelect,
        setShowCategorySelect,
        participants,
        setParticipants,
        isParticipantsUnlimited,
        setIsParticipantsUnlimited,
        roles,
        roleInputValue,
        setRoleInputValue,
        removeRole,
        handleRoleKeyDown,
        description,
        setDescription,
        categories,
        inputValue,
        setInputValue,
        addChip,
        removeChip,
        handleKeyDown,
        preparePayload,
    } = useEventForm(eventData);

    const handleSubmit = () => {
        const payload = preparePayload();
        if (payload) {
            onSubmit(payload);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

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
                <button className={styles.closeButton} onClick={handleClose}>
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
                        value={location}
                        onChange={e => setLocation(e.target.value)}
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
                            avatarUrl={avatarPreview || undefined}
                            name=""
                            onClick={() => fileInputRef.current?.click()}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={handleAvatarChange}
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
                                disabled={isLoadingCategories}
                                options={categoryOptions}
                                onOptionClick={(option) => {
                                    if (option.label) {
                                        addChip(option.label);
                                        setInputValue('');
                                    }
                                }}
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
                            onChange={(e) => setParticipants(filterDigits(e.target.value))}
                            disabled={isParticipantsUnlimited}
                            fieldSize="M"
                        />
                        <div className={styles.participantsToggle}>
                            <Checkbox
                                checked={isParticipantsUnlimited}
                                onChange={() => setIsParticipantsUnlimited(prev => !prev)}
                            />
                            <span className={styles.participantsLabel}>Не ограничено</span>
                        </div>
                    </div>

                    <div className={styles.participantsRoles}>
                        <div className={styles.chipContainer}>
                            {roles.map((role) => {
                                const isDefaultRole = role === "Организатор" || role === "Участник";
                                return (
                                    <Chip
                                        key={role}
                                        text={role}
                                        closable={!isDefaultRole}
                                        onClose={() => removeRole(role)}
                                    />
                                );
                            })}
                        </div>
                        <TextField
                            placeholder="Введите роль"
                            value={roleInputValue}
                            onChange={(e) => setRoleInputValue(e.target.value)}
                            onKeyDown={handleRoleKeyDown}
                        />
                    </div>
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
                    <Button variant="Filled" color="purple" type="button" onClick={handleSubmit}>
                        {isEditMode ? 'Сохранить изменения' : 'Создать'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
