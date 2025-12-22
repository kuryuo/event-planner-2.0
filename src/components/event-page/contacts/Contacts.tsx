import styles from "./Contacts.module.scss";
import {Card} from "@/ui/card/Card";
import {useGetEventContactsQuery} from "@/services/api/eventApi.ts";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";

interface ContactsProps {
    eventId: string;
}

export default function Contacts({eventId}: ContactsProps) {
    const {data, isLoading, error} = useGetEventContactsQuery(eventId, {
        skip: !eventId,
    });

    const contacts = data?.result?.map((contact, index) => ({
        id: `${contact.name}-${index}`,
        title: contact.name,
        subtitle: contact.role,
        avatarUrl: buildImageUrl(contact.avatarUrl) || "",
        size: "M" as const,
    })) || [];

    if (isLoading) {
        return (
            <div className={styles.contacts}>
                <h2 className={styles.title}>Контакты</h2>
                <div>Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.contacts}>
                <h2 className={styles.title}>Контакты</h2>
                <div>Ошибка загрузки контактов</div>
            </div>
        );
    }

    if (!contacts || contacts.length === 0) {
        return (
            <div className={styles.contacts}>
                <h2 className={styles.title}>Контакты</h2>
                <div>Контакты не найдены</div>
            </div>
        );
    }

    return (
        <div className={styles.contacts}>
            <h2 className={styles.title}>Контакты</h2>
            <div className={styles.contactsList}>
                {contacts.map((contact) => (
                    <Card
                        key={contact.id}
                        title={contact.title}
                        subtitle={contact.subtitle}
                        avatarUrl={contact.avatarUrl}
                        size={contact.size}
                    />
                ))}
            </div>
        </div>
    );
}