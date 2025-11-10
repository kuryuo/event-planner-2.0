import clsx from "clsx";
import styles from "./Badge.module.scss";
import type {AppColor} from "@/const";

type BadgeVariant = "text" | "dot";
type BadgeSize = "S" | "M";

interface BadgeProps {
    count?: number;
    color?: AppColor;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}

const Badge = ({
                   count,
                   color = "brand-green",
                   variant = "text",
                   size = "S",
                   className,
               }: BadgeProps) => {
    return (
        <div
            className={clsx(
                styles.badge,
                styles[`variant-${variant}`],
                variant === "dot" && styles[`size-${size}`],
                className
            )}
            style={{"--badge-bg": `var(--bg-${color})`} as React.CSSProperties}>
            {variant === "text" && count}
        </div>
    );
};

export default Badge;
