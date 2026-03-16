import type {ReactNode} from 'react';
import styles from './ProfileActionModal.module.scss';
import Button from '@/ui/button/Button.tsx';
import XIcon from '@/assets/img/icon-s/x.svg?react';

type ConfirmTone = 'default' | 'danger';

interface ProfileActionModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmTone?: ConfirmTone;
    confirmDisabled?: boolean;
    children?: ReactNode;
}

export default function ProfileActionModal({
    isOpen,
    title,
    description,
    onClose,
    onConfirm,
    confirmText = 'Подтвердить',
    cancelText = 'Отменить',
    confirmTone = 'default',
    confirmDisabled = false,
    children,
}: ProfileActionModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <div className={styles.headerRow}>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
                        <XIcon/>
                    </button>
                </div>

                {description && <p className={styles.description}>{description}</p>}
                {children && <div className={styles.body}>{children}</div>}

                <div className={styles.actions}>
                    <Button variant="Text" color="default" onClick={onClose}>
                        {cancelText}
                    </Button>
                    {onConfirm && (
                        <Button
                            variant="Filled"
                            color={confirmTone === 'danger' ? 'red' : 'gray'}
                            onClick={onConfirm}
                            disabled={confirmDisabled}
                        >
                            {confirmText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
