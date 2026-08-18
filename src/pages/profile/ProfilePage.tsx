import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tag } from "antd";
import { AppShell } from "@/components/app-shell/AppShell";
import styles from "./ProfilePage.module.scss";
import ChevronLeftIcon from "@/assets/img/icon-s/chevron-left.svg?react";
import ChevronDownIcon from "@/assets/img/icon-m/chevron-down.svg?react";
import Check2AllIcon from "@/assets/img/icon-m/check2-all.svg?react";
import EnvelopeIcon from "@/assets/img/icon-m/envelope.svg?react";
import TelephoneIcon from "@/assets/img/icon-m/telephone.svg?react";
import TelegramIcon from "@/assets/img/icon-m/telegram.svg?react";
import ImageIcon from "@/assets/img/icon-m/image.svg?react";
import TrashIcon from "@/assets/img/icon-m/trash.svg?react";
import BoxArrowLeftIcon from "@/assets/img/icon-m/box-arrow-left.svg?react";
import EyeIcon from "@/assets/img/icon-m/eye.svg?react";
import EyeSlashIcon from "@/assets/img/icon-m/eye-slash.svg?react";
import { Button } from "antd";
import { Checkbox, Switch } from "antd";
import { Avatar } from "antd";
import { Input } from "antd";
import { buildImageUrl } from "@/utils/buildImageUrl.ts";
import { useAuth } from "@/hooks/api/useAuth.ts";
import { useAvatarUpload } from "@/hooks/api/useAvatarUpload.ts";
import { useClickOutside } from "@/hooks/ui/useClickOutside.ts";
import {
  useGetProfileEventsQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/api/profileApi.ts";
import {
  useGetUserEventsQuery,
  useGetUserProfileQuery,
} from "@/services/api/userApi.ts";
import ProfileActionModal from "@/components/profile-action-modal/ProfileActionModal.tsx";
import ProfileSnackbar, {
  type ProfileSnackbarVariant,
} from "@/components/profile-snackbar/ProfileSnackbar.tsx";
import { getApiErrorMessage } from "@/utils/apiError.ts";
import type { UserEvent } from "@/types/api/Profile.ts";
import { isValidPhone, isValidTelegram } from "@/utils/validation.ts";
import { useLazyGetMyBoardTasksQuery } from "@/services/api/eventApi.ts";
import { useI18n } from "@/i18n/I18nProvider";

type SortKey = "deadline" | "status" | "event" | "title";
type ProfileModalType = "email" | "password" | "logout" | "delete" | null;

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

const FALLBACK_EVENT = "/mock-assets/event.svg";
const EMPTY_EVENTS: UserEvent[] = [];

const SORT_OPTIONS: Array<{ key: SortKey }> = [
  { key: "deadline" },
  { key: "status" },
  { key: "event" },
  { key: "title" },
];

const formatEventDate = (
  value: string,
  language: "ru" | "en",
  dateNotSpecifiedLabel: string
): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return dateNotSpecifiedLabel;
  }

  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDeadline = (value: string, language: "ru" | "en"): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const mapPrivilege = (
  value: number | string | undefined,
  labels: { admin: string; organizer: string; employee: string }
): string => {
  if (value === "ADMIN" || value === 2) return labels.admin;
  if (value === "ORGANIZER" || value === 1) return labels.organizer;
  return labels.employee;
};

