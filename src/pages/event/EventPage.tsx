import {useState} from "react";
import clsx from 'clsx';
import Sidebar from "@/components/sidebar/Sidebar";
import styles from "./EventPage.module.scss";
import Header from "@/components/event-page/header/Header.tsx";
import EventInfo from "@/components/event-page/event-info/EventInfo.tsx";
import Participants from "@/components/event-page/participants/Participants.tsx";
import PhotosGallery from "@/components/event-page/photos/PhotosGallery.tsx";
import {useEventPage} from '@/hooks/api/useEventPage.ts';
import {useGetProfileQuery} from "@/services/api/profileApi.ts";
import EventChat from '@/components/event-page/chat/EventChat.tsx';
import ArchivedEventOverview from '@/components/event-page/archived-overview/ArchivedEventOverview.tsx';
import EventTasksOverview from '@/components/event-page/tasks-overview/EventTasksOverview.tsx';
import {useGetEventSubscribersQuery} from '@/services/api/eventApi.ts';
import EventDocumentsTab from '@/components/event-page/documents/EventDocumentsTab.tsx';
import EventKanbanTab from '@/components/event-page/kanban/EventKanbanTab.tsx';

const TAB_INDEX_OVERVIEW = 0;
const TAB_INDEX_DOCUMENTS = 1;
const TAB_INDEX_KANBAN = 2;
const TAB_INDEX_CHAT = 3;
const TAB_INDEX_MEDIA = 4;

const TAB_INDEX_ARCHIVED_OVERVIEW = 0;
const TAB_INDEX_ARCHIVED_DOCUMENTS = 1;
const TAB_INDEX_ARCHIVED_MEDIA = 2;

export default function EventPage() {
    const {event, isLoading, error} = useEventPage();
    const {data: profile} = useGetProfileQuery();
    const {data: subscribersData} = useGetEventSubscribersQuery(
        {eventId: event?.id ?? '', count: 1, offset: 0},
        {skip: !event?.id}
    );
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

    const visitorsCount = subscribersData?.res?.totalCount;

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
                        <div className={styles.tabContent}>
                            <EventDocumentsTab eventId={event.id}/>
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
                                visitorsCount={visitorsCount}
                            />
                            <Participants eventId={event.id} isAdmin={isAdmin}/>
                        </div>
                        <div className={styles.sideContent}>
                            <EventTasksOverview eventId={event.id}/>
                        </div>
                    </div>
                );
            case TAB_INDEX_DOCUMENTS:
                return (
                    <div className={styles.tabContent}>
                        <EventDocumentsTab eventId={event.id}/>
                    </div>
                );
            case TAB_INDEX_CHAT:
                return (
                    <div className={clsx(styles.tabContent, styles.chatTabContent)}>
                        <EventChat eventId={event.id}/>
                    </div>
                );
            case TAB_INDEX_KANBAN:
                return (
                    <div className={clsx(styles.tabContent, styles.kanbanTabContent)}>
                        <EventKanbanTab eventId={event.id}/>
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
            <div
                className={clsx(
                    styles.content,
                    activeTab === TAB_INDEX_CHAT && styles.contentChatMode,
                    activeTab === TAB_INDEX_KANBAN && styles.contentKanbanMode,
                )}
            >
                <div className={styles.headerWrapper}>
                    <Header
                        isAdmin={isAdmin}
                        name={event.name}
                        eventId={event.id}
                        avatar={event.avatar}
                        isArchived={isArchivedEvent}
                        status={event.status}
                        updateData={{
                            name: event.name,
                            description: event.description,
                            startDate: event.startDate,
                            endDate: event.endDate,
                            location: event.location,
                            venueFormat: event.venueFormat,
                            maxParticipants: event.maxParticipants,
                            color: event.color,
                        }}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        showTabs={false}
                        showMain={false}
                    />
                </div>

                <section className={styles.contentPanel}>
                    <Header
                        isAdmin={isAdmin}
                        name={event.name}
                        eventId={event.id}
                        avatar={event.avatar}
                        isArchived={isArchivedEvent}
                        status={event.status}
                        updateData={{
                            name: event.name,
                            description: event.description,
                            startDate: event.startDate,
                            endDate: event.endDate,
                            location: event.location,
                            venueFormat: event.venueFormat,
                            maxParticipants: event.maxParticipants,
                            color: event.color,
                        }}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        showSummary={false}
                    />
                    {renderContent()}
                </section>
            </div>
        </div>
    );
}
