import {useEffect, useRef} from "react";
import styles from "./ParticipantsModal.module.scss";
import Avatar from "@/ui/avatar/Avatar";
import XIcon from '@/assets/img/icon-s/x.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside';
import {buildImageUrl} from '@/utils/buildImageUrl';

interface Participant {
    id: string;
    name: string | null;
    avatarUrl: string | null;
}

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    totalCount: number;
    isLoading?: boolean;
}

export default function ParticipantsModal({
    isOpen,
    onClose,
    participants,
    totalCount,
    isLoading = false,
}: ParticipantsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useClickOutside(overlayRef, onClose, isOpen);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} ref={overlayRef}>
            <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.title}>Участники</h2>
                        <span className={styles.count}>{totalCount}</span>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        <XIcon className={styles.closeIcon}/>
                    </button>
                </div>

                <div className={styles.content}>
                    {isLoading ? (
                        <div className={styles.loading}>Загрузка...</div>
                    ) : participants.length === 0 ? (
                        <div className={styles.empty}>Участников пока нет</div>
                    ) : (
                        <div className={styles.participantsGrid}>
                            {participants.map((participant) => (
                                <div key={participant.id} className={styles.participantItem}>
                                    <Avatar
                                        size="M"
                                        name={participant.name || 'Пользователь'}
                                        avatarUrl={buildImageUrl(participant.avatarUrl) ?? undefined}
                                    />
                                    <span className={styles.participantName}>
                                        {participant.name || 'Пользователь'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

