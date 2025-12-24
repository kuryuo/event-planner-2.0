import {Card, type CardProps} from '@/ui/card/Card.tsx';
import Badge from '@/ui/badge/Badge.tsx';
import styles from './SubList.module.scss';

interface SublistProps {
    title?: string;
    items: CardProps[];
}

export function Sublist({title = 'Мои подписки', items}: SublistProps) {
    return (
        <div className={styles.sublist}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.count}>{items.length}</span>
            </div>

            {items.length === 0 ? (
                <div className={styles.empty}>Нет подписок</div>
            ) : (
                <div className={styles.list}>
                    {items.map((item, index) => (
                        <Card
                            key={index}
                            {...item}
                            rightIcon={<Badge variant="dot" color="brand-green" size="M"/>}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}
