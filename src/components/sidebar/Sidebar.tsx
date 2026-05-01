import styles from "./Sidebar.module.scss";
import { Avatar, Badge, Divider, Input } from "antd";
import { Button } from "antd";
import clsx from "clsx";
import { buildImageUrl } from "@/utils/buildImageUrl.ts";
import {
  useGetProfileEventsQuery,
  useGetProfileQuery,
} from "@/services/api/profileApi.ts";
import { useCreateEventMutation } from "@/services/api/eventApi.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store.ts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useGetNotificationsQuery } from "@/services/api/notificationApi.ts";
import { useNotificationsSignalR } from "@/hooks/realtime/useNotificationsSignalR.ts";
import { useChatNotificationsSignalR } from "@/hooks/realtime/useChatNotificationsSignalR.ts";
import { clearEventChatUnread } from "@/store/realtimeSlice.ts";
import { APRIL_TEST_EVENTS } from "@/dev/aprilEventsSeed.ts";

import SearchIcon from "@/assets/image/search.svg?react";
import BellIcon from "@/assets/image/bell.svg?react";
import CalendarIcon from "@/assets/image/calendar.svg?react";
import FileLinesIcon from "@/assets/image/file-lines.svg?react";
import FaceSmileIcon from "@/assets/image/face-smile.svg?react";
import ChevronIcon from "@/assets/image/chevron.svg?react";
import PlusIcon from "@/assets/image/plus-lg.svg?react";
import BoxArchiveIcon from "@/assets/image/box-archive.svg?react";
import DropletIcon from "@/assets/image/droplet.svg?react";
import MoonIcon from "@/assets/image/moon.svg?react";
import SunIcon from "@/assets/image/sun.svg?react";
import SearchModal from "@/components/sidebar/search-modal/SearchModal";
import NotificationsDrawer from "@/components/notifications-drawer/NotificationsDrawer.tsx";
import { useTheme } from "@/hooks/ui/useTheme.ts";

export interface SidebarProps {
  notificationCount?: number;
  tasksCount?: number;
}

const RECENT_SEARCHES_STORAGE_KEY = "sidebar_recent_searches";
const RECENT_SEARCHES_LIMIT = 8;

const loadRecentSearches = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, RECENT_SEARCHES_LIMIT);
  } catch {
    return [];
  }
};

