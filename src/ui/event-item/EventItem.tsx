import Button from '../button/Button';
import styles from './EventItem.module.scss';
import BoxArrowUpIcon from '@/assets/img/icon-m/box-arrow-up-right.svg';
import {useNavigate} from "react-router-dom";
import {buildImageUrl} from '@/utils/buildImageUrl.ts';

interface EventItemProps {
    eventId: string;
    time: string;
    title: string;
    description: string;
    isSubscribed: boolean;
    avatar?: string | null;
    isOrganizer?: boolean;
    onSubscribe?: (eventId: string) => void;
    onUnsubscribe?: (eventId: string) => void;
}

export default function EventItem({
    eventId,
    time,
    title,
    description,
    isSubscribed,
    avatar,
    isOrganizer = false,
    onSubscribe,
    onUnsubscribe
}: EventItemProps) {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        if (isSubscribed) {
            onUnsubscribe?.(eventId);
        } else {
            onSubscribe?.(eventId);
        }
    };

    const handleIconClick = () => {
        navigate(`/event?id=${eventId}`);
    };

    return (
        <div className={styles.eventItem}>
            <div className={styles.time}>{time}</div>
            <div className={styles.content}>
                <img
                    src={buildImageUrl(avatar) || "https://api.dicebear.com/7.x/shapes/png?size=200&radius=50"}
                    alt={title}
                    className={styles.avatar}
                />
                <div className={styles.text}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.description}>{description}</div>
                </div>
            </div>
            <div className={styles.buttonWrapper}>
                {!isOrganizer && (
                    <Button 
                        variant="Filled" 
                        color={isSubscribed ? "gray" : "purple"}
                        onClick={handleButtonClick}
                    >
                        {isSubscribed ? "Я не пойду" : "Я пойду"}
                    </Button>
                )}
                <img 
                    src={BoxArrowUpIcon} 
                    alt="icon" 
                    className={styles.buttonIcon}
                    onClick={handleIconClick}
                    style={{cursor: 'pointer'}}
                />
            </div>
        </div>
    );
}
