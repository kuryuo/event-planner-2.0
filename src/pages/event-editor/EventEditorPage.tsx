import Sidebar from "@/components/sidebar/Sidebar";
import EventForm from "@/components/event-form/EventForm";
import styles from "./EventEditorPage.module.scss";
import type {CardProps} from "@/ui/card/Card.tsx";
import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useEventEditor} from "@/hooks/ui/useEventEditor.ts";
import {useGetEventByIdQuery} from "@/services/api/eventApi.ts";

const subscriptionsData: CardProps[] = [
    {title: 'Подписка 1', subtitle: 'Описание подписки 1', avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'},
    {
        title: 'Подписка 2',
        subtitle: 'Описание подписки 2',
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {title: 'Подписка 3', subtitle: 'Описание подписки 3', avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg'},
    {title: 'Подписка 3', subtitle: 'Описание подписки 3', avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg'},
];

export default function EventEditorPage() {
    const [subscriptions] = useState<CardProps[]>(subscriptionsData);
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('id');
    
    const {data: eventData, isLoading: isLoadingEvent} = useGetEventByIdQuery(
        eventId ?? '',
        {skip: !eventId}
    );
    
    const {handleSubmit, isLoading, error} = useEventEditor(eventId ?? undefined);

    if (isLoadingEvent) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
                    subscriptions={subscriptions}
                    notificationCount={5}
                />
            </div>
            <div className={styles.form}>
                <EventForm
                    eventData={eventData?.result}
                    onSubmit={handleSubmit}
                    loading={isLoading}
                    error={error as string | null | undefined}
                    isEditMode={!!eventId}
                />
            </div>
        </div>
    );
}
