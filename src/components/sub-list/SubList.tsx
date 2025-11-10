import {CardExtra} from '@/ui/card/CardExtra';
import type {CardBaseProps} from '@/ui/card/CardBase';
import Badge from '@/ui/badge/Badge';
import styles from './Sublist.module.scss';

interface SublistProps {
    title?: string;
    items: CardBaseProps[];
}

export function Sublist({title = 'Мои подписки', items}: SublistProps) {
    return (
        <div className={styles.sublist}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.count}>{items.length}</span>
            </div>

            <div className={styles.list}>
                {items.map((item, index) => (
                    <CardExtra
                        key={index}
                        {...item}
                        addon={<Badge variant="dot" color="brand-green" size="M"/>}
                    />
                ))}
            </div>

        </div>
    );
}
