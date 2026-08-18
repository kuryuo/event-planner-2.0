import clsx from 'clsx';
import styles from './ButtonCircle.module.scss';
import PlusIcon from '@/assets/img/icon-l/plus-lg.svg?react';
import {useI18n} from '@/i18n/I18nProvider';

type CircleButtonVariant = 'purple' | 'gray' | 'green';

interface CircleButtonProps {
    variant?: CircleButtonVariant;
    onClick?: () => void;
}

export default function CircleButton({
                                         variant = 'purple',
                                         onClick,
                                     }: CircleButtonProps) {
    const {t} = useI18n();

    return (
        <button
            className={clsx(styles.button, {
                [styles.purple]: variant === 'purple',
                [styles.gray]: variant === 'gray',
                [styles.green]: variant === 'green',
            })}
            onClick={onClick}
            aria-label={t('common.actions.createNew')}
        >
            <PlusIcon className={styles.icon}/>
        </button>
    );
}
