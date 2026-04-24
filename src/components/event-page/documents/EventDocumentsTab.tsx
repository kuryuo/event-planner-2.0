import {EventDocumentSection} from '@/components/event-page/documents/event-document-section.tsx';
import styles from './EventDocumentsTab.module.scss';

interface EventDocumentsTabProps {
    eventId: string;
}

const EventDocumentsTab = ({eventId: _eventId}: EventDocumentsTabProps) => {
    return (
        <div className={styles.root}>
            <EventDocumentSection
                title="Документы"
                description="Файлы и ссылки на документы, презентации, таблицы и другие материалы мероприятия"
                emptyMessage="Пока нет документов"
            />
            <hr className={styles.divider} aria-hidden/>
            <EventDocumentSection
                title="Заметки"
                description="Идеи, мысли и короткие заметки по мероприятию"
                emptyMessage="Пока нет заметок"
            />
        </div>
    );
};

export default EventDocumentsTab;
