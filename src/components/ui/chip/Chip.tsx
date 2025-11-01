import clsx from "clsx";
import styles from "./Chip.module.scss";
import CloseImg from "@/assets/img/icon-s/x.svg";

interface ChipProps {
    text: string;
    size?: "S" | "M";
    closable?: boolean;
    color?:
        | "pink"
        | "blue"
        | "orange"
        | "purple"
        | "cyan"
        | "deep-orange"
        | "deep-purple"
        | "teal"
        | "brown"
        | "indigo"
        | "green"
        | "plum";
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
        <div className={clsx(styles.chip, styles[`size-${size}`], styles[`color-${color}`], className)}>
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
