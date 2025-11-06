import { CardExtra } from '@/ui/card/CardExtra';
import { Sublist } from '@/components/sub-list/SubList';
import { NotificationBadge } from '@/ui/notification-badge/NotificationBadge';
import CircleButton from '@/ui/button-circle/ButtonCircle';
import bell from '@/assets/img/icon-l/bell.svg';
import styles from './Sidebar.module.scss';
import type { CardBaseProps } from '@/ui/card/CardBase';
import NextEvent from "@/components/next-event/NextEvent.tsx";

interface SidebarProps {
    subscriptions: CardBaseProps[];
    onCreateEvent?: () => void;
    notificationCount?: number;
}

export function Sidebar({ subscriptions, onCreateEvent, notificationCount = 3 }: SidebarProps) {
    return (
        <div className={styles.sidebar}>
            {/* CardExtra с кликабельной иконкой */}
            <CardExtra
                title="Уведомления"
                subtitle="Все уведомления"
                avatarUrl='https://randomuser.me/api/portraits/men/56.jpg'
                addon={
                    <NotificationBadge icon={<img src={bell} alt="Уведомления" />} count={notificationCount} />
                }
                onAddonClick={() => console.log('Открыть уведомления')}
            />

            {/* CircleButton с текстом */}
            <div className={styles.createEventWrapper}>
                <CircleButton onClick={onCreateEvent} variant={"green"}/>
                <span className={styles.createEventText}>Создайте мероприятие</span>
            </div>

            <NextEvent
                title="Вечеринка у друзей"
                date="10 ноября, 19:00"
                onAttend={() => console.log("Пойду")}
                onDetails={() => console.log("Подробнее")}
            />

            {/* Sublist */}
            <Sublist items={subscriptions} />
        </div>
    );
}
