import clsx from 'clsx';
import styles from './Card.module.scss';
import Avatar from '../avatar/Avatar.tsx';

export type CardSize = 'M' | 'S';

export interface CardProps {
    size?: CardSize;
    title: string;
    subtitle?: string;
    avatarUrl: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

export function Card({
    size = 'M',
    title,
    subtitle,
    avatarUrl,
    className,
    children,
    onClick,
    rightIcon,
    onRightIconClick,
}: CardProps) {
    return (
        <div
            className={clsx(
                styles.wrapper,
                styles[size],
                onClick && styles.clickable,
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {avatarUrl && <Avatar size={size} avatarUrl={avatarUrl} name={title} />}
            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <span className={clsx(styles.title, styles[size])}>{title}</span>
                    {subtitle && (
                        <div className={styles.subtitleWrapper}>
                            <span className={clsx(styles.subtitle, styles[size])}>{subtitle}</span>
                        </div>
                    )}
                </div>
                {children}
            </div>
            {rightIcon && (
                <div
                    className={styles.rightIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRightIconClick?.();
                    }}
                    role={onRightIconClick ? 'button' : undefined}
                    aria-label={onRightIconClick ? 'Action' : undefined}
                >
                    {rightIcon}
                </div>
            )}
        </div>
    );
}
