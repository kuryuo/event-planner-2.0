import styles from "./ParticipantsModal.module.scss";
import XIcon from '@/assets/img/icon-s/x.svg?react';
import {buildImageUrl} from '@/utils/buildImageUrl';
import ParticipantCard from './ParticipantCard';

interface Participant {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    isInContacts?: boolean;
}

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    totalCount: number;
    isLoading?: boolean;
    isAdmin?: boolean;
    onRemoveFromContacts?: (participantId: string) => void;
    onExclude?: (participantId: string) => void;
}

export default function ParticipantsModal({
    isOpen,
    onClose,
    participants,
    totalCount,
    isLoading = false,
    isAdmin = false,
    onRemoveFromContacts,
    onExclude,
}: ParticipantsModalProps) {

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                        <div className={styles.participantsList}>
                            {participants.map((participant) => (
                                <ParticipantCard
                                    key={participant.id}
                                    name={participant.name || 'Пользователь'}
                                    avatarUrl={buildImageUrl(participant.avatarUrl)}
                                    isInContacts={participant.isInContacts ?? true}
                                    onRemoveFromContacts={() => onRemoveFromContacts?.(participant.id)}
                                    onExclude={() => onExclude?.(participant.id)}
                                    showActions={isAdmin}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

