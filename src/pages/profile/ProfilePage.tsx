import {type ChangeEvent, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Sidebar from '@/components/sidebar/Sidebar';
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
import Switch from '@/ui/switch/Switch.tsx';
import TextField from '@/ui/text-field/TextField.tsx';
import Button from '@/ui/button/Button.tsx';
import Checkbox from '@/ui/checkbox/Checkbox.tsx';
import EventPlate from '@/ui/event-plate/EventPlate.tsx';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useAuth} from '@/hooks/api/useAuth.ts';
import {useAvatarUpload} from '@/hooks/api/useAvatarUpload.ts';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';
import {useGetProfileEventsQuery, useGetProfileQuery, useUpdateProfileMutation} from '@/services/api/profileApi.ts';
import {useGetUserEventsQuery, useGetUserProfileQuery} from '@/services/api/userApi.ts';
import ProfileActionModal from '@/components/profile-page/ProfileActionModal.tsx';
import ProfileSnackbar, {type ProfileSnackbarVariant} from '@/components/profile-page/ProfileSnackbar.tsx';
import type {UserEvent} from '@/types/api/Profile.ts';

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

interface ProfileTask {
    id: string;
    title: string;
    event: string;
    eventCover: string;
    deadline: string;
    status: string;
    priority: string;
}

const FALLBACK_AVATAR = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=50';
const FALLBACK_EVENT = 'https://api.dicebear.com/7.x/shapes/png?size=100&radius=8';
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=1600&q=80';

const SORT_OPTIONS: Array<{key: SortKey; label: string}> = [
    {key: 'deadline', label: 'По дедлайну'},
    {key: 'status', label: 'По статусу'},
    {key: 'event', label: 'По мероприятию'},
    {key: 'title', label: 'А -> Я'},
];

