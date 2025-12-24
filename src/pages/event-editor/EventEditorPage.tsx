import Sidebar from "@/components/sidebar/Sidebar";
import EventForm from "@/components/event-form/EventForm";
import styles from "./EventEditorPage.module.scss";
import {useSearchParams} from "react-router-dom";
import {useEventEditor} from "@/hooks/ui/useEventEditor.ts";
import {useGetEventByIdQuery} from "@/services/api/eventApi.ts";

export default function EventEditorPage() {
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
