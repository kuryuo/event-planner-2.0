import clsx from 'clsx';
import styles from './Card.module.scss';
import Avatar from '../avatar/Avatar.tsx';

export type CardSize = 'M' | 'S';

export interface CardBaseProps {
    size?: CardSize;
    title: string;
    subtitle?: string;
    avatarUrl: string;
    className?: string;
    children?: React.ReactNode;
}

export function CardBase({
                             size = 'M',
                             title,
                             subtitle,
                             avatarUrl,
                             className,
                             children,
                         }: CardBaseProps) {
    return (
        <div className={clsx(styles.wrapper, styles[size], className)}>
            {avatarUrl && <Avatar size={size} avatarUrl={avatarUrl} name={title} />}
            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <span className={styles.title}>{title}</span>
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                </div>
                {children}
            </div>
        </div>
    );
}
