import {CardExtra} from '@/ui/card/CardExtra.tsx';
import {Sublist} from '@/components/sidebar/sub-list/SubList.tsx';
import {NotificationBadge} from '@/ui/notification-badge/NotificationBadge.tsx';
import CircleButton from '@/ui/button-circle/ButtonCircle.tsx';
import bell from '@/assets/img/icon-l/bell.svg';
import styles from './Sidebar.module.scss';
import type {CardBaseProps} from '@/ui/card/CardBase.tsx';
import NextEvent from "@/components/sidebar/next-event/NextEvent.tsx";
import clsx from "clsx";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import {useGetProfileQuery} from "@/services/api/profileApi.ts";
import {useNavigate} from "react-router-dom";

interface SidebarProps {
    subscriptions: CardBaseProps[];
    notificationCount?: number;
    isAdmin?: boolean;
}

export default function Sidebar({subscriptions, notificationCount = 3, isAdmin = false}: SidebarProps) {
    const {data: profile, isLoading} = useGetProfileQuery();
    const navigate = useNavigate();
    const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=50';

    const handleCreateEvent = () => {
            navigate("/editor");
    };

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

            {isAdmin && (
                <div className={clsx(styles.block, styles.createEventWrapper)}>
                    <CircleButton onClick={handleCreateEvent} variant={"green"}/>
                    <span className={styles.createEventText}>Создайте мероприятие</span>
                </div>
            )}

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
