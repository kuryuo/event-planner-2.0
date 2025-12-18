import {useState} from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import styles from "./EventPage.module.scss";
import Header from "@/components/event-page/header/Header.tsx";
import EventInfo from "@/components/event-page/event-info/EventInfo.tsx";
import Post from "@/components/event-page/post/Post.tsx";
import Participants from "@/components/event-page/participants/Participants.tsx";
import Contacts from "@/components/event-page/contacts/Contacts.tsx";
import PhotosGallery from "@/components/event-page/photos/PhotosGallery.tsx";
import {useEventPage} from '@/hooks/api/useEventPage.ts';

const TAB_INDEX_ABOUT = 0;
const TAB_INDEX_CHAT = 1;
const TAB_INDEX_PHOTOS = 2;

export default function EventPage() {
    const {event, isLoading, error} = useEventPage();
    const isAdmin = true;
    const [activeTab, setActiveTab] = useState(TAB_INDEX_ABOUT);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (error || !event) {
        return <div>Событие не найдено</div>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case TAB_INDEX_ABOUT:
                return (
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
                );
            case TAB_INDEX_CHAT:
                return (
                    <div className={styles.tabContent}>
                        <p>Чат пока не реализован</p>
                    </div>
                );
            case TAB_INDEX_PHOTOS:
                return (
                    <div className={styles.tabContent}>
                        <PhotosGallery eventId={event.id}/>
                    </div>
                );
            default:
                return null;
        }
    };

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
                    <Header
                        isAdmin={isAdmin}
                        name={event.name}
                        eventId={event.id}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
                {renderContent()}
            </div>
        </div>
    );
}
