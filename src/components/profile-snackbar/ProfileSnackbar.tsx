import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './ProfileSnackbar.module.scss';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-s/x.svg?react';
import CircleIcon from '@/assets/img/icon-m/circle.svg?react';
import BanIcon from '@/assets/img/icon-m/ban.svg?react';

export type ProfileSnackbarVariant = 'default' | 'success' | 'warning' | 'error';

interface ProfileSnackbarProps {
    text: string;
    variant?: ProfileSnackbarVariant;
    actionLabel?: string;
    onAction?: () => void;
    counter?: number;
    avatarUrl?: string;
    onClose?: () => void;
}

const ICON_MAP: Record<ProfileSnackbarVariant, ReactNode> = {
    default: <CircleIcon/>,
    success: <Check2Icon/>,
    warning: <BanIcon/>,
    error: <XIcon/>,
};

export default function ProfileSnackbar({
    text,
    variant = 'default',
    actionLabel,
    onAction,
    counter,
    avatarUrl,
    onClose,
}: ProfileSnackbarProps) {
    return (
        <div className={clsx(styles.snackbar, styles[variant])}>
            <span className={styles.leadingIcon}>{ICON_MAP[variant]}</span>
            <span className={styles.text}>{text}</span>

            {avatarUrl && <img src={avatarUrl} alt="avatar" className={styles.avatar}/>} 

            {actionLabel && (
                <button className={styles.action} onClick={onAction}>
                    {actionLabel}
                </button>
            )}

            {typeof counter === 'number' && <span className={styles.counter}>{counter}</span>}

            <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
                <XIcon/>
            </button>
        </div>
    );
}
