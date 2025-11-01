import clsx from "clsx";
import styles from "./Badge.module.scss";

interface BadgeProps {
    count: number;
    color?: "primary" | "secondary";
    className?: string;
}

const Badge = ({count, color = "primary", className}: BadgeProps) => {
    return (
        <div className={clsx(styles.badge, styles[`color-${color}`], className)}>
            {count}
        </div>
    );
};

export default Badge;
