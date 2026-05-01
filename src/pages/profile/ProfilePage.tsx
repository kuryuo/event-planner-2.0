import {type ChangeEvent, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Tag} from 'antd';
import { AppShell } from '@/components/app-shell/AppShell';
import styles from './ProfilePage.module.scss';
import ChevronLeftIcon from '@/assets/img/icon-s/chevron-left.svg?react';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import Check2AllIcon from '@/assets/img/icon-m/check2-all.svg?react';
import EnvelopeIcon from '@/assets/img/icon-m/envelope.svg?react';
import TelephoneIcon from '@/assets/img/icon-m/telephone.svg?react';
import TelegramIcon from '@/assets/img/icon-m/telegram.svg?react';
import ImageIcon from '@/assets/img/icon-m/image.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import BoxArrowLeftIcon from '@/assets/img/icon-m/box-arrow-left.svg?react';
import EyeIcon from '@/assets/img/icon-m/eye.svg?react';
import EyeSlashIcon from '@/assets/img/icon-m/eye-slash.svg?react';
import {Button} from "antd";
import {Checkbox, Switch} from "antd";
import {Avatar} from "antd";
import {Input} from "antd";
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useAuth} from '@/hooks/api/useAuth.ts';
import {useAvatarUpload} from '@/hooks/api/useAvatarUpload.ts';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';
import {useGetProfileEventsQuery, useGetProfileQuery, useUpdateProfileMutation} from '@/services/api/profileApi.ts';
import {useGetUserEventsQuery, useGetUserProfileQuery} from '@/services/api/userApi.ts';
import ProfileActionModal from '@/components/profile-action-modal/ProfileActionModal.tsx';
import ProfileSnackbar, {type ProfileSnackbarVariant} from '@/components/profile-snackbar/ProfileSnackbar.tsx';
import {getApiErrorMessage} from '@/utils/apiError.ts';
import type {UserEvent} from '@/types/api/Profile.ts';
import {isValidPhone, isValidTelegram} from '@/utils/validation.ts';
import {useLazyGetMyBoardTasksQuery} from '@/services/api/eventApi.ts';

type SortKey = 'deadline' | 'status' | 'event' | 'title';
type ProfileModalType = 'email' | 'password' | 'logout' | 'delete' | null;

interface DisplayProfile {
    firstName: string;
    lastName: string;
    profession: string;
    phoneNumber: string;
    telegram: string;
    email: string;
    avatarUrl?: string;
    backgroundUrl?: string;
}

interface ToastMessage {
    id: number;
    text: string;
    variant: ProfileSnackbarVariant;
}

interface SettingsDraft {
    firstName: string;
    lastName: string;
    profession: string;
    telegram: string;
    phoneNumber: string;
}

interface SettingsDraftErrors {
    firstName?: string;
    lastName?: string;
    profession?: string;
    telegram?: string;
    phoneNumber?: string;
}

interface ProfileTask {
    id: string;
    title: string;
    event: string;
    eventCover: string;
    deadline: string;
    status: string;
    priority: string;
}

const FALLBACK_EVENT = '';
const EMPTY_EVENTS: UserEvent[] = [];

const SORT_OPTIONS: Array<{key: SortKey; label: string}> = [
    {key: 'deadline', label: 'По дедлайну'},
    {key: 'status', label: 'По статусу'},
    {key: 'event', label: 'По мероприятию'},
    {key: 'title', label: 'А -> Я'},
];

const formatEventDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Дата не указана';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatDeadline = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const mapPrivilege = (value?: number | string): string => {
    if (value === 'ADMIN' || value === 2) return 'Администратор';
    if (value === 'ORGANIZER' || value === 1) return 'Организатор';
    return 'Сотрудник ЦАИ';
};

