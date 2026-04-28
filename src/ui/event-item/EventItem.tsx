import {Button} from "antd";
import styles from './EventItem.module.scss';
import BoxArrowUpIcon from '@/assets/img/icon-m/box-arrow-up-right.svg?react';
import {useNavigate} from "react-router-dom";
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {Avatar} from "antd";

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
                <Avatar
                    className={`${styles.avatar} ep-avatar`}
                    size={64}
                    shape="square"
                    src={buildImageUrl(avatar)}
                >
                    {(title?.[0] ?? "—").toUpperCase()}
                </Avatar>
                <div className={styles.text}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.description}>{description}</div>
                </div>
            </div>
            <div className={styles.buttonWrapper}>
                {!isOrganizer && (
                    <Button
                        type={isSubscribed ? "default" : "primary"}
                        className={`ep-btn ep-btn--m ${isSubscribed ? "ep-btn--filled-gray" : "ep-btn--filled-purple"}`}
                        onClick={handleButtonClick}
                    >
                        {isSubscribed ? "Я не пойду" : "Я пойду"}
                    </Button>
                )}
                <BoxArrowUpIcon className={styles.buttonIcon} onClick={handleIconClick} style={{cursor: 'pointer'}}/>
            </div>
        </div>
    );
}
