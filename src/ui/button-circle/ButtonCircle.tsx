import clsx from 'clsx';
import styles from './ButtonCircle.module.scss';
import PlusIcon from '@/assets/img/icon-l/plus-lg.svg';

type CircleButtonVariant = 'purple' | 'primary' | 'green';

interface CircleButtonProps {
    variant?: CircleButtonVariant;
    onClick?: () => void;
}

export default function CircleButton({
                                         variant = 'purple',
                                         onClick,
                                     }: CircleButtonProps) {
    return (
        <button
            className={clsx(styles.button, {
                [styles.purple]: variant === 'purple',
                [styles.primary]: variant === 'primary',
                [styles.green]: variant === 'green',
            })}
            onClick={onClick}
            aria-label="Создать"
        >
            <img src={PlusIcon} alt="+" className={styles.icon} />
        </button>
    );
}