export default function ProfilePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {logout} = useAuth();

    const userId = useMemo(() => new URLSearchParams(location.search).get('userId'), [location.search]);
    const isForeignProfile = Boolean(userId);

    const {data: ownProfile, isLoading: ownProfileLoading} = useGetProfileQuery(undefined, {skip: isForeignProfile});
    const {data: ownEventsRaw} = useGetProfileEventsQuery(undefined, {skip: isForeignProfile});
    const {data: foreignProfile, isLoading: foreignProfileLoading} = useGetUserProfileQuery(userId ?? '', {
        skip: !isForeignProfile,
    });
    const {data: foreignEventsRaw} = useGetUserEventsQuery(userId ?? '', {skip: !isForeignProfile});
    const [updateProfile, {isLoading: profileUpdating}] = useUpdateProfileMutation();
    const [loadMyBoardTasks] = useLazyGetMyBoardTasksQuery();
    const ownEvents = ownEventsRaw ?? EMPTY_EVENTS;
    const foreignEvents = foreignEventsRaw ?? EMPTY_EVENTS;
    const loadMyBoardTasksRef = useRef(loadMyBoardTasks);

    useEffect(() => {
        loadMyBoardTasksRef.current = loadMyBoardTasks;
    }, [loadMyBoardTasks]);

    const {
        fileInputRef,
        isUploading,
        triggerFileDialog,
        handleFileChange,
    } = useAvatarUpload();

    const coverInputRef = useRef<HTMLInputElement | null>(null);
    const avatarMenuRef = useRef<HTMLDivElement | null>(null);
    const sortMenuRef = useRef<HTMLDivElement | null>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [activeModal, setActiveModal] = useState<ProfileModalType>(null);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>('deadline');
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [profileTasks, setProfileTasks] = useState<ProfileTask[]>([]);

    const [draft, setDraft] = useState<SettingsDraft>({
        firstName: '',
        lastName: '',
        profession: '',
        telegram: '',
        phoneNumber: '',
    });
    const [draftErrors, setDraftErrors] = useState<SettingsDraftErrors>({});

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationChannels, setNotificationChannels] = useState({
        telegram: true,
        email: true,
        sms: true,
    });

    const [emailForm, setEmailForm] = useState({password: '', email: ''});
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        nextPassword: '',
        repeatPassword: '',
        error: '',
    });
    const [deletePassword, setDeletePassword] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        next: false,
        repeat: false,
        delete: false,
        email: false,
    });

    useClickOutside(avatarMenuRef, () => setAvatarMenuOpen(false), avatarMenuOpen);
    useClickOutside(sortMenuRef, () => setSortMenuOpen(false), sortMenuOpen);

    useEffect(() => {
        return () => {
            if (backgroundPreviewUrl) {
                URL.revokeObjectURL(backgroundPreviewUrl);
            }
        };
    }, [backgroundPreviewUrl]);

    const pushToast = (text: string, variant: ProfileSnackbarVariant = 'default') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, {id, text, variant}]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((item) => item.id !== id));
        }, 3500);
    };

    const displayProfile = useMemo<DisplayProfile | null>(() => {
        if (isForeignProfile) {
            if (!foreignProfile) {
                return null;
            }

            return {
                firstName: foreignProfile.firstName ?? '',
                lastName: foreignProfile.lastName ?? '',
                profession: foreignProfile.profession ?? mapPrivilege(foreignProfile.userPrivilege),
                phoneNumber: foreignProfile.phoneNumber ?? '',
                telegram: foreignProfile.telegram ?? '',
                email: foreignProfile.email ?? '',
                avatarUrl: buildImageUrl(foreignProfile.avatarUrl),
                backgroundUrl: buildImageUrl(foreignProfile.backgroundUrl),
            };
        }

        if (!ownProfile) {
            return null;
        }

        return {
            firstName: ownProfile.firstName ?? '',
            lastName: ownProfile.lastName ?? '',
            profession: ownProfile.profession ?? mapPrivilege(ownProfile.userPrivilege),
            phoneNumber: ownProfile.phoneNumber ?? '',
            telegram: ownProfile.telegram ?? '',
            email: ownProfile.email ?? '',
            avatarUrl: buildImageUrl(ownProfile.avatarUrl),
            backgroundUrl: buildImageUrl(ownProfile.backgroundUrl),
        };
    }, [isForeignProfile, foreignProfile, ownProfile]);

    useEffect(() => {
        if (!displayProfile || isForeignProfile) {
            return;
        }

        setDraft({
            firstName: displayProfile.firstName,
            lastName: displayProfile.lastName,
            profession: displayProfile.profession,
            telegram: displayProfile.telegram,
            phoneNumber: displayProfile.phoneNumber,
        });
    }, [displayProfile, isForeignProfile]);

    const subscribedEvents = isForeignProfile ? foreignEvents : ownEvents;

    useEffect(() => {
        let cancelled = false;

        const loadTasks = async () => {
            if (isForeignProfile || ownEvents.length === 0) {
                setProfileTasks([]);
                return;
            }

            const results = await Promise.allSettled(
                ownEvents.map(async (event) => {
                    const board = await loadMyBoardTasksRef.current(event.id).unwrap();
                    const columns = board?.result?.columns ?? board?.result?.boardColumns ?? board?.columns ?? board?.boardColumns ?? [];
                    return columns.flatMap((column: any) => {
                        const tasks = column?.tasks ?? column?.boardTasks ?? [];
                        return tasks.map((task: any): ProfileTask => ({
                            id: String(task.id),
                            title: task.title || 'Без названия',
                            event: event.name,
                            eventCover: buildImageUrl(event.avatar) ?? buildImageUrl(event.previewPhotos?.[0]) ?? FALLBACK_EVENT,
                            deadline: task.deadline || task.dueDate || '',
                            status: column?.name || 'Без статуса',
                            priority: task.priority === 'Urgent'
                                ? 'Срочный'
                                : task.priority === 'High'
                                    ? 'Высокий'
                                    : task.priority === 'Low'
                                        ? 'Низкий'
                                        : 'Средний',
                        }));
                    });
                })
            );

            if (cancelled) return;

            const merged = results
                .filter((result): result is PromiseFulfilledResult<ProfileTask[]> => result.status === 'fulfilled')
                .flatMap((result) => result.value);

            setProfileTasks(merged);
        };

        void loadTasks();

        return () => {
            cancelled = true;
        };
    }, [isForeignProfile, ownEvents]);

    const eventCards = useMemo(() => {
        return subscribedEvents.slice(0, 2).map((event: UserEvent) => ({
            id: event.id,
            title: event.name,
            date: formatEventDate(event.startDate),
            cover: buildImageUrl(event.avatar) ?? buildImageUrl(event.previewPhotos?.[0]),
        }));
    }, [subscribedEvents]);

    const sortedTasks = useMemo(() => {
        return [...profileTasks].sort((first, second) => {
            if (sortKey === 'deadline') {
                return new Date(first.deadline).getTime() - new Date(second.deadline).getTime();
            }
            if (sortKey === 'status') {
                return first.status.localeCompare(second.status, 'ru');
            }
            if (sortKey === 'event') {
                return first.event.localeCompare(second.event, 'ru');
            }
            return first.title.localeCompare(second.title, 'ru');
        });
    }, [sortKey, profileTasks]);

    const fullName = `${displayProfile?.firstName ?? ''} ${displayProfile?.lastName ?? ''}`.trim() || 'Пользователь';
    const coverImageSrc =
        backgroundPreviewUrl ?? buildImageUrl(displayProfile?.backgroundUrl) ?? null;
    const avatarUrl = displayProfile?.avatarUrl;
    const loading = ownProfileLoading || foreignProfileLoading;

    const handleBack = () => {
        navigate('/main');
    };

    const handleOpenSettings = () => {
        setDraftErrors({});
        setIsEditMode(true);
    };

    const handleCancelSettings = () => {
        if (displayProfile) {
            setDraft({
                firstName: displayProfile.firstName,
                lastName: displayProfile.lastName,
                profession: displayProfile.profession,
                telegram: displayProfile.telegram,
                phoneNumber: displayProfile.phoneNumber,
            });
        }
        setDraftErrors({});
        setIsEditMode(false);
    };

    const validateDraft = (value: SettingsDraft): SettingsDraftErrors => {
        const nextErrors: SettingsDraftErrors = {};

        if (!value.firstName.trim()) nextErrors.firstName = 'Введите имя';
        else if (value.firstName.trim().length < 2) nextErrors.firstName = 'Минимум 2 символа';

        if (!value.lastName.trim()) nextErrors.lastName = 'Введите фамилию';
        else if (value.lastName.trim().length < 2) nextErrors.lastName = 'Минимум 2 символа';

        if (!value.profession.trim()) nextErrors.profession = 'Введите должность';
        else if (value.profession.trim().length < 2) nextErrors.profession = 'Минимум 2 символа';

        if (!value.telegram.trim()) nextErrors.telegram = 'Введите Telegram';
        else if (!isValidTelegram(value.telegram)) nextErrors.telegram = 'Некорректный Telegram (@username)';

        if (!value.phoneNumber.trim()) nextErrors.phoneNumber = 'Введите номер телефона';
        else if (!isValidPhone(value.phoneNumber)) nextErrors.phoneNumber = 'Некорректный телефон (+7XXXXXXXXXX)';

        return nextErrors;
    };

    const handleDraftBlur = (field: keyof SettingsDraft) => {
        const errors = validateDraft(draft);
        setDraftErrors((prev) => ({...prev, [field]: errors[field]}));
    };

    const handleSaveSettings = async () => {
        if (isForeignProfile || !ownProfile) {
            return;
        }

        const errors = validateDraft(draft);
        setDraftErrors(errors);
        if (Object.keys(errors).length > 0) {
            pushToast('Исправьте ошибки в форме профиля', 'error');
            return;
        }

        try {
            await updateProfile({
                firstName: draft.firstName,
                lastName: draft.lastName,
                profession: draft.profession,
                telegram: draft.telegram,
                phoneNumber: draft.phoneNumber,
                city: ownProfile.city ?? '',
            }).unwrap();

            setIsEditMode(false);
            pushToast('Профиль успешно обновлен', 'success');
        } catch (error) {
            console.error('Не удалось сохранить настройки', error);
            pushToast(getApiErrorMessage(error, 'Ошибка при сохранении профиля'), 'error');
        }
    };

    const handleCoverUpload = () => {
        coverInputRef.current?.click();
    };

    const handleCoverFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setBackgroundPreviewUrl((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return URL.createObjectURL(file);
        });

        pushToast('Предпросмотр фона обновлен, API для фона пока в разработке', 'warning');
        event.target.value = '';
    };

    const handleClearCover = () => {
        if (backgroundPreviewUrl) {
            URL.revokeObjectURL(backgroundPreviewUrl);
            setBackgroundPreviewUrl(null);
        }
        pushToast('Фон сброшен', 'default');
    };

    const handleClearAvatar = () => {
        pushToast('Очистка аватара пока в разработке', 'warning');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleEmailSubmit = () => {
        if (!emailForm.password || !emailForm.email.includes('@')) {
            pushToast('Введите корректные данные для смены почты', 'error');
            return;
        }
        setActiveModal(null);
        setEmailForm({password: '', email: ''});
        pushToast('Почта успешно обновлена', 'success');
    };

    const handlePasswordSubmit = () => {
        if (!passwordForm.currentPassword) {
            setPasswordForm((prev) => ({...prev, error: 'Введите текущий пароль'}));
            return;
        }

        if (passwordForm.nextPassword.length < 8) {
            setPasswordForm((prev) => ({...prev, error: 'Минимум 8 символов в новом пароле'}));
            return;
        }

        if (passwordForm.nextPassword !== passwordForm.repeatPassword) {
            setPasswordForm((prev) => ({...prev, error: 'Новый пароль и повтор не совпадают'}));
            return;
        }

        setActiveModal(null);
        setPasswordForm({currentPassword: '', nextPassword: '', repeatPassword: '', error: ''});
        pushToast('Пароль успешно обновлен', 'success');
    };

    const handleDeleteSubmit = () => {
        setActiveModal(null);
        setDeletePassword('');
        pushToast('Удаление аккаунта пока в разработке', 'warning');
    };

    const renderProfileModal = () => {
        if (activeModal === 'email') {
            return (
                <ProfileActionModal
                    isOpen
                    title="Смена почты"
                    description="Для смены почты введите пароль и новый адрес."
                    onClose={() => setActiveModal(null)}
                    onConfirm={handleEmailSubmit}
                    confirmText="Сменить"
                    confirmDisabled={!emailForm.password || !emailForm.email}
                >
                    <div className="ep-field">
                        <label className="ep-field__label">Пароль</label>
                        <Input.Password
                            placeholder="Пароль"
                            value={emailForm.password}
                            onChange={(event) => setEmailForm((prev) => ({...prev, password: event.target.value}))}
                            className="ep-input ep-input--m"
                            iconRender={() => null}
                            type={showPasswords.email ? "text" : "password"}
                            suffix={(
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowPasswords((prev) => ({...prev, email: !prev.email}))}
                                    type="button"
                                >
                                    {showPasswords.email ? <EyeSlashIcon/> : <EyeIcon/>}
                                </button>
                            )}
                        />
                    </div>
                    <div className="ep-field">
                        <label className="ep-field__label">Новая почта</label>
                        <Input
                            type="email"
                            placeholder="Новая почта"
                            value={emailForm.email}
                            onChange={(event) => setEmailForm((prev) => ({...prev, email: event.target.value}))}
                            className="ep-input ep-input--m"
                        />
                    </div>
                </ProfileActionModal>
            );
        }

        if (activeModal === 'password') {
            return (
                <ProfileActionModal
                    isOpen
                    title="Смена пароля"
                    description="Введите текущий пароль и задайте новый. Новый пароль должен отличаться от предыдущего."
                    onClose={() => {
                        setActiveModal(null);
                        setPasswordForm({currentPassword: '', nextPassword: '', repeatPassword: '', error: ''});
                    }}
                    onConfirm={handlePasswordSubmit}
                    confirmText="Сменить"
                    confirmDisabled={!passwordForm.currentPassword || !passwordForm.nextPassword || !passwordForm.repeatPassword}
                >
                    <div className="ep-field">
                        <label className="ep-field__label">Текущий пароль</label>
                        <Input.Password
                            placeholder="Пароль"
                            value={passwordForm.currentPassword}
                            onChange={(event) => setPasswordForm((prev) => ({...prev, currentPassword: event.target.value, error: ''}))}
                            status={passwordForm.error ? "error" : undefined}
                            className="ep-input ep-input--m"
                            iconRender={() => null}
                            type={showPasswords.current ? "text" : "password"}
                            suffix={(
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowPasswords((prev) => ({...prev, current: !prev.current}))}
                                    type="button"
                                >
                                    {showPasswords.current ? <EyeSlashIcon/> : <EyeIcon/>}
                                </button>
                            )}
                        />
                        {passwordForm.error && (
                            <span className="ep-field__helper ep-field__helper--error">{passwordForm.error}</span>
                        )}
                    </div>
                    <div className="ep-field">
                        <label className="ep-field__label">Новый пароль</label>
                        <Input.Password
                            placeholder="Новый пароль"
                            value={passwordForm.nextPassword}
                            onChange={(event) => setPasswordForm((prev) => ({...prev, nextPassword: event.target.value, error: ''}))}
                            className="ep-input ep-input--m"
                            iconRender={() => null}
                            type={showPasswords.next ? "text" : "password"}
                            suffix={(
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowPasswords((prev) => ({...prev, next: !prev.next}))}
                                    type="button"
                                >
                                    {showPasswords.next ? <EyeSlashIcon/> : <EyeIcon/>}
                                </button>
                            )}
                        />
                        <span className="ep-field__helper">Минимум 8 символов, 1 цифра и 1 специальный символ</span>
                    </div>
                    <div className="ep-field">
                        <label className="ep-field__label">Повторите новый пароль</label>
                        <Input.Password
                            placeholder="Повторите пароль"
                            value={passwordForm.repeatPassword}
                            onChange={(event) => setPasswordForm((prev) => ({...prev, repeatPassword: event.target.value, error: ''}))}
                            className="ep-input ep-input--m"
                            iconRender={() => null}
                            type={showPasswords.repeat ? "text" : "password"}
                            suffix={(
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowPasswords((prev) => ({...prev, repeat: !prev.repeat}))}
                                    type="button"
                                >
                                    {showPasswords.repeat ? <EyeSlashIcon/> : <EyeIcon/>}
                                </button>
                            )}
                        />
                    </div>
                </ProfileActionModal>
            );
        }

        if (activeModal === 'logout') {
            return (
                <ProfileActionModal
                    isOpen
                    title="Выйти из аккаунта?"
                    description="Вы завершите текущую сессию и вернетесь на экран входа"
                    onClose={() => setActiveModal(null)}
                    onConfirm={handleLogout}
                    confirmText="Выйти"
                    confirmTone="danger"
                />
            );
        }

        if (activeModal === 'delete') {
            return (
                <ProfileActionModal
                    isOpen
                    title="Удалить аккаунт?"
                    description="Это действие необратимо. Все данные, включая мероприятия, задачи и историю действий, будут удалены"
                    onClose={() => setActiveModal(null)}
                    onConfirm={handleDeleteSubmit}
                    confirmText="Удалить аккаунт"
                    confirmTone="danger"
                    confirmDisabled={!deletePassword}
                >
                    <div className="ep-field">
                        <label className="ep-field__label">Пароль</label>
                        <Input.Password
                            placeholder="Пароль"
                            value={deletePassword}
                            onChange={(event) => setDeletePassword(event.target.value)}
                            className="ep-input ep-input--m"
                            iconRender={() => null}
                            type={showPasswords.delete ? "text" : "password"}
                            suffix={(
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowPasswords((prev) => ({...prev, delete: !prev.delete}))}
                                    type="button"
                                >
                                    {showPasswords.delete ? <EyeSlashIcon/> : <EyeIcon/>}
                                </button>
                            )}
                        />
                    </div>
                </ProfileActionModal>
            );
        }

        return null;
    };

    return (
        <AppShell
            pageWrapperClassName={styles.pageWrapper}
            sidebarColumnClassName={styles.sidebar}
            sidebarProps={{ notificationCount: 5 }}
        >
            <div className={styles.content}>
                <div className={styles.topBar}>
                    <button className={styles.backButton} onClick={handleBack}>
                        <ChevronLeftIcon/>
                    </button>
                    <Avatar className={`${styles.topAvatar} ep-avatar`} size={36} src={avatarUrl || undefined}>
                        {(fullName?.[0] ?? "—").toUpperCase()}
                    </Avatar>
                    <span className={styles.topTitle}>{isForeignProfile ? fullName : 'Вы'}</span>
                </div>

                <div className={styles.profileCard}>
                    <div className={styles.coverSection}>
                        {coverImageSrc ? (
                            <img className={styles.coverImage} src={coverImageSrc} alt="Обложка профиля"/>
                        ) : (
                            <div className={styles.coverPlaceholder} aria-hidden/>
                        )}

                        {!isForeignProfile && isEditMode && (
                            <div className={styles.coverActions}>
                                <button className={styles.coverActionButton} onClick={handleCoverUpload}>
                                    <ImageIcon/>
                                </button>
                                <button className={styles.coverActionButton} onClick={handleClearCover}>
                                    <TrashIcon/>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.avatarRow}>
                        <div className={styles.avatarWrapper}>
                            <Avatar className={`${styles.profileAvatar} ep-avatar`} size={96} src={avatarUrl || undefined}>
                                {(fullName?.[0] ?? "—").toUpperCase()}
                            </Avatar>

                            {!isForeignProfile && isEditMode && (
                                <div className={styles.avatarMenuWrapper} ref={avatarMenuRef}>
                                    <button
                                        className={styles.avatarMenuButton}
                                        onClick={() => setAvatarMenuOpen((prev) => !prev)}
                                    >
                                        <ImageIcon/>
                                    </button>

                                    {avatarMenuOpen && (
                                        <div className={styles.avatarMenuPanel}>
                                            <button
                                                className={styles.avatarMenuItem}
                                                onClick={() => {
                                                    setAvatarMenuOpen(false);
                                                    triggerFileDialog();
                                                }}
                                                disabled={isUploading}
                                            >
                                                Загрузить
                                            </button>
                                            <button
                                                className={styles.avatarMenuItem}
                                                onClick={() => {
                                                    setAvatarMenuOpen(false);
                                                    handleClearAvatar();
                                                }}
                                            >
                                                Очистить
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.headerInfo}>
                            <div>
                                <h1 className={styles.fullName}>{fullName}</h1>
                                <p className={styles.role}>{displayProfile?.profession || mapPrivilege(ownProfile?.userPrivilege)}</p>
                            </div>

                            {!isForeignProfile && !isEditMode && (
                                <Button
                                    type="default"
                                    className="ep-btn ep-btn--m ep-btn--filled-gray"
                                    onClick={handleOpenSettings}
                                >
                                    Настройки
                                </Button>
                            )}

                            {!isForeignProfile && isEditMode && (
                                <div className={styles.editActions}>
                                    <Button
                                        type="default"
                                        icon={<Check2AllIcon/>}
                                        className="ep-btn ep-btn--m ep-btn--filled-gray"
                                        onClick={handleSaveSettings}
                                        disabled={profileUpdating}
                                    >
                                        Сохранить
                                    </Button>
                                    <Button
                                        type="text"
                                        className="ep-btn ep-btn--m ep-btn--text"
                                        onClick={handleCancelSettings}
                                    >
                                        Отменить
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Загрузка профиля...</div>
                    ) : (
                        <>
                            {!isEditMode && (
                                <>
                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Контакты</h2>
                                        <div className={styles.contactList}>
                                            <div className={styles.contactRow}>
                                                <TelegramIcon/>
                                                <span className={styles.contactLabel}>Telegram</span>
                                                <span className={styles.contactValue}>{displayProfile?.telegram || 'Не указано'}</span>
                                            </div>
                                            <div className={styles.contactRow}>
                                                <TelephoneIcon/>
                                                <span className={styles.contactLabel}>Телефон</span>
                                                <span className={styles.contactValue}>{displayProfile?.phoneNumber || 'Не указано'}</span>
                                            </div>
                                            <div className={styles.contactRow}>
                                                <EnvelopeIcon/>
                                                <span className={styles.contactLabel}>Почта</span>
                                                <span className={styles.contactValue}>{displayProfile?.email || 'Не указано'}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>{isForeignProfile ? 'Сейчас участвует' : 'Вы участвуете'}</h2>
                                        {eventCards.length > 0 ? (
                                            <div className={styles.eventsList}>
                                                {eventCards.map((event) => (
                                                    <button
                                                        key={event.id}
                                                        type="button"
                                                        className={styles.eventPlate}
                                                        onClick={() => navigate(`/event?id=${event.id}`)}
                                                    >
                                                        <Avatar className={`${styles.eventPlateAvatar} ep-avatar`} shape="square" size={36} src={event.cover}>
                                                            {(event.title?.[0] ?? "—").toUpperCase()}
                                                        </Avatar>
                                                        <span className={styles.eventPlateText}>
                                                            <span className={styles.eventPlateTitle}>{event.title}</span>
                                                            <span className={styles.eventPlateDate}>{event.date}</span>
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={styles.emptyText}>Мероприятия появятся здесь</p>
                                        )}
                                    </section>

                                    <section className={styles.section}>
                                        <div className={styles.tasksHeader}>
                                            <h2 className={styles.sectionTitle}>Текущие задачи {profileTasks.length}</h2>
                                            <div className={styles.sortWrapper} ref={sortMenuRef}>
                                                <button
                                                    className={styles.sortButton}
                                                    onClick={() => setSortMenuOpen((prev) => !prev)}
                                                >
                                                    {SORT_OPTIONS.find((option) => option.key === sortKey)?.label}
                                                    <ChevronDownIcon className={sortMenuOpen ? styles.sortChevronOpen : undefined}/>
                                                </button>

                                                {sortMenuOpen && (
                                                    <div className={styles.sortMenu}>
                                                        {SORT_OPTIONS.map((option) => (
                                                            <button
                                                                key={option.key}
                                                                className={styles.sortMenuItem}
                                                                onClick={() => {
                                                                    setSortKey(option.key);
                                                                    setSortMenuOpen(false);
                                                                }}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.tasksTable}>
                                            <div className={styles.tableHead}>
                                                <span>Задача</span>
                                                <span>Мероприятие</span>
                                                <span>Дедлайн</span>
                                                <span>Статус</span>
                                                <span>Приоритет</span>
                                            </div>

                                            {sortedTasks.map((task) => (
                                                <div className={styles.tableRow} key={task.id}>
                                                    <span className={styles.taskCell}>{task.title}</span>
                                                    <span className={styles.eventCell}>
                                                        <img src={task.eventCover} alt={task.event} className={styles.eventCover}/>
                                                        {task.event}
                                                    </span>
                                                    <span>{formatDeadline(task.deadline)}</span>
                                                    <span>
                                                        <Tag bordered={false} className={styles.statusChip}>
                                                            {task.status}
                                                        </Tag>
                                                    </span>
                                                    <span>
                                                        <Tag bordered={false} className={styles.priorityChip}>
                                                            {task.priority}
                                                        </Tag>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {!isForeignProfile && isEditMode && (
                                <section className={styles.settingsSection}>
                                    <h2 className={styles.sectionTitleLarge}>Настройки аккаунта</h2>

                                    <div className={styles.settingsGrid}>
                                        <div className={styles.nameRow}>
                                            <div className="ep-field">
                                                <label className="ep-field__label">Имя</label>
                                                <Input
                                                    value={draft.firstName}
                                                    onChange={(event) => setDraft((prev) => ({...prev, firstName: event.target.value}))}
                                                    onBlur={() => handleDraftBlur('firstName')}
                                                    status={draftErrors.firstName ? "error" : undefined}
                                                    className="ep-input ep-input--m"
                                                />
                                                {draftErrors.firstName && (
                                                    <span className="ep-field__helper ep-field__helper--error">{draftErrors.firstName}</span>
                                                )}
                                            </div>
                                            <div className="ep-field">
                                                <label className="ep-field__label">Фамилия</label>
                                                <Input
                                                    value={draft.lastName}
                                                    onChange={(event) => setDraft((prev) => ({...prev, lastName: event.target.value}))}
                                                    onBlur={() => handleDraftBlur('lastName')}
                                                    status={draftErrors.lastName ? "error" : undefined}
                                                    className="ep-input ep-input--m"
                                                />
                                                {draftErrors.lastName && (
                                                    <span className="ep-field__helper ep-field__helper--error">{draftErrors.lastName}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ep-field">
                                            <label className="ep-field__label">Должность</label>
                                            <Input
                                                value={draft.profession}
                                                onChange={(event) => setDraft((prev) => ({...prev, profession: event.target.value}))}
                                                onBlur={() => handleDraftBlur('profession')}
                                                status={draftErrors.profession ? "error" : undefined}
                                                className="ep-input ep-input--m"
                                            />
                                            {draftErrors.profession && (
                                                <span className="ep-field__helper ep-field__helper--error">{draftErrors.profession}</span>
                                            )}
                                        </div>

                                        <div className="ep-field">
                                            <label className="ep-field__label">Telegram</label>
                                            <Input
                                                value={draft.telegram}
                                                prefix={<TelegramIcon/>}
                                                onChange={(event) => setDraft((prev) => ({...prev, telegram: event.target.value}))}
                                                onBlur={() => handleDraftBlur('telegram')}
                                                status={draftErrors.telegram ? "error" : undefined}
                                                className="ep-input ep-input--m"
                                            />
                                            {draftErrors.telegram && (
                                                <span className="ep-field__helper ep-field__helper--error">{draftErrors.telegram}</span>
                                            )}
                                        </div>

                                        <div className="ep-field">
                                            <label className="ep-field__label">Телефон</label>
                                            <Input
                                                value={draft.phoneNumber}
                                                prefix={<TelephoneIcon/>}
                                                onChange={(event) => setDraft((prev) => ({...prev, phoneNumber: event.target.value}))}
                                                onBlur={() => handleDraftBlur('phoneNumber')}
                                                status={draftErrors.phoneNumber ? "error" : undefined}
                                                className="ep-input ep-input--m"
                                            />
                                            {draftErrors.phoneNumber && (
                                                <span className="ep-field__helper ep-field__helper--error">{draftErrors.phoneNumber}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.settingsRow}>
                                        <div>
                                            <h3 className={styles.settingsRowTitle}>Уведомления</h3>
                                            <p className={styles.settingsRowText}>Включите, чтобы получать уведомления там, где вам удобно</p>
                                        </div>
                                        <Switch checked={notificationsEnabled} onChange={setNotificationsEnabled} className="ep-switch"/>
                                    </div>

                                    {notificationsEnabled && (
                                        <div className={styles.notificationsChannels}>
                                            <p className={styles.settingsRowTitle}>Способы получения уведомлений</p>
                                            <div className={styles.channelsList}>
                                                <label className={styles.channelItem}>
                                                    <TelegramIcon/>
                                                    <span>Telegram</span>
                                                    <Checkbox
                                                        checked={notificationChannels.telegram}
                                                        className="ep-checkbox"
                                                        onChange={(e) => setNotificationChannels((prev) => ({...prev, telegram: e.target.checked}))}
                                                    />
                                                </label>
                                                <label className={styles.channelItem}>
                                                    <EnvelopeIcon/>
                                                    <span>Почта</span>
                                                    <Checkbox
                                                        checked={notificationChannels.email}
                                                        className="ep-checkbox"
                                                        onChange={(e) => setNotificationChannels((prev) => ({...prev, email: e.target.checked}))}
                                                    />
                                                </label>
                                                <label className={styles.channelItem}>
                                                    <TelephoneIcon/>
                                                    <span>SMS</span>
                                                    <Checkbox
                                                        checked={notificationChannels.sms}
                                                        className="ep-checkbox"
                                                        onChange={(e) => setNotificationChannels((prev) => ({...prev, sms: e.target.checked}))}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.accountActions}>
                                        <div className={styles.accountActionRow}>
                                            <div>
                                                <h3 className={styles.settingsRowTitle}>Почта</h3>
                                                <p className={styles.settingsRowText}>{displayProfile?.email || 'Не указано'}</p>
                                            </div>
                                            <Button
                                                type="default"
                                                className="ep-btn ep-btn--m ep-btn--filled-gray"
                                                onClick={() => setActiveModal('email')}
                                            >
                                                Сменить почту
                                            </Button>
                                        </div>

                                        <div className={styles.accountActionRow}>
                                            <div>
                                                <h3 className={styles.settingsRowTitle}>Пароль</h3>
                                                <p className={styles.settingsRowText}>Отправим на почту ссылку для смены пароля</p>
                                            </div>
                                            <Button
                                                type="default"
                                                className="ep-btn ep-btn--m ep-btn--filled-gray"
                                                onClick={() => setActiveModal('password')}
                                            >
                                                Сменить пароль
                                            </Button>
                                        </div>

                                        <div className={styles.accountActionRow}>
                                            <div>
                                                <h3 className={styles.settingsRowTitle}>Выйти из аккаунта</h3>
                                                <p className={styles.settingsRowText}>Будет произведен выход на данном устройстве</p>
                                            </div>
                                            <Button
                                                type="text"
                                                icon={<BoxArrowLeftIcon/>}
                                                className="ep-btn ep-btn--m ep-btn--text"
                                                onClick={() => setActiveModal('logout')}
                                            >
                                                Выйти
                                            </Button>
                                        </div>

                                        <div className={styles.accountActionRow}>
                                            <div>
                                                <h3 className={styles.deleteTitle}>Удалить аккаунт</h3>
                                                <p className={styles.settingsRowText}>Аккаунт будет удален без возможности восстановления</p>
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                className="ep-btn ep-btn--m ep-btn--text"
                                                onClick={() => setActiveModal('delete')}
                                            >
                                                Удалить аккаунт
                                            </Button>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFileChange}
                disabled={isUploading}
            />
            <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleCoverFileChange}
            />

            {renderProfileModal()}

            <div className={styles.snackbarContainer}>
                {toasts.map((toast) => (
                    <ProfileSnackbar
                        key={toast.id}
                        text={toast.text}
                        variant={toast.variant}
                        onClose={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                    />
                ))}
            </div>
        </AppShell>
    );
}
