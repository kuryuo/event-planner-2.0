import styles from './Sidebar.module.scss';
import {Card} from '@/ui/card/Card.tsx';
import Divider from '@/ui/divider/Divider.tsx';
import TextField from '@/ui/text-field/TextField.tsx';
import NavItem from '@/ui/nav-item/NavItem.tsx';
import Badge from '@/ui/badge/Badge.tsx';
import EventPlate from '@/ui/event-plate/EventPlate.tsx';
import Button from '@/ui/button/Button.tsx';
import clsx from 'clsx';
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import {useGetProfileEventsQuery, useGetProfileQuery} from "@/services/api/profileApi.ts";
import {useCreateEventMutation} from '@/services/api/eventApi.ts';
import {useNavigate} from "react-router-dom";
import {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '@/store/store.ts';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useGetNotificationsQuery} from '@/services/api/notificationApi.ts';
import {useNotificationsSignalR} from '@/hooks/realtime/useNotificationsSignalR.ts';
import {useChatNotificationsSignalR} from '@/hooks/realtime/useChatNotificationsSignalR.ts';
import {clearEventChatUnread} from '@/store/realtimeSlice.ts';
import {APRIL_TEST_EVENTS} from '@/dev/aprilEventsSeed.ts';

import SearchIcon from '@/assets/image/search.svg?react';
import BellIcon from '@/assets/image/bell.svg?react';
import CalendarIcon from '@/assets/image/calendar.svg?react';
import FileLinesIcon from '@/assets/image/file-lines.svg?react';
import FaceSmileIcon from '@/assets/image/face-smile.svg?react';
import ChevronIcon from '@/assets/image/chevron.svg?react';
import PlusIcon from '@/assets/image/plus-lg.svg?react';
import BoxArchiveIcon from '@/assets/image/box-archive.svg?react';
import DropletIcon from '@/assets/image/droplet.svg?react';
import MoonIcon from '@/assets/image/moon.svg?react';
import SunIcon from '@/assets/image/sun.svg?react';
import SearchModal from '@/components/sidebar/search-modal/SearchModal';
import NotificationsDrawer from '@/components/notifications-drawer/NotificationsDrawer.tsx';
import {useTheme} from '@/hooks/ui/useTheme.ts';

interface SidebarProps {
    notificationCount?: number;
    tasksCount?: number;
}

const RECENT_SEARCHES_STORAGE_KEY = 'sidebar_recent_searches';
const RECENT_SEARCHES_LIMIT = 8;

const loadRecentSearches = (): string[] => {
    try {
        const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, RECENT_SEARCHES_LIMIT);
    } catch {
        return [];
    }
};

