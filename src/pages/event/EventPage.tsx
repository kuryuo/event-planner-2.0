import {useState} from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import type {CardBaseProps} from "@/ui/card/CardBase.tsx";
import styles from "./EventPage.module.scss";
import Header from "@/components/event-page/header/Header.tsx";
import EventInfo from "@/components/event-page/event-info/EventInfo.tsx";
import Post from "@/components/event-page/post/Post.tsx";
import Participants from "@/components/event-page/participants/Participants.tsx";
import Contacts from "@/components/event-page/contacts/Contacts.tsx";
import {useEventPage} from '@/hooks/api/useEventPage.ts';

const subscriptionsData: CardBaseProps[] = [
    {title: "Подписка 1", subtitle: "Описание подписки 1", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"},
    {
        title: "Подписка 2",
        subtitle: "Описание подписки 2",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {title: "Подписка 3", subtitle: "Описание подписки 3", avatarUrl: "https://randomuser.me/api/portraits/men/56.jpg"},
    {title: "Подписка 3", subtitle: "Описание подписки 3", avatarUrl: "https://randomuser.me/api/portraits/men/56.jpg"},
];


export default function EventPage() {
    const {event, isLoading, error} = useEventPage();
    const [subscriptions] = useState<CardBaseProps[]>(subscriptionsData);
    const [isAdmin] = useState(true);

    const handleCreateEvent = () => console.log("Создать мероприятие");

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (error || !event) {
        return <div>Событие не найдено</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
                    subscriptions={subscriptions}
                    onCreateEvent={handleCreateEvent}
                    notificationCount={5}
                    isAdmin={isAdmin}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.headerWrapper}>
                    <Header isAdmin={isAdmin} name={event.name}/>
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.eventContent}>
                        <EventInfo
                            date={event.formattedDate}
                            location={event.location}
                            description={event.description}
                            categories={event.categories}
                        />
                        <Post isAdmin={isAdmin}/>
                    </div>
                    <div className={styles.sideContent}>
                        <Participants isAdmin={isAdmin}/>
                        <Contacts/>
                    </div>
                </div>
            </div>
        </div>
    );
}
