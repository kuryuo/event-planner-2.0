import {useState} from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import type {CardBaseProps} from "@/ui/card/CardBase.tsx";
import styles from "./EventPage.module.scss";
import Header from "@/components/event-page/header/Header.tsx";

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
    const [subscriptions] = useState<CardBaseProps[]>(subscriptionsData);

    const handleCreateEvent = () => console.log("Создать мероприятие");

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
                    subscriptions={subscriptions}
                    onCreateEvent={handleCreateEvent}
                    notificationCount={5}
                />
            </div>
            <div className={styles.content}>
                <Header/>
            </div>
        </div>
    );
}