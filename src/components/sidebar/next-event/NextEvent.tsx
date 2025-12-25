import styles from "./NextEvent.module.scss";
import Button from "@/ui/button/Button.tsx";

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
                        size="M" 
                        variant="Filled" 
                        color={isSubscribed ? "gray" : "purple"}
                        onClick={onAttend}
                    >
                        {isSubscribed ? "Я не пойду" : "Я пойду"}
                    </Button>
                )}
                <Button size="M" variant="Text" onClick={onDetails}>
                    Подробнее
                </Button>
            </div>
        </div>
    );
}