export default function Sidebar({
  notificationCount = 3,
  tasksCount = 0,
}: SidebarProps) {
  useNotificationsSignalR();

  const dispatch = useDispatch<AppDispatch>();
  const { data: profile } = useGetProfileQuery();
  const { data: subscribedEvents } = useGetProfileEventsQuery();
  const { data: notifications, isLoading: notificationsLoading } =
    useGetNotificationsQuery(
      { count: 100, offset: 0 },
      { refetchOnFocus: true, refetchOnReconnect: true, pollingInterval: 60000 }
    );
  const chatAlerts = useSelector(
    (state: RootState) => state.realtime.chatAlerts
  );
  const [createEventMutation] = useCreateEventMutation();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearches()
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(recentSearches)
    );
  }, [recentSearches]);

  useEffect(() => {
    if (!isSearchModalOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedSearch = searchRef.current?.contains(target);
      const clickedDropdown = searchDropdownRef.current?.contains(target);

      if (!clickedSearch && !clickedDropdown) {
        setIsSearchModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSearchModalOpen]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const eventsList = useMemo(() => {
    return (subscribedEvents ?? []).map((event) => {
      const date = format(new Date(event.startDate), "d MMMM", { locale: ru });
      return {
        id: event.id,
        title: event.name,
        date,
        avatarUrl: buildImageUrl(event.avatar),
      };
    });
  }, [subscribedEvents]);

  const chatEventMetas = useMemo(
    () => eventsList.map((event) => ({ id: event.id, name: event.title })),
    [eventsList]
  );

  useChatNotificationsSignalR(chatEventMetas);

  const unreadChatEventIds = useMemo(() => {
    const ids = new Set(
      chatAlerts.filter((alert) => !alert.isRead).map((alert) => alert.eventId)
    );

    (notifications ?? []).forEach((notification) => {
      if (
        !notification.isRead &&
        String(notification.type ?? "").toLowerCase() === "chatmessage" &&
        notification.eventId
      ) {
        ids.add(notification.eventId);
      }
    });

    return ids;
  }, [chatAlerts, notifications]);

  const unreadChatCount = useMemo(
    () => chatAlerts.filter((alert) => !alert.isRead).length,
    [chatAlerts]
  );

  const unreadNotificationsCount = useMemo(() => {
    if (notificationsLoading || !notifications) {
      return notificationCount;
    }

    return (
      notifications.filter((notification) => !notification.isRead).length +
      unreadChatCount
    );
  }, [notifications, notificationCount, notificationsLoading, unreadChatCount]);

  const handleCreateAprilEvents = async () => {
    const shouldCreate = window.confirm(
      `Создать ${APRIL_TEST_EVENTS.length} тестовых мероприятий за апрель?`
    );
    if (!shouldCreate) return;

    let createdCount = 0;

    for (const eventPayload of APRIL_TEST_EVENTS) {
      try {
        await createEventMutation(eventPayload).unwrap();
        createdCount += 1;
      } catch (error) {
        console.error(
          "Не удалось создать тестовое мероприятие",
          eventPayload.name,
          error
        );
      }
    }

    window.alert(
      `Создано мероприятий: ${createdCount} из ${APRIL_TEST_EVENTS.length}`
    );
  };

  const trackRecentSearch = (query: string) => {
    const normalized = query.trim();
    if (!normalized) return;

    setRecentSearches((prev) => {
      const deduplicated = prev.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase()
      );
      return [normalized, ...deduplicated].slice(0, RECENT_SEARCHES_LIMIT);
    });
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.userCard} onClick={handleProfileClick}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            className="ep-avatar"
            size={48}
            src={buildImageUrl(profile?.avatarUrl)}
          >
            {(
              profile?.firstName?.[0] ??
              profile?.lastName?.[0] ??
              "—"
            ).toUpperCase()}
          </Avatar>
          <div
            style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
          >
            <span className={styles.userName}>
              {`${profile?.lastName ?? ""} ${
                profile?.firstName ?? ""
              }`.trim() || "—"}
            </span>
          </div>
        </div>
      </div>

      <Divider style={{ margin: 0 }} />

      <div className={styles.search} ref={searchRef}>
        <Input
          placeholder="Поиск..."
          value={searchQuery}
          prefix={<SearchIcon />}
          aria-label="Поиск"
          className="ep-input ep-input--m"
          onChange={(event) => setSearchQuery(event.target.value)}
          onClick={() => setIsSearchModalOpen(true)}
          onFocus={() => setIsSearchModalOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && searchQuery.trim()) {
              trackRecentSearch(searchQuery);
            }
          }}
        />

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          query={searchQuery}
          events={subscribedEvents ?? []}
          recentSearches={recentSearches}
          onRecentSelect={(query) => {
            setSearchQuery(query);
            setIsSearchModalOpen(true);
          }}
          onRecentRemove={(query) => {
            setRecentSearches((prev) => prev.filter((item) => item !== query));
          }}
          onTrackSearch={trackRecentSearch}
          anchorRef={searchRef}
          panelRef={searchDropdownRef}
          onEventClick={(eventId) => {
            setIsSearchModalOpen(false);
            navigate(`/event?id=${eventId}`);
          }}
        />
      </div>

      <Button
        type="text"
        className="ep-nav-item"
        onClick={() => setIsNotificationsOpen(true)}
      >
        <span className="ep-nav-item__left">
          <span className="ep-nav-item__icon">
            <BellIcon />
          </span>
          <span className="ep-nav-item__label">Уведомления</span>
        </span>
        <span className="ep-nav-item__icon" aria-hidden="true">
          {unreadNotificationsCount > 0 ? (
            <Badge
              count={unreadNotificationsCount}
              className="ep-badge--text"
            />
          ) : null}
        </span>
      </Button>

      <NotificationsDrawer
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <Divider style={{ margin: 0 }} />

      <div className={styles.navGroup}>
        <Button
          type="text"
          className="ep-nav-item"
          onClick={() => navigate("/main")}
        >
          <span className="ep-nav-item__left">
            <span className="ep-nav-item__icon">
              <CalendarIcon />
            </span>
            <span className="ep-nav-item__label">Календарь</span>
          </span>
          <span className="ep-nav-item__icon" aria-hidden="true" />
        </Button>

        <Button
          type="text"
          className="ep-nav-item"
          onClick={() => navigate("/tasks")}
        >
          <span className="ep-nav-item__left">
            <span className="ep-nav-item__icon">
              <FileLinesIcon />
            </span>
            <span className="ep-nav-item__label">Мои задачи</span>
          </span>
          <span className="ep-nav-item__icon" aria-hidden="true">
            <span className="ep-badge--plain">{tasksCount}</span>
          </span>
        </Button>

        <div className={styles.eventsSection}>
          <Button
            type="text"
            className="ep-nav-item"
            onClick={() => setEventsExpanded((v) => !v)}
          >
            <span className="ep-nav-item__left">
              <span className="ep-nav-item__icon">
                <FaceSmileIcon />
              </span>
              <span className="ep-nav-item__label">Мои мероприятия</span>
            </span>
            <span className="ep-nav-item__icon" aria-hidden="true">
              <ChevronIcon
                className={clsx(
                  styles.chevron,
                  eventsExpanded && styles.chevronExpanded
                )}
              />
            </span>
          </Button>

          {eventsExpanded && (
            <div className={styles.eventsList}>
              {eventsList.map((event) => (
                <Button
                  key={event.id}
                  type="text"
                  className={styles.eventPlate}
                  onClick={() => {
                    dispatch(clearEventChatUnread(event.id));
                    navigate(`/event?id=${event.id}`);
                  }}
                >
                  <Avatar
                    className={`ep-avatar ${styles.eventPlateAvatar}`}
                    shape="square"
                    size={36}
                    src={event.avatarUrl}
                  >
                    {(event.title?.[0] ?? "—").toUpperCase()}
                  </Avatar>
                  <span className={styles.eventPlateText}>
                    <span className={styles.eventPlateTitle}>
                      {event.title}
                    </span>
                    <span className={styles.eventPlateDate}>{event.date}</span>
                  </span>
                  {unreadChatEventIds.has(event.id) ? (
                    <span
                      className={styles.eventPlateUnreadDot}
                      aria-hidden="true"
                    />
                  ) : null}
                </Button>
              ))}

              <Button
                type="text"
                className={`${styles.createEventButton} ep-btn ep-btn--m ep-btn--text`}
                icon={<PlusIcon />}
                onClick={() => navigate("/editor")}
                style={{ justifyContent: "flex-start" }}
              >
                Создать новое
              </Button>

              {import.meta.env.DEV && (
                <Button
                  type="text"
                  className={`${styles.seedEventsButton} ep-btn ep-btn--m ep-btn--text`}
                  onClick={handleCreateAprilEvents}
                  style={{ justifyContent: "flex-start" }}
                >
                  Создать 3 апрельских тестовых
                </Button>
              )}
            </div>
          )}
        </div>

        <Button
          type="text"
          className="ep-nav-item"
          onClick={() => navigate("/archive")}
        >
          <span className="ep-nav-item__left">
            <span className="ep-nav-item__icon">
              <BoxArchiveIcon />
            </span>
            <span className="ep-nav-item__label">Архив</span>
          </span>
          <span className="ep-nav-item__icon" aria-hidden="true" />
        </Button>
      </div>

      <Divider style={{ margin: 0 }} />

      <div className={styles.themeSection}>
        <button
          type="button"
          className={styles.themeButton}
          onClick={toggleTheme}
        >
          <span className={styles.themeLeft}>
            <span className={styles.themeDropIcon} aria-hidden="true">
              <DropletIcon />
            </span>
            <span>Тема</span>
          </span>
          <span className={styles.themeActionIcon} aria-hidden="true">
            {isDark ? <MoonIcon /> : <SunIcon />}
          </span>
        </button>
      </div>
    </div>
  );
}
