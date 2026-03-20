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
import {useGetProfileQuery} from "@/services/api/profileApi.ts";
import EventChat from '@/components/event-page/chat/EventChat.tsx';
import ArchivedEventOverview from '@/components/event-page/archived-overview/ArchivedEventOverview.tsx';

const TAB_INDEX_OVERVIEW = 0;
const TAB_INDEX_DOCUMENTS = 1;
const TAB_INDEX_CHAT = 2;
const TAB_INDEX_MEDIA = 3;

const TAB_INDEX_ARCHIVED_OVERVIEW = 0;
const TAB_INDEX_ARCHIVED_DOCUMENTS = 1;
const TAB_INDEX_ARCHIVED_MEDIA = 2;

export default function EventPage() {
    const {event, isLoading, error} = useEventPage();
    const {data: profile} = useGetProfileQuery();
    const [activeTab, setActiveTab] = useState(TAB_INDEX_OVERVIEW);

    const isAdmin = profile && event?.responsiblePersonId 
        ? profile.id === event.responsiblePersonId 
        : false;

    const normalizedStatus = (event?.status ?? '').toLowerCase();
    const isStatusArchived =
        normalizedStatus.includes('finish')
        || normalizedStatus.includes('complete')
        || normalizedStatus.includes('done')
        || normalizedStatus.includes('closed')
        || normalizedStatus.includes('cancel')
        || normalizedStatus.includes('archive');
    const archiveByDate = Boolean(event?.endDate && new Date(event.endDate).getTime() < Date.now());
    const isArchivedEvent = isStatusArchived || archiveByDate;

    const archiveStatusLabel = normalizedStatus.includes('cancel') ? 'Отменено' : 'Окончено';

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (error || !event) {
        return <div>Событие не найдено</div>;
    }

    const renderContent = () => {
        if (isArchivedEvent) {
            switch (activeTab) {
                case TAB_INDEX_ARCHIVED_OVERVIEW:
                    return (
                        <div className={styles.archivedWrapper}>
                            <ArchivedEventOverview
                                eventId={event.id}
                                title={event.name}
                                avatar={event.avatar}
                                categories={event.categories}
                                formattedDate={event.formattedDate}
                                location={event.location}
                                description={event.description}
                            />
                        </div>
                    );
                case TAB_INDEX_ARCHIVED_DOCUMENTS:
                    return (
                        <div className={styles.archivedPlaceholder}>
                            Документы для архивного мероприятия в разработке
                        </div>
                    );
                case TAB_INDEX_ARCHIVED_MEDIA:
                    return (
                        <div className={styles.tabContent}>
                            <PhotosGallery eventId={event.id}/>
                        </div>
                    );
                default:
                    return null;
            }
        }

        switch (activeTab) {
            case TAB_INDEX_OVERVIEW:
                return (
                    <div className={styles.mainContent}>
                        <div className={styles.eventContent}>
                            <EventInfo
                                date={event.formattedDate}
                                location={event.location}
                                description={event.description}
                                categories={event.categories}
                                color={event.color}
                            />
                            <Post eventId={event.id} isAdmin={isAdmin}/>
                        </div>
                        <div className={styles.sideContent}>
                            <Participants eventId={event.id} isAdmin={isAdmin}/>
                            <Contacts eventId={event.id}/>
                        </div>
                    </div>
                );
            case TAB_INDEX_DOCUMENTS:
                return (
                    <div className={styles.archivedPlaceholder}>
                        Документы мероприятия в разработке
                    </div>
                );
            case TAB_INDEX_CHAT:
                return (
                    <div className={styles.tabContent}>
                        <EventChat eventId={event.id}/>
                    </div>
                );
            case TAB_INDEX_MEDIA:
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
                     />
                 </div>
            <div className={styles.content}>
                <div className={styles.headerWrapper}>
                    <Header
                        isAdmin={isAdmin}
                        name={event.name}
                        eventId={event.id}
                        avatar={event.avatar}
                        isArchived={isArchivedEvent}
                        archiveStatusLabel={archiveStatusLabel}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
                {renderContent()}
            </div>
        </div>
    );
}
