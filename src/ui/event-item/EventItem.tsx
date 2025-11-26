import Button from '../button/Button';
import styles from './EventItem.module.scss';
import BoxArrowUpIcon from '@/assets/img/icon-m/box-arrow-up-right.svg';

interface EventItemProps {
    time: string;
    title: string;
    description: string;
}

export default function EventItem({time, title, description}: EventItemProps) {
    return (
        <div className={styles.eventItem}>
            <div className={styles.time}>{time}</div>
            <div className={styles.content}>
                <img
                    src="https://api.dicebear.com/7.x/shapes/png?size=200&radius=50"
                    alt={title}
                    className={styles.avatar}
                />
                <div className={styles.text}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.description}>{description}</div>
                </div>
            </div>
            <div className={styles.buttonWrapper}>
                <Button variant="Filled" color="purple">
                    Действие
                </Button>
                <img src={BoxArrowUpIcon} alt="icon" className={styles.buttonIcon}/>
            </div>
        </div>
    );
}