const PROFILE_TASKS: ProfileTask[] = [
    {
        id: '1',
        title: 'Название задачи',
        event: 'Вселенная ИРИТ-РТФ 2026',
        eventCover: FALLBACK_EVENT,
        deadline: '2025-02-16',
        status: 'Запланировано',
        priority: 'Средний',
    },
    {
        id: '2',
        title: 'Название задачи',
        event: 'Вселенная ИРИТ-РТФ 2026',
        eventCover: FALLBACK_EVENT,
        deadline: '2025-02-16',
        status: 'Запланировано',
        priority: 'Средний',
    },
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
    const {data: ownEvents = []} = useGetProfileEventsQuery(undefined, {skip: isForeignProfile});
    const {data: foreignProfile, isLoading: foreignProfileLoading} = useGetUserProfileQuery(userId ?? '', {
        skip: !isForeignProfile,
    });
    const {data: foreignEvents = []} = useGetUserEventsQuery(userId ?? '', {skip: !isForeignProfile});
    const [updateProfile, {isLoading: profileUpdating}] = useUpdateProfileMutation();

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

    const [draft, setDraft] = useState<SettingsDraft>({
        firstName: '',
        lastName: '',
        profession: '',
        telegram: '',
        phoneNumber: '',
    });

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

    const eventCards = useMemo(() => {
        return subscribedEvents.slice(0, 2).map((event: UserEvent) => ({
            id: event.id,
            title: event.name,
            date: formatEventDate(event.startDate),
            cover: buildImageUrl(event.avatar) ?? buildImageUrl(event.previewPhotos?.[0]) ?? FALLBACK_EVENT,
        }));
    }, [subscribedEvents]);

    const sortedTasks = useMemo(() => {
        return [...PROFILE_TASKS].sort((first, second) => {
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
    }, [sortKey]);

    const fullName = `${displayProfile?.firstName ?? ''} ${displayProfile?.lastName ?? ''}`.trim() || 'Пользователь';
    const coverUrl = backgroundPreviewUrl ?? displayProfile?.backgroundUrl ?? FALLBACK_COVER;
    const avatarUrl = displayProfile?.avatarUrl ?? FALLBACK_AVATAR;
    const loading = ownProfileLoading || foreignProfileLoading;

    const handleBack = () => {
        navigate('/main');
    };

    const handleOpenSettings = () => {
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
        setIsEditMode(false);
    };

    const handleSaveSettings = async () => {
        if (isForeignProfile || !ownProfile) {
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
            pushToast('Ошибка при сохранении профиля', 'error');
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
                    <TextField
                        label="Пароль"
                        type={showPasswords.email ? 'text' : 'password'}
                        placeholder="Пароль"
                        value={emailForm.password}
                        onChange={(event) => setEmailForm((prev) => ({...prev, password: event.target.value}))}
                        rightIcon={(
                            <button
                                className={styles.iconButton}
                                onClick={() => setShowPasswords((prev) => ({...prev, email: !prev.email}))}
                                type="button"
                            >
                                {showPasswords.email ? <EyeSlashIcon/> : <EyeIcon/>}
                            </button>
                        )}
                    />
                    <TextField
                        label="Новая почта"
                        type="email"
                        placeholder="Новая почта"
                        value={emailForm.email}
                        onChange={(event) => setEmailForm((prev) => ({...prev, email: event.target.value}))}
                    />
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
                    <TextField
                        label="Текущий пароль"
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="Пароль"
                        error={Boolean(passwordForm.error)}
                        helperText={passwordForm.error}
                        value={passwordForm.currentPassword}
                        onChange={(event) => setPasswordForm((prev) => ({...prev, currentPassword: event.target.value, error: ''}))}
                        rightIcon={(
                            <button
                                className={styles.iconButton}
                                onClick={() => setShowPasswords((prev) => ({...prev, current: !prev.current}))}
                                type="button"
                            >
                                {showPasswords.current ? <EyeSlashIcon/> : <EyeIcon/>}
                            </button>
                        )}
                    />
                    <TextField
                        label="Новый пароль"
                        type={showPasswords.next ? 'text' : 'password'}
                        placeholder="Новый пароль"
                        helperText="Минимум 8 символов, 1 цифра и 1 специальный символ"
                        value={passwordForm.nextPassword}
                        onChange={(event) => setPasswordForm((prev) => ({...prev, nextPassword: event.target.value, error: ''}))}
                        rightIcon={(
                            <button
                                className={styles.iconButton}
                                onClick={() => setShowPasswords((prev) => ({...prev, next: !prev.next}))}
                                type="button"
                            >
                                {showPasswords.next ? <EyeSlashIcon/> : <EyeIcon/>}
                            </button>
                        )}
                    />
                    <TextField
                        label="Повторите новый пароль"
                        type={showPasswords.repeat ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        value={passwordForm.repeatPassword}
                        onChange={(event) => setPasswordForm((prev) => ({...prev, repeatPassword: event.target.value, error: ''}))}
                        rightIcon={(
                            <button
                                className={styles.iconButton}
                                onClick={() => setShowPasswords((prev) => ({...prev, repeat: !prev.repeat}))}
                                type="button"
                            >
                                {showPasswords.repeat ? <EyeSlashIcon/> : <EyeIcon/>}
                            </button>
                        )}
                    />
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
                    <TextField
                        label="Пароль"
                        type={showPasswords.delete ? 'text' : 'password'}
                        placeholder="Пароль"
                        value={deletePassword}
                        onChange={(event) => setDeletePassword(event.target.value)}
                        rightIcon={(
                            <button
                                className={styles.iconButton}
                                onClick={() => setShowPasswords((prev) => ({...prev, delete: !prev.delete}))}
                                type="button"
                            >
                                {showPasswords.delete ? <EyeSlashIcon/> : <EyeIcon/>}
                            </button>
                        )}
                    />
                </ProfileActionModal>
            );
        }

        return null;
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={5}/>
            </div>

            <div className={styles.content}>
                <div className={styles.topBar}>
                    <button className={styles.backButton} onClick={handleBack}>
                        <ChevronLeftIcon/>
                    </button>
                    <img className={styles.topAvatar} src={avatarUrl} alt={fullName}/>
                    <span className={styles.topTitle}>{isForeignProfile ? fullName : 'Вы'}</span>
                </div>

                <div className={styles.profileCard}>
                    <div className={styles.coverSection}>
                        <img className={styles.coverImage} src={coverUrl} alt="Обложка профиля"/>

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
                            <img className={styles.profileAvatar} src={avatarUrl} alt={fullName}/>

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
                                <Button variant="Filled" color="gray" onClick={handleOpenSettings}>
                                    Настройки
                                </Button>
                            )}

                            {!isForeignProfile && isEditMode && (
                                <div className={styles.editActions}>
                                    <Button
                                        variant="Filled"
                                        color="gray"
                                        leftIcon={<Check2AllIcon/>}
                                        onClick={handleSaveSettings}
                                        disabled={profileUpdating}
                                    >
                                        Сохранить
                                    </Button>
                                    <Button variant="Text" color="default" onClick={handleCancelSettings}>
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
                                                    <EventPlate
                                                        key={event.id}
                                                        title={event.title}
                                                        date={event.date}
                                                        avatarUrl={event.cover}
                                                        onClick={() => navigate(`/event?id=${event.id}`)}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={styles.emptyText}>Мероприятия появятся здесь</p>
                                        )}
                                    </section>

                                    <section className={styles.section}>
                                        <div className={styles.tasksHeader}>
                                            <h2 className={styles.sectionTitle}>Текущие задачи {PROFILE_TASKS.length}</h2>
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

                                        <p className={styles.sectionHint}>Канбан-доска в разработке</p>

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
                                                        <span className={styles.statusChip}>{task.status}</span>
                                                    </span>
                                                    <span>
                                                        <span className={styles.priorityChip}>{task.priority}</span>
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
                                            <TextField
                                                label="Имя"
                                                value={draft.firstName}
                                                onChange={(event) => setDraft((prev) => ({...prev, firstName: event.target.value}))}
                                            />
                                            <TextField
                                                label="Фамилия"
                                                value={draft.lastName}
                                                onChange={(event) => setDraft((prev) => ({...prev, lastName: event.target.value}))}
                                            />
                                        </div>

                                        <TextField
                                            label="Должность"
                                            value={draft.profession}
                                            onChange={(event) => setDraft((prev) => ({...prev, profession: event.target.value}))}
                                        />

                                        <TextField
                                            label="Telegram"
                                            value={draft.telegram}
                                            leftIcon={<TelegramIcon/>}
                                            onChange={(event) => setDraft((prev) => ({...prev, telegram: event.target.value}))}
                                        />

                                        <TextField
                                            label="Телефон"
                                            value={draft.phoneNumber}
                                            leftIcon={<TelephoneIcon/>}
                                            onChange={(event) => setDraft((prev) => ({...prev, phoneNumber: event.target.value}))}
                                        />
                                    </div>

                                    <div className={styles.settingsRow}>
                                        <div>
                                            <h3 className={styles.settingsRowTitle}>Уведомления</h3>
                                            <p className={styles.settingsRowText}>Включите, чтобы получать уведомления там, где вам удобно</p>
                                        </div>
                                        <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled}/>
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
                                                        onChange={() => setNotificationChannels((prev) => ({...prev, telegram: !prev.telegram}))}
                                                    />
                                                </label>
                                                <label className={styles.channelItem}>
                                                    <EnvelopeIcon/>
                                                    <span>Почта</span>
                                                    <Checkbox
                                                        checked={notificationChannels.email}
                                                        onChange={() => setNotificationChannels((prev) => ({...prev, email: !prev.email}))}
                                                    />
                                                </label>
                                                <label className={styles.channelItem}>
                                                    <TelephoneIcon/>
                                                    <span>SMS</span>
                                                    <Checkbox
                                                        checked={notificationChannels.sms}
                                                        onChange={() => setNotificationChannels((prev) => ({...prev, sms: !prev.sms}))}
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
                                            <Button variant="Filled" color="gray" onClick={() => setActiveModal('email')}>
                                                Сменить почту
                                            </Button>
                                        </div>

                                        <div className={styles.accountActionRow}>
                                            <div>
                                                <h3 className={styles.settingsRowTitle}>Пароль</h3>
                                                <p className={styles.settingsRowText}>Отправим на почту ссылку для смены пароля</p>
                                            </div>
                                            <Button variant="Filled" color="gray" onClick={() => setActiveModal('password')}>
                                                Сменить пароль
                                            </Button>
                                        </div>

                                        <div className={styles.accountActionRow}>
                                            <div>
                                                <h3 className={styles.settingsRowTitle}>Выйти из аккаунта</h3>
                                                <p className={styles.settingsRowText}>Будет произведен выход на данном устройстве</p>
                                            </div>
                                            <Button
                                                variant="Text"
                                                color="default"
                                                leftIcon={<BoxArrowLeftIcon/>}
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
                                            <Button variant="Text" color="red" onClick={() => setActiveModal('delete')}>
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
        </div>
    );
}
