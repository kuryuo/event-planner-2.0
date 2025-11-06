import clsx from "clsx";
import styles from "./Badge.module.scss";

type BadgeColor = "primary" | "secondary" | "green" | "negative";
type BadgeVariant = "text" | "dot";
type BadgeSize = "S" | "M";

interface BadgeProps {
    count?: number;
    color?: BadgeColor;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}

const Badge = ({
                   count,
                   color = "primary",
                   variant = "text",
                   size = "S",
                   className,
               }: BadgeProps) => {
    return (
        <div
            className={clsx(
                styles.badge,
                styles[`variant-${variant}`],
                styles[`color-${color}`],
                variant === "dot" && styles[`size-${size}`],
                className
            )}
        >
            {variant === "text" && count}
        </div>
    );
};

export default Badge;
