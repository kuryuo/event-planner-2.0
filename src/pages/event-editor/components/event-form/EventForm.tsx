import CloseIcon from "@/assets/img/icon-m/x.svg?react";
import DateTimeSection from "./date-time-section/DateTimeSection";
import styles from "./EventForm.module.scss";
import {Input} from "antd";
import {Segmented} from "antd";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg?react";
import Link45Icon from "@/assets/img/icon-m/link-45deg.svg?react";
import Plus from "@/assets/img/icon-s/plus-lg.svg?react";
import {Button} from "antd";
import {useEventForm} from "@/hooks/ui/useEventForm.ts";
import type {CreateEventPayload, EventResponse} from "@/types/api/Event.ts";
import {useNavigate} from "react-router-dom";
import {useGetCategoriesQuery} from "@/services/api/categoryApi.ts";
import {Divider} from "antd";
import {useEffect, useMemo, useRef, useState} from "react";
import ImageIcon from "@/assets/img/icon-m/image.svg?react";
import {Tag} from "antd";
import {Dropdown} from "antd";
import type {MenuProps} from "antd";
import {Avatar} from "antd";
import {AutoComplete} from "antd";
import {Modal} from "antd";
import {useGetAdminUsersQuery} from "@/services/api/userApi.ts";
import XIcon from '@/assets/img/icon-s/x.svg?react';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import type {AdminUser} from "@/types/api/User.ts";
import {EVENT_TYPE_LABELS} from '@/utils/eventTypeLabels.ts';
import type {EventParticipantAssignment, ParticipantRoleKind} from "@/types/api/Event.ts";

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
    const [formError, setFormError] = useState<string>('');
    const [isAuditoriumVisible, setIsAuditoriumVisible] = useState(Boolean(eventData?.auditorium));
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
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
        auditorium,
        setAuditorium,
        avatarPreview,
        handleAvatarChange,
        showCategorySelect,
        setShowCategorySelect,
        participants,
        setParticipants,
        description,
        setDescription,
        categories,
        inputValue,
        setInputValue,
        addChip,
        removeChip,
        handleKeyDown,
        selectedTypes,
        toggleEventType,
        eventTypeOptions,
        preparePayload,
        validateForm,
    } = useEventForm(eventData);

    const tagAutocompleteOptions = useMemo(() => {
        const q = inputValue.trim().toLowerCase();
        return categoryOptions
            .map((o) => o.label)
            .filter((label) => !categories.includes(label))
            .filter((label) => !q || label.toLowerCase().includes(q))
            .map((label) => ({value: label}));
    }, [categoryOptions, categories, inputValue]);

    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

    useEffect(() => {
        if (showCategorySelect && tagAutocompleteOptions.length > 0) {
            setIsTagsDropdownOpen(true);
        }
    }, [showCategorySelect, tagAutocompleteOptions.length]);

    const [participantsQuery, setParticipantsQuery] = useState('');
    const [selectedUserCandidate, setSelectedUserCandidate] = useState<AdminUser | null>(null);
    const {data: usersData, isLoading: isUsersLoading} = useGetAdminUsersQuery(
        {count: 200, offset: 0},
    );

    const normalizedParticipantsQuery = participantsQuery.trim().toLowerCase();
    const filteredUsers = (usersData ?? []).filter((u) => {
        if (!normalizedParticipantsQuery) return true;
        const fullName = `${u.lastName ?? ''} ${u.firstName ?? ''} ${u.middleName ?? ''}`.trim().toLowerCase();
        return fullName.includes(normalizedParticipantsQuery);
    });

    const ROLE_LABELS: Record<ParticipantRoleKind, string> = {
        Organizer: 'Организатор',
        Editor: 'Редактор',
        Assistant: 'Помощник',
        Observer: 'Наблюдатель',
    };

    const roleMenuItems = (current: ParticipantRoleKind): MenuProps['items'] => {
        const roles: ParticipantRoleKind[] = ['Organizer', 'Editor', 'Assistant', 'Observer'];
        return roles.map((role) => ({
            key: role,
            label: (
                <span className={styles.roleMenuItem}>
                    <span>{ROLE_LABELS[role]}</span>
                    {current === role ? <Check2Icon className={styles.roleMenuCheck}/> : null}
                </span>
            ),
        }));
    };

    const addParticipant = (user: AdminUser) => {
        if (participants.some((p) => p.userId === user.id)) {
            setParticipantsQuery('');
            setSelectedUserCandidate(null);
            return;
        }
        const next: EventParticipantAssignment = {userId: user.id, role: 'Observer'};
        setParticipants([...participants, next]);
        setParticipantsQuery('');
        setSelectedUserCandidate(null);
    };

    const removeParticipant = (userId: string) => {
        setParticipants(participants.filter((p) => p.userId !== userId));
    };

    const setParticipantRole = (userId: string, role: ParticipantRoleKind) => {
        setParticipants(
            participants.map((p) => (p.userId === userId ? {...p, role} : p)),
        );
    };

    const tagTextStyleS = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 16,
        fontWeight: 450,
        lineHeight: "22px",
        padding: "2px 12px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;

    const tagTextStyleM = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14,
        fontWeight: 450,
        lineHeight: "18px",
        padding: "2px 16px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;

    useEffect(() => {
        if (auditorium.trim()) {
            setIsAuditoriumVisible(true);
        }
    }, [auditorium]);

    const handleSubmit = ({publish}: {publish?: boolean} = {}) => {
        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setFormError('');
        const payload = preparePayload({publish});
        if (payload) {
            onSubmit(payload);
        }
    };

    const handleClose = () => {
        setIsExitModalOpen(true);
    };

    return (
        <div className={styles.formWrapper}>
            <Modal
                open={isExitModalOpen}
                onCancel={() => setIsExitModalOpen(false)}
                footer={[
                    <Button key="back" onClick={() => setIsExitModalOpen(false)}>
                        Вернуться к созданию
                    </Button>,
                    <Button
                        key="draft"
                        type="default"
                        onClick={() => {
                            if (isEditMode) {
                                setIsExitModalOpen(false);
                                navigate(-1);
                                return;
                            }
                            handleSubmit({publish: false});
                        }}
                    >
                        Сохранить черновик
                    </Button>,
                    <Button key="exit" type="primary" danger onClick={() => navigate(-1)}>
                        Выйти
                    </Button>,
                ]}
                closable
                centered
                title="Выйти из создания мероприятия?"
            >
                <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                    <div style={{color: "var(--content-secondary)"}}>
                        Вы можете вернуться к созданию, чтобы продолжить редактирование.
                    </div>
                </div>
            </Modal>
            <div className={styles.header}>
                <input
                    type="text"
                    placeholder="Название мероприятия"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button className={styles.closeButton} onClick={handleClose}>
                    <CloseIcon/>
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
                        <Segmented
                            className="ep-segmented"
                            options={["Очно", "Онлайн", "Гибрид"]}
                            value={format}
                            onChange={(value) => {
                                setFormat(String(value));
                                if (value === 'Онлайн') {
                                    setLocation('');
                                }
                            }}
                            block
                        />
                        {format === 'Онлайн' && (
                            <Input
                                placeholder="Ссылка для подключения"
                                value={auditorium}
                                onChange={e => setAuditorium(e.target.value)}
                                prefix={<Link45Icon/>}
                                className="ep-input ep-input--m"
                            />
                        )}
                        {format === 'Гибрид' && (
                            <div className={styles.venueFieldsStack}>
                                <Input
                                    placeholder="Адрес"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    prefix={<GeoAltIcon/>}
                                    className="ep-input ep-input--m"
                                />
                                <Input
                                    placeholder="Ссылка для подключения"
                                    value={auditorium}
                                    onChange={e => setAuditorium(e.target.value)}
                                    prefix={<Link45Icon/>}
                                    className="ep-input ep-input--m"
                                />
                            </div>
                        )}
                        {format === 'Очно' && (
                            <>
                                <div className={styles.locationRow}>
                                    <div className={styles.addressField}>
                                        <Input
                                            placeholder="Адрес"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            prefix={<GeoAltIcon/>}
                                            className="ep-input ep-input--m"
                                        />
                                    </div>
                                    {!isAuditoriumVisible && (
                                        <Button
                                            type="default"
                                            className={`ep-btn ep-btn--m ep-btn--filled-gray ${styles.addAuditoriumButton}`}
                                            onClick={() => setIsAuditoriumVisible(true)}
                                        >
                                            Добавить аудиторию
                                        </Button>
                                    )}
                                </div>
                                {isAuditoriumVisible && (
                                    <Input
                                        placeholder="Аудитория"
                                        value={auditorium}
                                        onChange={e => setAuditorium(e.target.value)}
                                        className="ep-input ep-input--m"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <div className={styles.section}>
                        <span className={styles.title}>Тип</span>
                        <div className={styles.chipContainer}>
                            {eventTypeOptions.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className={styles.typeButton}
                                    onClick={() => toggleEventType(type)}
                                >
                                    <Tag
                                        bordered={!selectedTypes.includes(type)}
                                        style={{
                                            ...tagTextStyleS,
                                            backgroundColor: selectedTypes.includes(type)
                                                ? "var(--bg-secondary)"
                                                : "transparent",
                                            color: "var(--content-primary)",
                                            borderColor: selectedTypes.includes(type)
                                                ? "transparent"
                                                : "var(--border-primary)",
                                        }}
                                    >
                                        {EVENT_TYPE_LABELS[type]}
                                    </Tag>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Divider style={{margin: 0}}/>

                    <div className={styles.section}>
                        <span className={styles.title}>Участники</span>
                        <div className={styles.participantsCreator}>
                            <AutoComplete
                                className={styles.participantsAutoComplete}
                                value={participantsQuery}
                                onChange={(value) => {
                                    setParticipantsQuery(String(value));
                                    setSelectedUserCandidate(null);
                                }}
                                onSelect={(value) => {
                                    const selected = (usersData ?? []).find((u) => u.id === value) ?? null;
                                    if (selected) {
                                        const fullName =
                                            `${selected.lastName ?? ''} ${selected.firstName ?? ''} ${selected.middleName ?? ''}`.trim() || 'Без имени';
                                        setSelectedUserCandidate(selected);
                                        setParticipantsQuery(fullName);
                                    }
                                }}
                                open={Boolean(participantsQuery.trim())}
                                popupClassName={styles.participantsDropdown}
                                notFoundContent={
                                    isUsersLoading ? 'Загрузка...' : 'Ничего не найдено'
                                }
                                options={
                                    filteredUsers.map((u) => {
                                        const fullName =
                                            `${u.lastName ?? ''} ${u.firstName ?? ''} ${u.middleName ?? ''}`.trim() || 'Без имени';
                                        return {
                                            value: u.id,
                                            label: (
                                                <div className={styles.participantsOption}>
                                                    <Avatar className="ep-avatar" size={36} src={u.avatarUrl || undefined}>
                                                        {(fullName?.[0] ?? "—").toUpperCase()}
                                                    </Avatar>
                                                    <span className={styles.participantsOptionName}>{fullName}</span>
                                                </div>
                                            ),
                                        };
                                    })
                                }
                            >
                                <Input
                                    placeholder="Имя"
                                    className="ep-input ep-input--m"
                                />
                            </AutoComplete>

                            <Button
                                type="default"
                                className={`ep-btn ep-btn--m ep-btn--filled-gray ${styles.participantsAddBtn}`}
                                disabled={!selectedUserCandidate}
                                onClick={() => {
                                    if (selectedUserCandidate) {
                                        addParticipant(selectedUserCandidate);
                                    }
                                }}
                            >
                                Добавить
                            </Button>
                        </div>

                        {participants.length > 0 ? (
                            <div className={styles.participantsList}>
                                {participants.map((p) => {
                                    const user = (usersData ?? []).find((u) => u.id === p.userId);
                                    const fullName = user
                                        ? `${user.lastName ?? ''} ${user.firstName ?? ''} ${user.middleName ?? ''}`.trim() || 'Без имени'
                                        : p.userId;
                                    return (
                                        <div key={p.userId} className={styles.participantRow}>
                                            <div className={styles.participantLeft}>
                                                <Avatar className="ep-avatar" size={36} src={user?.avatarUrl || undefined}>
                                                    {(fullName?.[0] ?? "—").toUpperCase()}
                                                </Avatar>
                                                <span className={styles.participantName}>{fullName}</span>
                                            </div>

                                            <div className={styles.participantRight}>
                                                <Dropdown
                                                    trigger={['click']}
                                                    placement="bottomRight"
                                                    menu={{
                                                        items: roleMenuItems(p.role),
                                                        onClick: ({key}) => setParticipantRole(p.userId, key as ParticipantRoleKind),
                                                    }}
                                                >
                                                    <button type="button" className={styles.roleButtonAsSelect}>
                                                        <span>{ROLE_LABELS[p.role]}</span>
                                                        <ChevronDownIcon className={styles.chevronIcon}/>
                                                    </button>
                                                </Dropdown>

                                                <button
                                                    type="button"
                                                    className={styles.removeParticipantBtn}
                                                    aria-label="Удалить"
                                                    onClick={() => removeParticipant(p.userId)}
                                                >
                                                    <XIcon className={styles.removeParticipantIcon}/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    <Divider style={{margin: 0}}/>

                    <div className={styles.section}>
                        <span className={styles.title}>Теги</span>
                        <button
                            className={styles.categoryButton}
                            onClick={() => setShowCategorySelect(prev => !prev)}
                        >
                            <Plus/>
                        </button>

                        {showCategorySelect && (
                            <>
                                <AutoComplete
                                    className={`${styles.categoriesAutocomplete} ep-input ep-input--m`}
                                    value={inputValue}
                                    options={tagAutocompleteOptions}
                                    open={isTagsDropdownOpen && tagAutocompleteOptions.length > 0}
                                    onDropdownVisibleChange={setIsTagsDropdownOpen}
                                    onChange={(v) => {
                                        setInputValue(String(v));
                                        setIsTagsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsTagsDropdownOpen(true)}
                                    onSelect={(value) => {
                                        addChip(String(value));
                                        setInputValue('');
                                        setIsTagsDropdownOpen(false);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoadingCategories}
                                    placeholder="Введите тег или выберите из списка"
                                    filterOption={false}
                                    allowClear
                                />

                                <div className={styles.chipContainer}>
                                    {categories.map((category) => (
                                        <Tag
                                            key={category}
                                            closable
                                            onClose={() => removeChip(category)}
                                            style={{
                                                ...tagTextStyleM,
                                                backgroundColor: "var(--bg-secondary)",
                                                color: "var(--content-primary)",
                                                border: "none",
                                            }}
                                        >
                                            {category}
                                        </Tag>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.section}>
                        <div className="ep-textarea-field">
                            <div className="ep-textarea-field__label-row">
                                <label className="ep-textarea-field__label">Описание</label>
                                <span className="ep-textarea-field__counter">{String(description ?? '').length}/800</span>
                            </div>
                            <Input.TextArea
                                className="ep-textarea"
                                placeholder="Описание"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                autoSize={{minRows: 1}}
                                maxLength={800}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        {formError && <div className={styles.error}>{formError}</div>}
                        <Button
                            type="primary"
                            className="ep-btn ep-btn--m ep-btn--filled-purple"
                            onClick={() => handleSubmit({publish: true})}
                        >
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
                            <img src={avatarPreview} alt="Обложка" className={styles.coverPreview}/>
                        ) : (
                            <div className={styles.coverUploadInner}>
                                <ImageIcon/>
                                <span>Загрузите изображение</span>
                            </div>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
