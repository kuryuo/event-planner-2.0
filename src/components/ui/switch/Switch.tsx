import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './Switch.module.scss';

type SwitchSize = 'M' | 'S';
type SwitchPosition = 'left' | 'right';

interface SwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: SwitchSize;
    label?: ReactNode;
    labelPosition?: SwitchPosition;
}

export default function Switch({
                                   checked = false,
                                   onCheckedChange,
                                   disabled = false,
                                   size = 'M',
                                   label,
                                   labelPosition,
                               }: SwitchProps) {
    const handleClick = () => {
        if (!disabled && onCheckedChange) onCheckedChange(!checked);
    };

    return (
        <label className={clsx(styles.wrapper, disabled && styles.disabled, 'body-m')}>
            {label && labelPosition === 'left' && (
                <span className={styles.label}>{label}</span>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleClick}
                className={clsx(styles.switch, styles[size], checked && styles.checked)}
            >
                <span className={styles.thumb}/>
            </button>

            {label && labelPosition === 'right' && (
                <span className={styles.label}>{label}</span>
            )}
        </label>

    );
}
