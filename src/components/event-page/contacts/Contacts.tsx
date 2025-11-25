import styles from "./Contacts.module.scss";
import {CardBase, type CardBaseProps} from "@/ui/card/CardBase";

interface Contact extends CardBaseProps {
    id: string;
}

interface ContactsProps {
    contacts?: Contact[];
}

const mockContacts: Contact[] = [
    {
        id: "1",
        title: "Алексей Смирнов",
        subtitle: "Главный организатор",
        avatarUrl: "https://randomuser.me/api/portraits/men/15.jpg",
        size: "M",
    },
    {
        id: "2",
        title: "Мария Волкова",
        subtitle: "PR-менеджер",
        avatarUrl: "https://randomuser.me/api/portraits/women/21.jpg",
        size: "M",
    },
    {
        id: "3",
        title: "Дмитрий Орлов",
        subtitle: "Технический директор",
        avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg",
        size: "M",
    },
];

export default function Contacts({contacts = mockContacts}: ContactsProps) {
    return (
        <div className={styles.contacts}>
            <h2 className={styles.title}>Контакты</h2>
            <div className={styles.contactsList}>
                {contacts.map((contact) => (
                    <CardBase
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