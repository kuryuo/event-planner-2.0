import clsx from "clsx";
import styles from "./Chip.module.scss";
import CloseImg from "@/assets/img/icon-s/x.svg?react";
import type {AppColor} from "@/const";

interface ChipProps {
    text: string;
    size?: "S" | "M";
    closable?: boolean;
    variant?: "outlined" | "filled";
    color?: AppColor;
    onClose?: () => void;
    className?: string;
}

const Chip = ({
                   text,
                   size = "M",
                   closable = false,
                   variant = "outlined",
                   color = "pink",
                   onClose,
                   className
               }: ChipProps) => {
    return (
        <div
            className={clsx(
                styles.chip,
                styles[`size-${size}`],
                styles[variant],
                className
            )}
            style={
                variant === "filled"
                    ? ({
                        "--chip-bg": `var(--bg-${color})`,
                        "--chip-color": `var(--content-${color})`,
                    } as React.CSSProperties)
                    : undefined
            }
        >
            <span className={styles.text}>{text}</span>
            {closable && (
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    <CloseImg/>
                </button>
            )}
        </div>
    );
};

export default Chip;