export default function ProfilePage() {
  const { t, language } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const userId = useMemo(
    () => new URLSearchParams(location.search).get("userId"),
    [location.search]
  );
  const isForeignProfile = Boolean(userId);

  const { data: ownProfile, isLoading: ownProfileLoading } = useGetProfileQuery(
    undefined,
    { skip: isForeignProfile }
  );
  const { data: ownEventsRaw } = useGetProfileEventsQuery(undefined, {
    skip: isForeignProfile,
  });
  const { data: foreignProfile, isLoading: foreignProfileLoading } =
    useGetUserProfileQuery(userId ?? "", {
      skip: !isForeignProfile,
    });
  const { data: foreignEventsRaw } = useGetUserEventsQuery(userId ?? "", {
    skip: !isForeignProfile,
  });
  const [updateProfile, { isLoading: profileUpdating }] =
    useUpdateProfileMutation();
  const [loadMyBoardTasks] = useLazyGetMyBoardTasksQuery();
  const ownEvents = ownEventsRaw ?? EMPTY_EVENTS;
  const foreignEvents = foreignEventsRaw ?? EMPTY_EVENTS;
  const loadMyBoardTasksRef = useRef(loadMyBoardTasks);

  useEffect(() => {
    loadMyBoardTasksRef.current = loadMyBoardTasks;
  }, [loadMyBoardTasks]);

  const { fileInputRef, isUploading, triggerFileDialog, handleFileChange } =
    useAvatarUpload();

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeModal, setActiveModal] = useState<ProfileModalType>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<
    string | null
  >(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [profileTasks, setProfileTasks] = useState<ProfileTask[]>([]);

  const [draft, setDraft] = useState<SettingsDraft>({
    firstName: "",
    lastName: "",
    profession: "",
    telegram: "",
    phoneNumber: "",
  });
  const [draftErrors, setDraftErrors] = useState<SettingsDraftErrors>({});

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationChannels, setNotificationChannels] = useState({
    telegram: true,
    email: true,
    sms: true,
  });

  const [emailForm, setEmailForm] = useState({ password: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    nextPassword: "",
    repeatPassword: "",
    error: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    repeat: false,
    delete: false,
    email: false,
  });

  useClickOutside(
    avatarMenuRef,
    () => setAvatarMenuOpen(false),
    avatarMenuOpen
  );
  useClickOutside(sortMenuRef, () => setSortMenuOpen(false), sortMenuOpen);

  useEffect(() => {
    return () => {
      if (backgroundPreviewUrl) {
        URL.revokeObjectURL(backgroundPreviewUrl);
      }
    };
  }, [backgroundPreviewUrl]);

  const pushToast = (
    text: string,
    variant: ProfileSnackbarVariant = "default"
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, variant }]);
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
        firstName: foreignProfile.firstName ?? "",
        lastName: foreignProfile.lastName ?? "",
        profession:
          foreignProfile.profession ??
          mapPrivilege(foreignProfile.userPrivilege, {
            admin: t("profilePage.admin"),
            organizer: t("profilePage.organizer"),
            employee: t("profilePage.employee"),
          }),
        phoneNumber: foreignProfile.phoneNumber ?? "",
        telegram: foreignProfile.telegram ?? "",
        email: foreignProfile.email ?? "",
        avatarUrl: buildImageUrl(foreignProfile.avatarUrl),
        backgroundUrl: buildImageUrl(foreignProfile.backgroundUrl),
      };
    }

    if (!ownProfile) {
      return null;
    }

    return {
      firstName: ownProfile.firstName ?? "",
      lastName: ownProfile.lastName ?? "",
      profession:
        ownProfile.profession ??
        mapPrivilege(ownProfile.userPrivilege, {
          admin: t("profilePage.admin"),
          organizer: t("profilePage.organizer"),
          employee: t("profilePage.employee"),
        }),
      phoneNumber: ownProfile.phoneNumber ?? "",
      telegram: ownProfile.telegram ?? "",
      email: ownProfile.email ?? "",
      avatarUrl: buildImageUrl(ownProfile.avatarUrl),
      backgroundUrl: buildImageUrl(ownProfile.backgroundUrl),
    };
  }, [isForeignProfile, foreignProfile, ownProfile, t]);

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
          const columns =
            board?.result?.columns ??
            board?.result?.boardColumns ??
            board?.columns ??
            board?.boardColumns ??
            [];
          return columns.flatMap((column) => {
            const tasks = column.tasks ?? column.boardTasks ?? [];

            return tasks.map(
              (task): ProfileTask => ({
                id: String(task.id),
                title: task.title || t("profilePage.untitled"),
                event: event.name,
                eventCover:
                  buildImageUrl(event.avatar) ??
                  buildImageUrl(event.previewPhotos?.[0]) ??
                  FALLBACK_EVENT,
                deadline: task.deadline || task.dueDate || "",
                status: column?.name || t("profilePage.noStatus"),
                priority:
                  task.priority === "Urgent"
                    ? t("eventPage.kanban.priorities.urgent")
                    : task.priority === "High"
                    ? t("eventPage.kanban.priorities.high")
                    : task.priority === "Low"
                    ? t("eventPage.kanban.priorities.low")
                    : t("eventPage.kanban.priorities.medium"),
              })
            );
          });
        })
      );

      if (cancelled) return;

      const merged = results
        .filter(
          (result): result is PromiseFulfilledResult<ProfileTask[]> =>
            result.status === "fulfilled"
        )
        .flatMap((result) => result.value);

      setProfileTasks(merged);
    };

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [isForeignProfile, ownEvents, t]);

  const eventCards = useMemo(() => {
    return subscribedEvents.slice(0, 2).map((event: UserEvent) => ({
      id: event.id,
      title: event.name,
      date: formatEventDate(
        event.startDate,
        language,
        t("profilePage.dateNotSpecified")
      ),
      cover:
        buildImageUrl(event.avatar) ?? buildImageUrl(event.previewPhotos?.[0]),
    }));
  }, [subscribedEvents, language, t]);

  const sortedTasks = useMemo(() => {
    return [...profileTasks].sort((first, second) => {
      if (sortKey === "deadline") {
        return (
          new Date(first.deadline).getTime() -
          new Date(second.deadline).getTime()
        );
      }
      if (sortKey === "status") {
        return first.status.localeCompare(second.status, "ru");
      }
      if (sortKey === "event") {
        return first.event.localeCompare(second.event, "ru");
      }
      return first.title.localeCompare(second.title, "ru");
    });
  }, [sortKey, profileTasks]);

  const fullName =
    `${displayProfile?.firstName ?? ""} ${
      displayProfile?.lastName ?? ""
    }`.trim() || t("profilePage.user");
  const coverImageSrc =
    backgroundPreviewUrl ??
    buildImageUrl(displayProfile?.backgroundUrl) ??
    null;
  const avatarUrl = displayProfile?.avatarUrl;
  const loading = ownProfileLoading || foreignProfileLoading;

  const handleBack = () => {
    navigate("/main");
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

    if (!value.firstName.trim())
      nextErrors.firstName = t("profilePage.firstNameRequired");
    else if (value.firstName.trim().length < 2)
      nextErrors.firstName = t("common.errors.minTwoChars");

    if (!value.lastName.trim())
      nextErrors.lastName = t("profilePage.lastNameRequired");
    else if (value.lastName.trim().length < 2)
      nextErrors.lastName = t("common.errors.minTwoChars");

    if (!value.profession.trim())
      nextErrors.profession = t("profilePage.professionRequired");
    else if (value.profession.trim().length < 2)
      nextErrors.profession = t("common.errors.minTwoChars");

    if (!value.telegram.trim())
      nextErrors.telegram = t("profilePage.telegramRequired");
    else if (!isValidTelegram(value.telegram))
      nextErrors.telegram = t("profilePage.invalidTelegram");

    if (!value.phoneNumber.trim())
      nextErrors.phoneNumber = t("profilePage.phoneRequired");
    else if (!isValidPhone(value.phoneNumber))
      nextErrors.phoneNumber = t("profilePage.invalidPhone");

    return nextErrors;
  };

  const handleDraftBlur = (field: keyof SettingsDraft) => {
    const errors = validateDraft(draft);
    setDraftErrors((prev) => ({ ...prev, [field]: errors[field] }));
  };

  const handleSaveSettings = async () => {
    if (isForeignProfile || !ownProfile) {
      return;
    }

    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) {
      pushToast(t("profilePage.fixErrors"), "error");
      return;
    }

    try {
      await updateProfile({
        firstName: draft.firstName,
        lastName: draft.lastName,
        profession: draft.profession,
        telegram: draft.telegram,
        phoneNumber: draft.phoneNumber,
        city: ownProfile.city ?? "",
      }).unwrap();

      setIsEditMode(false);
      pushToast(t("profilePage.settingsSaved"), "success");
    } catch (error) {
      console.error(t("profilePage.settingsSaveFailed"), error);
      pushToast(
        getApiErrorMessage(error, t("profilePage.settingsSaveError")),
        "error"
      );
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

    pushToast(
      t("profilePage.backgroundPreviewUpdated"),
      "warning"
    );
    event.target.value = "";
  };

  const handleClearCover = () => {
    if (backgroundPreviewUrl) {
      URL.revokeObjectURL(backgroundPreviewUrl);
      setBackgroundPreviewUrl(null);
    }
    pushToast(t("profilePage.backgroundReset"), "default");
  };

  const handleClearAvatar = () => {
    pushToast(t("profilePage.avatarClearInDevelopment"), "warning");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleEmailSubmit = () => {
    if (!emailForm.password || !emailForm.email.includes("@")) {
      pushToast(t("profilePage.emailChangeInvalid"), "error");
      return;
    }
    setActiveModal(null);
    setEmailForm({ password: "", email: "" });
    pushToast(t("profilePage.emailChanged"), "success");
  };

  const handlePasswordSubmit = () => {
    if (!passwordForm.currentPassword) {
      setPasswordForm((prev) => ({
        ...prev,
        error: t("profilePage.currentPasswordRequired"),
      }));
      return;
    }

    if (passwordForm.nextPassword.length < 8) {
      setPasswordForm((prev) => ({
        ...prev,
        error: t("profilePage.newPasswordMin"),
      }));
      return;
    }

    if (passwordForm.nextPassword !== passwordForm.repeatPassword) {
      setPasswordForm((prev) => ({
        ...prev,
        error: t("profilePage.passwordRepeatMismatch"),
      }));
      return;
    }

    setActiveModal(null);
    setPasswordForm({
      currentPassword: "",
      nextPassword: "",
      repeatPassword: "",
      error: "",
    });
    pushToast(t("profilePage.passwordChanged"), "success");
  };

  const handleDeleteSubmit = () => {
    setActiveModal(null);
    setDeletePassword("");
    pushToast(t("profilePage.accountDeleteInDevelopment"), "warning");
  };

  const renderProfileModal = () => {
    if (activeModal === "email") {
      return (
        <ProfileActionModal
          isOpen
          title={t("profilePage.emailChangeTitle")}
          description={t("profilePage.emailChangeDescription")}
          onClose={() => setActiveModal(null)}
          onConfirm={handleEmailSubmit}
          confirmText={t("profilePage.changeAction")}
          confirmDisabled={!emailForm.password || !emailForm.email}
        >
          <div className="ep-field">
            <label className="ep-field__label">{t("profilePage.passwordLabel")}</label>
            <Input.Password
              placeholder={t("profilePage.passwordLabel")}
              value={emailForm.password}
              onChange={(event) =>
                setEmailForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              className="ep-input ep-input--m"
              iconRender={() => null}
              type={showPasswords.email ? "text" : "password"}
              suffix={
                <button
                  className={styles.iconButton}
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      email: !prev.email,
                    }))
                  }
                  type="button"
                >
                  {showPasswords.email ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
            />
          </div>
          <div className="ep-field">
            <label className="ep-field__label">{t("profilePage.newEmailLabel")}</label>
            <Input
              type="email"
              placeholder={t("profilePage.newEmailPlaceholder")}
              value={emailForm.email}
              onChange={(event) =>
                setEmailForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="ep-input ep-input--m"
            />
          </div>
        </ProfileActionModal>
      );
    }

    if (activeModal === "password") {
      return (
        <ProfileActionModal
          isOpen
          title={t("profilePage.passwordChangeTitle")}
          description={t("profilePage.passwordChangeDescription")}
          onClose={() => {
            setActiveModal(null);
            setPasswordForm({
              currentPassword: "",
              nextPassword: "",
              repeatPassword: "",
              error: "",
            });
          }}
          onConfirm={handlePasswordSubmit}
          confirmText={t("profilePage.changeAction")}
          confirmDisabled={
            !passwordForm.currentPassword ||
            !passwordForm.nextPassword ||
            !passwordForm.repeatPassword
          }
        >
          <div className="ep-field">
            <label className="ep-field__label">{t("profilePage.currentPasswordLabel")}</label>
            <Input.Password
              placeholder={t("profilePage.passwordLabel")}
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                  error: "",
                }))
              }
              status={passwordForm.error ? "error" : undefined}
              className="ep-input ep-input--m"
              iconRender={() => null}
              type={showPasswords.current ? "text" : "password"}
              suffix={
                <button
                  className={styles.iconButton}
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  type="button"
                >
                  {showPasswords.current ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
            />
            {passwordForm.error && (
              <span className="ep-field__helper ep-field__helper--error">
                {passwordForm.error}
              </span>
            )}
          </div>
          <div className="ep-field">
            <label className="ep-field__label">{t("profilePage.newPasswordLabel")}</label>
            <Input.Password
              placeholder={t("profilePage.newPasswordLabel")}
              value={passwordForm.nextPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  nextPassword: event.target.value,
                  error: "",
                }))
              }
              className="ep-input ep-input--m"
              iconRender={() => null}
              type={showPasswords.next ? "text" : "password"}
              suffix={
                <button
                  className={styles.iconButton}
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, next: !prev.next }))
                  }
                  type="button"
                >
                  {showPasswords.next ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
            />
            <span className="ep-field__helper">
              {t("profilePage.passwordHint")}
            </span>
          </div>
          <div className="ep-field">
            <label className="ep-field__label">{t("profilePage.repeatNewPasswordLabel")}</label>
            <Input.Password
              placeholder={t("profilePage.repeatPasswordPlaceholder")}
              value={passwordForm.repeatPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  repeatPassword: event.target.value,
                  error: "",
                }))
              }
              className="ep-input ep-input--m"
              iconRender={() => null}
              type={showPasswords.repeat ? "text" : "password"}
              suffix={
                <button
                  className={styles.iconButton}
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      repeat: !prev.repeat,
                    }))
                  }
                  type="button"
                >
                  {showPasswords.repeat ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
            />
          </div>
        </ProfileActionModal>
      );
    }

    if (activeModal === "logout") {
      return (
        <ProfileActionModal
          isOpen
          title={t("profilePage.logoutModalTitle")}
          description={t("profilePage.logoutModalDescription")}
          onClose={() => setActiveModal(null)}
          onConfirm={handleLogout}
          confirmText={t("profilePage.logoutAction")}
          confirmTone="danger"
        />
      );
    }

    if (activeModal === "delete") {
      return (
        <ProfileActionModal
          isOpen
          title={t("profilePage.deleteModalTitle")}
          description={t("profilePage.deleteModalDescription")}
          onClose={() => setActiveModal(null)}
          onConfirm={handleDeleteSubmit}
          confirmText={t("profilePage.deleteAction")}
          confirmTone="danger"
          confirmDisabled={!deletePassword}
        >
          <div className="ep-field">
            <label className="ep-field__label">{t("profilePage.passwordLabel")}</label>
            <Input.Password
              placeholder={t("profilePage.passwordLabel")}
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className="ep-input ep-input--m"
              iconRender={() => null}
              type={showPasswords.delete ? "text" : "password"}
              suffix={
                <button
                  className={styles.iconButton}
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      delete: !prev.delete,
                    }))
                  }
                  type="button"
                >
                  {showPasswords.delete ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
            />
          </div>
        </ProfileActionModal>
      );
    }

    return null;
  };

  const sortOptionLabels: Record<SortKey, string> = {
    deadline: t("profilePage.sortByDeadline"),
    status: t("profilePage.sortByStatus"),
    event: t("profilePage.sortByEvent"),
    title: t("profilePage.sortByTitle"),
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
            <ChevronLeftIcon />
          </button>
          <Avatar
            className={`${styles.topAvatar} ep-avatar`}
            size={36}
            src={avatarUrl || undefined}
          >
            {(fullName?.[0] ?? "—").toUpperCase()}
          </Avatar>
          <span className={styles.topTitle}>
            {isForeignProfile ? fullName : t("profilePage.you")}
          </span>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.coverSection}>
            {coverImageSrc ? (
              <img
                className={styles.coverImage}
                src={coverImageSrc}
                alt={t("profilePage.profileCover")}
              />
            ) : (
              <div className={styles.coverPlaceholder} aria-hidden />
            )}

            {!isForeignProfile && isEditMode && (
              <div className={styles.coverActions}>
                <button
                  className={styles.coverActionButton}
                  onClick={handleCoverUpload}
                >
                  <ImageIcon />
                </button>
                <button
                  className={styles.coverActionButton}
                  onClick={handleClearCover}
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>

          <div className={styles.avatarRow}>
            <div className={styles.avatarWrapper}>
              <Avatar
                className={`${styles.profileAvatar} ep-avatar`}
                size={96}
                src={avatarUrl || undefined}
              >
                {(fullName?.[0] ?? "—").toUpperCase()}
              </Avatar>

              {!isForeignProfile && isEditMode && (
                <div className={styles.avatarMenuWrapper} ref={avatarMenuRef}>
                  <button
                    className={styles.avatarMenuButton}
                    onClick={() => setAvatarMenuOpen((prev) => !prev)}
                  >
                    <ImageIcon />
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
                        {t("profilePage.upload")}
                      </button>
                      <button
                        className={styles.avatarMenuItem}
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          handleClearAvatar();
                        }}
                      >
                        {t("common.actions.clear")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.headerInfo}>
              <div>
                <h1 className={styles.fullName}>{fullName}</h1>
                <p className={styles.role}>
                  {displayProfile?.profession ||
                    mapPrivilege(ownProfile?.userPrivilege, {
                      admin: t("profilePage.admin"),
                      organizer: t("profilePage.organizer"),
                      employee: t("profilePage.employee"),
                    })}
                </p>
              </div>

              {!isForeignProfile && !isEditMode && (
                <Button
                  type="default"
                  className="ep-btn ep-btn--m ep-btn--filled-gray"
                  onClick={handleOpenSettings}
                >
                  {t("profilePage.accountSettings")}
                </Button>
              )}

              {!isForeignProfile && isEditMode && (
                <div className={styles.editActions}>
                  <Button
                    type="default"
                    icon={<Check2AllIcon />}
                    className="ep-btn ep-btn--m ep-btn--filled-gray"
                    onClick={handleSaveSettings}
                    disabled={profileUpdating}
                  >
                    {t("common.actions.save")}
                  </Button>
                  <Button
                    type="text"
                    className="ep-btn ep-btn--m ep-btn--text"
                    onClick={handleCancelSettings}
                  >
                    {t("common.actions.cancel")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>{t("profilePage.loading")}</div>
          ) : (
            <>
              {!isEditMode && (
                <>
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("profilePage.contacts")}</h2>
                    <div className={styles.contactList}>
                      <div className={styles.contactRow}>
                        <TelegramIcon />
                        <span className={styles.contactLabel}>Telegram</span>
                        <span className={styles.contactValue}>
                          {displayProfile?.telegram || t("profilePage.notSpecified")}
                        </span>
                      </div>
                      <div className={styles.contactRow}>
                        <TelephoneIcon />
                        <span className={styles.contactLabel}>{t("profile.phone")}</span>
                        <span className={styles.contactValue}>
                          {displayProfile?.phoneNumber || t("profilePage.notSpecified")}
                        </span>
                      </div>
                      <div className={styles.contactRow}>
                        <EnvelopeIcon />
                        <span className={styles.contactLabel}>{t("profilePage.emailTitle")}</span>
                        <span className={styles.contactValue}>
                          {displayProfile?.email || t("profilePage.notSpecified")}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {isForeignProfile
                        ? t("profilePage.nowParticipates")
                        : t("profilePage.youParticipate")}
                    </h2>
                    {eventCards.length > 0 ? (
                      <div className={styles.eventsList}>
                        {eventCards.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            className={styles.eventPlate}
                            onClick={() => navigate(`/event?id=${event.id}`)}
                          >
                            <Avatar
                              className={`${styles.eventPlateAvatar} ep-avatar`}
                              shape="square"
                              size={36}
                              src={event.cover}
                            >
                              {(event.title?.[0] ?? "—").toUpperCase()}
                            </Avatar>
                            <span className={styles.eventPlateText}>
                              <span className={styles.eventPlateTitle}>
                                {event.title}
                              </span>
                              <span className={styles.eventPlateDate}>
                                {event.date}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyText}>
                        {t("profilePage.eventsWillAppear")}
                      </p>
                    )}
                  </section>

                  <section className={styles.section}>
                    <div className={styles.tasksHeader}>
                      <h2 className={styles.sectionTitle}>
                        {t("profilePage.currentTasks", { count: profileTasks.length })}
                      </h2>
                      <div className={styles.sortWrapper} ref={sortMenuRef}>
                        <button
                          className={styles.sortButton}
                          onClick={() => setSortMenuOpen((prev) => !prev)}
                        >
                          {sortOptionLabels[sortKey]}
                          <ChevronDownIcon
                            className={
                              sortMenuOpen ? styles.sortChevronOpen : undefined
                            }
                          />
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
                                {sortOptionLabels[option.key]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.tasksTable}>
                      <div className={styles.tableHead}>
                        <span>{t("profilePage.task")}</span>
                        <span>{t("profilePage.event")}</span>
                        <span>{t("profilePage.deadline")}</span>
                        <span>{t("profilePage.status")}</span>
                        <span>{t("profilePage.priority")}</span>
                      </div>

                      {sortedTasks.map((task) => (
                        <div className={styles.tableRow} key={task.id}>
                          <span className={styles.taskCell}>{task.title}</span>
                          <span className={styles.eventCell}>
                            <img
                              src={task.eventCover}
                              alt={task.event}
                              className={styles.eventCover}
                            />
                            {task.event}
                          </span>
                          <span>{formatDeadline(task.deadline, language)}</span>
                          <span>
                            <Tag bordered={false} className={styles.statusChip}>
                              {task.status}
                            </Tag>
                          </span>
                          <span>
                            <Tag
                              bordered={false}
                              className={styles.priorityChip}
                            >
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
                  <h2 className={styles.sectionTitleLarge}>
                    {t("profilePage.accountSettings")}
                  </h2>

                  <div className={styles.settingsGrid}>
                    <div className={styles.nameRow}>
                      <div className="ep-field">
                        <label className="ep-field__label">{t("profilePage.firstNameLabel")}</label>
                        <Input
                          value={draft.firstName}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              firstName: event.target.value,
                            }))
                          }
                          onBlur={() => handleDraftBlur("firstName")}
                          status={draftErrors.firstName ? "error" : undefined}
                          className="ep-input ep-input--m"
                        />
                        {draftErrors.firstName && (
                          <span className="ep-field__helper ep-field__helper--error">
                            {draftErrors.firstName}
                          </span>
                        )}
                      </div>
                      <div className="ep-field">
                        <label className="ep-field__label">{t("profilePage.lastNameLabel")}</label>
                        <Input
                          value={draft.lastName}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              lastName: event.target.value,
                            }))
                          }
                          onBlur={() => handleDraftBlur("lastName")}
                          status={draftErrors.lastName ? "error" : undefined}
                          className="ep-input ep-input--m"
                        />
                        {draftErrors.lastName && (
                          <span className="ep-field__helper ep-field__helper--error">
                            {draftErrors.lastName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ep-field">
                      <label className="ep-field__label">{t("profilePage.professionLabel")}</label>
                      <Input
                        value={draft.profession}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            profession: event.target.value,
                          }))
                        }
                        onBlur={() => handleDraftBlur("profession")}
                        status={draftErrors.profession ? "error" : undefined}
                        className="ep-input ep-input--m"
                      />
                      {draftErrors.profession && (
                        <span className="ep-field__helper ep-field__helper--error">
                          {draftErrors.profession}
                        </span>
                      )}
                    </div>

                    <div className="ep-field">
                      <label className="ep-field__label">Telegram</label>
                      <Input
                        value={draft.telegram}
                        prefix={<TelegramIcon />}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            telegram: event.target.value,
                          }))
                        }
                        onBlur={() => handleDraftBlur("telegram")}
                        status={draftErrors.telegram ? "error" : undefined}
                        className="ep-input ep-input--m"
                      />
                      {draftErrors.telegram && (
                        <span className="ep-field__helper ep-field__helper--error">
                          {draftErrors.telegram}
                        </span>
                      )}
                    </div>

                    <div className="ep-field">
                      <label className="ep-field__label">{t("profile.phone")}</label>
                      <Input
                        value={draft.phoneNumber}
                        prefix={<TelephoneIcon />}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            phoneNumber: event.target.value,
                          }))
                        }
                        onBlur={() => handleDraftBlur("phoneNumber")}
                        status={draftErrors.phoneNumber ? "error" : undefined}
                        className="ep-input ep-input--m"
                      />
                      {draftErrors.phoneNumber && (
                        <span className="ep-field__helper ep-field__helper--error">
                          {draftErrors.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.settingsRow}>
                    <div>
                      <h3 className={styles.settingsRowTitle}>{t("profilePage.notificationsTitle")}</h3>
                      <p className={styles.settingsRowText}>
                        {t("profilePage.notificationsDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onChange={setNotificationsEnabled}
                      className="ep-switch"
                    />
                  </div>

                  {notificationsEnabled && (
                    <div className={styles.notificationsChannels}>
                      <p className={styles.settingsRowTitle}>
                        {t("profilePage.notificationChannels")}
                      </p>
                      <div className={styles.channelsList}>
                        <label className={styles.channelItem}>
                          <TelegramIcon />
                          <span>Telegram</span>
                          <Checkbox
                            checked={notificationChannels.telegram}
                            className="ep-checkbox"
                            onChange={(e) =>
                              setNotificationChannels((prev) => ({
                                ...prev,
                                telegram: e.target.checked,
                              }))
                            }
                          />
                        </label>
                        <label className={styles.channelItem}>
                          <EnvelopeIcon />
                          <span>{t("profilePage.emailChannel")}</span>
                          <Checkbox
                            checked={notificationChannels.email}
                            className="ep-checkbox"
                            onChange={(e) =>
                              setNotificationChannels((prev) => ({
                                ...prev,
                                email: e.target.checked,
                              }))
                            }
                          />
                        </label>
                        <label className={styles.channelItem}>
                          <TelephoneIcon />
                          <span>SMS</span>
                          <Checkbox
                            checked={notificationChannels.sms}
                            className="ep-checkbox"
                            onChange={(e) =>
                              setNotificationChannels((prev) => ({
                                ...prev,
                                sms: e.target.checked,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <div className={styles.accountActions}>
                    <div className={styles.accountActionRow}>
                      <div>
                        <h3 className={styles.settingsRowTitle}>{t("profilePage.emailTitle")}</h3>
                        <p className={styles.settingsRowText}>
                          {displayProfile?.email || t("profilePage.notSpecified")}
                        </p>
                      </div>
                      <Button
                        type="default"
                        className="ep-btn ep-btn--m ep-btn--filled-gray"
                        onClick={() => setActiveModal("email")}
                      >
                        {t("profilePage.changeEmailAction")}
                      </Button>
                    </div>

                    <div className={styles.accountActionRow}>
                      <div>
                        <h3 className={styles.settingsRowTitle}>{t("profilePage.passwordTitle")}</h3>
                        <p className={styles.settingsRowText}>
                          {t("profilePage.passwordResetDescription")}
                        </p>
                      </div>
                      <Button
                        type="default"
                        className="ep-btn ep-btn--m ep-btn--filled-gray"
                        onClick={() => setActiveModal("password")}
                      >
                        {t("profilePage.changePasswordAction")}
                      </Button>
                    </div>

                    <div className={styles.accountActionRow}>
                      <div>
                        <h3 className={styles.settingsRowTitle}>
                          {t("profilePage.logoutTitle")}
                        </h3>
                        <p className={styles.settingsRowText}>
                          {t("profilePage.logoutDescription")}
                        </p>
                      </div>
                      <Button
                        type="text"
                        icon={<BoxArrowLeftIcon />}
                        className="ep-btn ep-btn--m ep-btn--text"
                        onClick={() => setActiveModal("logout")}
                      >
                        {t("profilePage.logoutAction")}
                      </Button>
                    </div>

                    <div className={styles.accountActionRow}>
                      <div>
                        <h3 className={styles.deleteTitle}>{t("profilePage.deleteAccount")}</h3>
                        <p className={styles.settingsRowText}>
                          {t("profilePage.deleteDescription")}
                        </p>
                      </div>
                      <Button
                        type="text"
                        danger
                        className="ep-btn ep-btn--m ep-btn--text"
                        onClick={() => setActiveModal("delete")}
                      >
                        {t("profilePage.deleteAction")}
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
            onClose={() =>
              setToasts((prev) => prev.filter((item) => item.id !== toast.id))
            }
          />
        ))}
      </div>
    </AppShell>
  );
}
