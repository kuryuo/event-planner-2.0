import clsx from 'clsx';
import styles from './EventPlate.module.scss';
import Avatar from '@/ui/avatar/Avatar.tsx';

interface EventPlateProps {
    title: string;
    date: string;
    avatarUrl?: string;
    className?: string;
    onClick?: () => void;
}

export default function EventPlate({
                                      title,
                                      date,
                                      avatarUrl,
                                      className,
                                      onClick,
                                  }: EventPlateProps) {
    return (
        <button
            type="button"
            className={clsx(styles.plate, className)}
            onClick={onClick}
        >
            <Avatar className={styles.avatar} size="S" shape="square" fallbackType="event" avatarUrl={avatarUrl} name={title}/>
            <span className={styles.text}>
                <span className={styles.title}>{title}</span>
                <span className={styles.date}>{date}</span>
            </span>
        </button>
    );
}
