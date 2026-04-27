import type {ReactNode} from 'react';
import clsx from 'clsx';
import {Switch as AntSwitch} from 'antd';
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
    labelPosition = 'right',
}: SwitchProps) {
    const sw = (
        <AntSwitch
            checked={checked}
            disabled={disabled}
            onChange={onCheckedChange}
            size={size === 'S' ? 'small' : 'default'}
            className={styles.antSwitch}
        />
    );

    if (!label) {
        return <span className={clsx(styles.root, disabled && styles.disabled)}>{sw}</span>;
    }

    return (
        <label className={clsx(styles.root, styles.withLabel, disabled && styles.disabled)}>
            {labelPosition === 'left' ? <span className={styles.label}>{label}</span> : null}
            {sw}
            {labelPosition === 'right' ? <span className={styles.label}>{label}</span> : null}
        </label>
    );
}
