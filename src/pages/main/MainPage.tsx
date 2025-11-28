import {useState} from "react";
import Calendar from "@/components/calendar/Calendar";
import Sidebar from "@/components/sidebar/Sidebar";
import Filters from "@/components/filters/Filters";
import styles from "./MainPage.module.scss";
import type {CardBaseProps} from "@/ui/card/CardBase";
import {useEvents} from "@/hooks/api/useEvents.ts";
import {useProfile} from "@/hooks/api/useProfile.ts";

const subscriptionsData: CardBaseProps[] = [
    {title: 'Подписка 1', subtitle: 'Описание подписки 1', avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'},
    {
        title: 'Подписка 2',
        subtitle: 'Описание подписки 2',
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {title: 'Подписка 3', subtitle: 'Описание подписки 3', avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg'},
    {title: 'Подписка 3', subtitle: 'Описание подписки 3', avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg'},
];

export default function MainPage() {
    const [subscriptions] = useState<CardBaseProps[]>(subscriptionsData);
    const [showFilters, setShowFilters] = useState(false);
    const [isAdmin] = useState(true);

    useProfile();
    useEvents();

    const handleCreateEvent = () => console.log("Создать мероприятие");

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
                    isAdmin={isAdmin}
                    subscriptions={subscriptions}
                    onCreateEvent={handleCreateEvent}
                    notificationCount={5}
                />
            </div>

            <div className={styles.calendar}>
                <Calendar
                    onFilterClick={() => setShowFilters(prev => !prev)}
                />

                {showFilters && <div className={styles.overlay}/>}
            </div>

            {showFilters && (
                <div className={styles.filters}>
                    <Filters onClose={() => setShowFilters(false)}/>
                </div>
            )}
        </div>
    );
}
