import clsx from "clsx";
import styles from "./Chip.module.scss";
import CloseImg from "@/assets/img/icon-s/x.svg";
import type {AppColor} from "@/const";

interface ChipProps {
    text: string;
    size?: "S" | "M";
    closable?: boolean;
    color?: AppColor;
    onClose?: () => void;
    className?: string;
}

const Chip = ({
                  text,
                  size = "M",
                  closable = false,
                  color = "pink",
                  onClose,
                  className
              }: ChipProps) => {
    return (
        <div
            className={clsx(styles.chip, styles[`size-${size}`], className)}
            style={{
                "--chip-bg": `var(--bg-${color})`,
                "--chip-color": `var(--content-${color})`
            } as React.CSSProperties}
        >
            <span className={styles.text}>{text}</span>
            {closable && (
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    <img src={CloseImg} alt="Close"/>
                </button>
            )}
        </div>
    );
};

export default Chip;
