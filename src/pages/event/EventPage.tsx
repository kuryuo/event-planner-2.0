import Sidebar from "@/components/sidebar/Sidebar";
import styles from "./EventPage.module.scss";
import Header from "@/components/event-page/header/Header.tsx";
import EventInfo from "@/components/event-page/event-info/EventInfo.tsx";
import Post from "@/components/event-page/post/Post.tsx";
import Participants from "@/components/event-page/participants/Participants.tsx";
import Contacts from "@/components/event-page/contacts/Contacts.tsx";
import {useEventPage} from '@/hooks/api/useEventPage.ts';


export default function EventPage() {
    const {event, isLoading, error} = useEventPage();
    const isAdmin = true;

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
                    notificationCount={5}
                    isAdmin={isAdmin}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.headerWrapper}>
                    <Header isAdmin={isAdmin} name={event.name} eventId={event.id}/>
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.eventContent}>
                        <EventInfo
                            date={event.formattedDate}
                            location={event.location}
                            description={event.description}
                            categories={event.categories}
                        />
                        <Post eventId={event.id} isAdmin={isAdmin}/>
                    </div>
                    <div className={styles.sideContent}>
                        <Participants eventId={event.id} isAdmin={isAdmin}/>
                        <Contacts eventId={event.id}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
