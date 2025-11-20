import {CardExtra} from '@/ui/card/CardExtra';
import {Sublist} from '@/components/sub-list/SubList';
import {NotificationBadge} from '@/ui/notification-badge/NotificationBadge';
import CircleButton from '@/ui/button-circle/ButtonCircle';
import bell from '@/assets/img/icon-l/bell.svg';
import styles from './Sidebar.module.scss';
import type {CardBaseProps} from '@/ui/card/CardBase';
import NextEvent from "@/components/next-event/NextEvent.tsx";
import clsx from "clsx";
import {useProfile} from "@/hooks/useProfile.ts";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";

interface SidebarProps {
    subscriptions: CardBaseProps[];
    onCreateEvent?: () => void;
    notificationCount?: number;
}

export default function Sidebar({subscriptions, onCreateEvent, notificationCount = 3}: SidebarProps) {
    const {profile, isLoading} = useProfile();
    const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=50';

    return (
        <div className={styles.sidebar}>
            <div className={styles.block}>
                <CardExtra
                    title={`${profile?.lastName ?? ''} ${profile?.firstName ?? ''} ${profile?.middleName ?? ''}`.trim()}
                    subtitle=""
                    avatarUrl={
                        profile?.avatarUrl
                            ? buildImageUrl(profile.avatarUrl)!
                            : fallbackAvatar
                    }
                    addon={
                        <NotificationBadge icon={<img src={bell} alt="Уведомления"/>} count={notificationCount}/>
                    }
                    onAddonClick={() => console.log('Открыть уведомления')}
                />
            </div>

            <div className={clsx(styles.block, styles.createEventWrapper)}>
                <CircleButton onClick={onCreateEvent} variant={"green"}/>
                <span className={styles.createEventText}>Создайте мероприятие</span>
            </div>

            <div className={styles.block}>
                <NextEvent
                    title="Вечеринка у друзей"
                    date="10 ноября, 19:00"
                    onAttend={() => console.log("Пойду")}
                    onDetails={() => console.log("Подробнее")}
                />
            </div>

            <div className={styles.block}>
                <Sublist items={subscriptions}/>
            </div>
        </div>
    );
}
