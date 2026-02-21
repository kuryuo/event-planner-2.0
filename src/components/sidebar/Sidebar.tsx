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
import {useNavigate} from "react-router-dom";
import {useEffect, useMemo, useRef, useState} from 'react';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';

import SearchIcon from '@/assets/image/search.svg?react';
import BellIcon from '@/assets/image/bell.svg?react';
import CalendarIcon from '@/assets/image/calendar.svg?react';
import FileLinesIcon from '@/assets/image/file-lines.svg?react';
import FaceSmileIcon from '@/assets/image/face-smile.svg?react';
import ChevronIcon from '@/assets/image/chevron.svg?react';
import PlusIcon from '@/assets/image/plus-lg.svg?react';
import BoxArchiveIcon from '@/assets/image/box-archive.svg?react';
import SearchModal from '@/components/sidebar/search-modal/SearchModal';

interface SidebarProps {
    notificationCount?: number;
    tasksCount?: number;
}

export default function Sidebar({notificationCount = 3, tasksCount = 0}: SidebarProps) {
    const {data: profile} = useGetProfileQuery();
    const {data: subscribedEvents} = useGetProfileEventsQuery();
    const navigate = useNavigate();
    const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=12';
    const [eventsExpanded, setEventsExpanded] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);

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
                avatarUrl: buildImageUrl(event.avatar) ?? fallbackAvatar,
            };
        });
    }, [subscribedEvents]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.userCard} onClick={handleProfileClick}>
                <Card
                    title={`${profile?.lastName ?? ''} ${profile?.firstName ?? ''}`.trim() || '—'}
                    avatarUrl={profile?.avatarUrl ? buildImageUrl(profile.avatarUrl)! : fallbackAvatar}
                />
            </div>

            <Divider />

            <div className={styles.search} ref={searchRef}>
                <TextField
                    placeholder="Поиск..."
                    leftIcon={<SearchIcon />}
                    aria-label="Поиск"
                    onClick={() => setIsSearchModalOpen(true)}
                    onFocus={() => setIsSearchModalOpen(true)}
                />

                <SearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    events={subscribedEvents ?? []}
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
                    notificationCount > 0 ? (
                        <Badge count={notificationCount} variant="text" color="brand-green" />
                    ) : null
                }
                onClick={() => console.log('Открыть уведомления')}
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
                                    onClick={() => navigate(`/event?id=${event.id}`)}
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
                        </div>
                    )}
                </div>

                <NavItem
                    label="Архив"
                    leftIcon={<BoxArchiveIcon />}
                    onClick={() => navigate('/archive')}
                />
            </div>

        </div>
    );
}
