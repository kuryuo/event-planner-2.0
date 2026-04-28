import clsx from "clsx";
import {Badge} from "antd";
import styles from "./NotificationBadge.module.scss";

interface NotificationBadgeProps {
    icon: React.ReactNode;
    count?: number;
    className?: string;
}

export function NotificationBadge({icon, count, className}: NotificationBadgeProps) {
    return (
        <div className={clsx(styles.wrapper, className)}>
            {icon}
            {count !== undefined && count > 0 && (
                <Badge
                    count={count}
                    className={`ep-badge--text ${styles.badge}`}
                />
            )}
        </div>
    );
}