export default function Sidebar({notificationCount = 3, tasksCount = 0}: SidebarProps) {
    useNotificationsSignalR();

    const dispatch = useDispatch<AppDispatch>();
    const {data: profile} = useGetProfileQuery();
    const {data: subscribedEvents} = useGetProfileEventsQuery();
    const {data: notifications, isLoading: notificationsLoading} = useGetNotificationsQuery(
        {count: 100, offset: 0},
        {refetchOnFocus: true, refetchOnReconnect: true, pollingInterval: 60000}
    );
    const chatAlerts = useSelector((state: RootState) => state.realtime.chatAlerts);
    const [createEventMutation] = useCreateEventMutation();
    const {isDark, toggleTheme} = useTheme();
    const navigate = useNavigate();
    const [eventsExpanded, setEventsExpanded] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
    const searchRef = useRef<HTMLDivElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
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

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isSearchModalOpen]);

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const eventsList = useMemo(() => {
        return (subscribedEvents ?? []).map((event) => {
            const date = format(new Date(event.startDate), 'd MMMM', {locale: ru});
            return {
                id: event.id,
                title: event.name,
                date,
                avatarUrl: buildImageUrl(event.avatar),
            };
        });
    }, [subscribedEvents]);

    const chatEventMetas = useMemo(
        () => eventsList.map((event) => ({id: event.id, name: event.title})),
        [eventsList]
    );

    useChatNotificationsSignalR(chatEventMetas);

    const unreadChatEventIds = useMemo(() => {
        const ids = new Set(chatAlerts.filter((alert) => !alert.isRead).map((alert) => alert.eventId));

        (notifications ?? []).forEach((notification) => {
            if (!notification.isRead && String(notification.type ?? '').toLowerCase() === 'chatmessage' && notification.eventId) {
                ids.add(notification.eventId);
            }
        });

        return ids;
    }, [chatAlerts, notifications]);

    const unreadChatCount = useMemo(() => chatAlerts.filter((alert) => !alert.isRead).length, [chatAlerts]);

    const unreadNotificationsCount = useMemo(() => {
        if (notificationsLoading || !notifications) {
            return notificationCount;
        }

        return notifications.filter(notification => !notification.isRead).length + unreadChatCount;
    }, [notifications, notificationCount, notificationsLoading, unreadChatCount]);

    const handleCreateAprilEvents = async () => {
        const shouldCreate = window.confirm(`Создать ${APRIL_TEST_EVENTS.length} тестовых мероприятий за апрель?`);
        if (!shouldCreate) return;

        let createdCount = 0;

        for (const eventPayload of APRIL_TEST_EVENTS) {
            try {
                await createEventMutation(eventPayload).unwrap();
                createdCount += 1;
            } catch (error) {
                console.error('Не удалось создать тестовое мероприятие', eventPayload.name, error);
            }
        }

        window.alert(`Создано мероприятий: ${createdCount} из ${APRIL_TEST_EVENTS.length}`);
    };

    const trackRecentSearch = (query: string) => {
        const normalized = query.trim();
        if (!normalized) return;

        setRecentSearches((prev) => {
            const deduplicated = prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
            return [normalized, ...deduplicated].slice(0, RECENT_SEARCHES_LIMIT);
        });
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.userCard} onClick={handleProfileClick}>
                <Card
                    title={`${profile?.lastName ?? ''} ${profile?.firstName ?? ''}`.trim() || '—'}
                    avatarUrl={buildImageUrl(profile?.avatarUrl)}
                />
            </div>

            <Divider />

            <div className={styles.search} ref={searchRef}>
                <TextField
                    placeholder="Поиск..."
                    value={searchQuery}
                    leftIcon={<SearchIcon />}
                    aria-label="Поиск"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onClick={() => setIsSearchModalOpen(true)}
                    onFocus={() => setIsSearchModalOpen(true)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && searchQuery.trim()) {
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

            <NavItem
                label="Уведомления"
                leftIcon={<BellIcon />}
                rightIcon={
                    unreadNotificationsCount > 0 ? (
                        <Badge count={unreadNotificationsCount} variant="text" color="brand-green" />
                    ) : null
                }
                onClick={() => setIsNotificationsOpen(true)}
            />

            <NotificationsDrawer
                open={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />

            <Divider />

            <div className={styles.navGroup}>
                <NavItem
                    label="Календарь"
                    leftIcon={<CalendarIcon />}
                    onClick={() => navigate('/main')}
                />

                <NavItem
                    label="Мои задачи"
                    leftIcon={<FileLinesIcon />}
                    rightIcon={<Badge variant="plain" count={tasksCount} />}
                    onClick={() => navigate('/tasks')}
                />

                <div className={styles.eventsSection}>
                    <NavItem
                        label="Мои мероприятия"
                        leftIcon={<FaceSmileIcon />}
                        rightIcon={
                            <ChevronIcon
                                className={clsx(
                                    styles.chevron,
                                    eventsExpanded && styles.chevronExpanded
                                )}
                            />
                        }
                        onClick={() => setEventsExpanded((v) => !v)}
                    />

                    {eventsExpanded && (
                        <div className={styles.eventsList}>
                            {eventsList.map((event) => (
                                <EventPlate
                                    key={event.id}
                                    title={event.title}
                                    date={event.date}
                                    avatarUrl={event.avatarUrl}
                                    showUnreadDot={unreadChatEventIds.has(event.id)}
                                    onClick={() => {
                                        dispatch(clearEventChatUnread(event.id));
                                        navigate(`/event?id=${event.id}`);
                                    }}
                                />
                            ))}

                              <Button
                                  className={styles.createEventButton}
                                  variant="Text"
                                  color="default"
                                  leftIcon={<PlusIcon />}
                                  onClick={() => navigate('/editor')}
                                  style={{justifyContent: 'flex-start'}}
                              >
                                  Создать новое
                              </Button>

                            {import.meta.env.DEV && (
                                <Button
                                    className={styles.seedEventsButton}
                                    variant="Text"
                                    color="default"
                                    onClick={handleCreateAprilEvents}
                                    style={{justifyContent: 'flex-start'}}
                                >
                                    Создать 3 апрельских тестовых
                                </Button>
                            )}

                           </div>
                       )}
                   </div>

                <NavItem
                    label="Архив"
                    leftIcon={<BoxArchiveIcon />}
                    onClick={() => navigate('/archive')}
                />
            </div>

            <Divider />

            <div className={styles.themeSection}>
                <button type="button" className={styles.themeButton} onClick={toggleTheme}>
                    <span className={styles.themeLeft}>
                        <span className={styles.themeDropIcon} aria-hidden="true"><DropletIcon/></span>
                        <span>Тема</span>
                    </span>
                    <span className={styles.themeActionIcon} aria-hidden="true">
                        {isDark ? <MoonIcon/> : <SunIcon/>}
                    </span>
                </button>
            </div>

        </div>
    );
}
