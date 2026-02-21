import CloseIcon from "@/assets/img/icon-m/x.svg";
import DateTimeSection from "../../ui/date-time/DateTimeSection.tsx";
import SegmentedControl from "../../ui/segmented-control/SegmentedControl.tsx";
import styles from "./EventForm.module.scss";
import TextField from "@/ui/text-field/TextField.tsx";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg";
import Plus from "@/assets/img/icon-s/plus-lg.svg";
import Select from "@/ui/select/Select.tsx";
import Chip from "@/ui/chip/Chip.tsx";
import TextArea from "@/ui/text-area/TextArea.tsx";
import Button from "@/ui/button/Button.tsx";
import {useEventForm} from "@/hooks/ui/useEventForm.ts";
import type {CreateEventPayload, EventResponse} from "@/types/api/Event.ts";
import {useNavigate} from "react-router-dom";
import {useGetCategoriesQuery} from "@/services/api/categoryApi.ts";
import Divider from "@/ui/divider/Divider";
import {useRef, useState} from "react";
import ImageIcon from "@/assets/img/icon-m/image.svg?react";

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
    const [participantName, setParticipantName] = useState("");
    const [participantsList, setParticipantsList] = useState<string[]>([]);
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
        avatarPreview,
        handleAvatarChange,
        showCategorySelect,
        setShowCategorySelect,
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

    const mockTypes = ["Хакатон", "Лекция", "Вебинар", "УрФУ", "ПП", "Спецкурс", "Практика"];

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
            <div className={styles.contentGrid}>
                <div className={styles.form}>
                    <div className={styles.section}>
                        <span className={styles.title}>Дата и время</span>
                        <DateTimeSection/>
                    </div>

                    <div className={styles.section}>
                        <span className={styles.title}>Место</span>
                        <SegmentedControl
                            options={["Очно", "Онлайн", "Гибрид"]}
                            selected={format}
                            onChange={setFormat}
                        />
                        <TextField
                            placeholder="Адрес"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            leftIcon={<img src={GeoAltIcon} alt="location"/>}
                            fieldSize="M"
                        />
                    </div>

                    <div className={styles.section}>
                        <span className={styles.title}>Тип</span>
                        <div className={styles.chipContainer}>
                            {mockTypes.map((type) => (
                                <Chip key={type} text={type} size="S" />
                            ))}
                        </div>
                    </div>

                    <Divider />

                    <div className={styles.section}>
                        <span className={styles.title}>Участники</span>
                        <div className={styles.inlineRow}>
                            <div className={styles.growField}>
                                <TextField
                                    placeholder="Имя"
                                    value={participantName}
                                    onChange={(e) => setParticipantName(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="Filled"
                                color="gray"
                                disabled={!participantName.trim()}
                                onClick={() => {
                                    const trimmed = participantName.trim();
                                    if (!trimmed) return;
                                    setParticipantsList((prev) => [...prev, trimmed]);
                                    setParticipantName("");
                                }}
                            >
                                Добавить
                            </Button>
                        </div>

                        {participantsList.length > 0 && (
                            <div className={styles.chipContainer}>
                                {participantsList.map((name) => (
                                    <Chip
                                        key={name}
                                        text={name}
                                        closable
                                        onClose={() => setParticipantsList((prev) => prev.filter((item) => item !== name))}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div className={styles.section}>
                        <span className={styles.title}>Теги</span>
                        <button
                            className={styles.categoryButton}
                            onClick={() => setShowCategorySelect(prev => !prev)}
                        >
                            <img src={Plus} alt="Добавить"/>
                        </button>

                        {showCategorySelect && (
                            <>
                                <Select
                                    placeholder="Выберите тег"
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
                    </div>

                    <div className={styles.section}>
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

                <div className={styles.coverPanel}>
                    <span className={styles.title}>Обложка</span>
                    <span className={styles.hint}>Рекомендуемый размер - 544x213 пикселей.</span>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenInput}
                        onChange={handleAvatarChange}
                    />

                    <button
                        type="button"
                        className={styles.coverUpload}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Обложка" className={styles.coverPreview} />
                        ) : (
                            <div className={styles.coverUploadInner}>
                                <ImageIcon />
                                <span>Загрузите изображение</span>
                            </div>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
