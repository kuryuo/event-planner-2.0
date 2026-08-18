import type {ReactNode} from 'react';
import styles from './ProfileActionModal.module.scss';
import {Button} from "antd";
import XIcon from '@/assets/img/icon-s/x.svg?react';
import {useI18n} from '@/i18n/I18nProvider';

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
    confirmText,
    cancelText,
    confirmTone = 'default',
    confirmDisabled = false,
    children,
}: ProfileActionModalProps) {
    const {t} = useI18n();
    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <div className={styles.headerRow}>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.closeButton} onClick={onClose} aria-label={t('common.actions.close')}>
                        <XIcon/>
                    </button>
                </div>

                {description && <p className={styles.description}>{description}</p>}
                {children && <div className={styles.body}>{children}</div>}

                <div className={styles.actions}>
                    <Button type="text" className="ep-btn ep-btn--m ep-btn--text" onClick={onClose}>
                        {cancelText ?? t('common.actions.cancel')}
                    </Button>
                    {onConfirm && (
                        <Button
                            type={confirmTone === 'danger' ? "primary" : "default"}
                            danger={confirmTone === 'danger'}
                            className={`ep-btn ep-btn--m ${confirmTone === 'danger' ? '' : 'ep-btn--filled-gray'}`}
                            onClick={onConfirm}
                            disabled={confirmDisabled}
                        >
                            {confirmText ?? t('common.actions.confirm')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
