import styles from "./NextEvent.module.scss";
import Button from "@/ui/button/Button";

interface NextEventProps {
    title: string;
    date: string;
    onAttend?: () => void;
    onDetails?: () => void;
}

export default function NextEvent({
                              title,
                              date,
                              onAttend,
                              onDetails,
                          }: NextEventProps) {
    return (
        <div className={styles.nextEvent}>
            <div className={styles.label}>Скоро</div>
            <div className={styles.title}>{title}</div>
            <div className={styles.date}>{date}</div>
            <div className={styles.actions}>
                <Button size="M" variant="Filled" onClick={onAttend}>
                    Я пойду
                </Button>
                <Button size="M" variant="Dense" onClick={onDetails}>
                    Подробнее
                </Button>
            </div>
        </div>
    );
}
