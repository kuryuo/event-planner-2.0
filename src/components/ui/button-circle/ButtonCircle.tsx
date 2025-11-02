import clsx from 'clsx';
import styles from './ButtonCircle.module.scss';

type CircleButtonVariant = 'purple' | 'primary';

interface CircleButtonProps {
    number: number;
    variant?: CircleButtonVariant;
    onClick?: () => void;
}

export default function CircleButton({
                                         number,
                                         variant = 'purple',
                                         onClick,
                                     }: CircleButtonProps) {
    return (
        <button
            className={clsx(styles.circleButton, {
                [styles.purple]: variant === 'purple',
                [styles.primary]: variant === 'primary',
            })}
            onClick={onClick}
            aria-label={`+${number}`}
        >
            +{number}
        </button>
    );
}
