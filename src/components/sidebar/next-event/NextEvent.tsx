import styles from "./NextEvent.module.scss";
import {Button} from "antd";

interface NextEventProps {
    title: string;
    date: string;
    isSubscribed?: boolean;
    isOrganizer?: boolean;
    onAttend?: () => void;
    onDetails?: () => void;
}

export default function NextEvent({
                                      title,
                                      date,
                                      isSubscribed = false,
                                      isOrganizer = false,
                                      onAttend,
                                      onDetails,
                                  }: NextEventProps) {
    return (
        <div className={styles.nextEvent}>
            <div className={styles.label}>Скоро</div>
            <div className={styles.title}>{title}</div>
            <div className={styles.date}>{date}</div>
            <div className={styles.actions}>
                {!isOrganizer && (
                    <Button 
                        type={isSubscribed ? "default" : "primary"}
                        className={`ep-btn ep-btn--m ${isSubscribed ? "ep-btn--filled-gray" : "ep-btn--filled-purple"}`}
                        onClick={onAttend}
                    >
                        {isSubscribed ? "Я не пойду" : "Я пойду"}
                    </Button>
                )}
                <Button type="text" className="ep-btn ep-btn--m ep-btn--text" onClick={onDetails}>
                    Подробнее
                </Button>
            </div>
        </div>
    );
}
