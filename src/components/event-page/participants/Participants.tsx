import {useState, useEffect, useRef} from "react";
import styles from "./Participants.module.scss";
import Avatar from "@/ui/avatar/Avatar";
import Button from "@/ui/button/Button";
import {useEventSubscribers} from "@/hooks/api/useEventSubscribers.ts";
import {useParticipantsModal} from "@/hooks/api/useParticipantsModal.ts";
import ParticipantsModal from "./ParticipantsModal.tsx";

interface ParticipantsProps {
    eventId: string | null;
    maxParticipants?: number;
    isAdmin?: boolean;
}

const AVATAR_SIZE = 48;
const AVATAR_OVERLAP = 12;
const REMAINING_BADGE_WIDTH = 48;

export default function Participants({
                                         eventId,
                                         maxParticipants,
                                         isAdmin = false,
                                     }: ParticipantsProps) {
    const {participants, isLoading} = useEventSubscribers(eventId);
    const {
        isOpen,
        openModal,
        closeModal,
        participants: modalParticipants,
        totalCount: modalTotalCount,
        isLoading: isModalLoading,
    } = useParticipantsModal(eventId, 50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(8);

    const totalCount = participants.length;

    useEffect(() => {
        const calculateVisibleCount = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;

            let availableWidth = containerWidth;
            let count = 0;

            if (availableWidth < AVATAR_SIZE) {
                setVisibleCount(0);
                return;
            }

            availableWidth -= AVATAR_SIZE;
            count = 1;

            const avatarWidthWithOverlap = AVATAR_SIZE - AVATAR_OVERLAP;

            while (availableWidth >= avatarWidthWithOverlap && count < totalCount) {
                availableWidth -= avatarWidthWithOverlap;
                count++;
            }

            if (count < totalCount) {
                const spaceNeededForRemaining = REMAINING_BADGE_WIDTH - AVATAR_OVERLAP;
                if (availableWidth < spaceNeededForRemaining && count > 1) {
                    count--;
                    availableWidth += avatarWidthWithOverlap;
                }
            }

            setVisibleCount(Math.max(0, count));
        };

        calculateVisibleCount();

        const resizeObserver = new ResizeObserver(() => {
            calculateVisibleCount();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [totalCount]);

    const visibleParticipants = participants.slice(0, visibleCount);
    const remainingCount = totalCount > visibleCount ? totalCount - visibleCount : 0;

    const formatCount = () => {
        if (maxParticipants) {
            return `${totalCount} из ${maxParticipants}`;
        }
        return totalCount.toString();
    };

    const handleInvite = () => {
        console.log("Пригласить участников");
    };

    if (isLoading) {
        return (
            <div className={styles.participants}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Участники</h2>
                </div>
                <div>Загрузка...</div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.participants}>
                <div className={styles.header}>
                    <h2 className={styles.title} onClick={openModal} style={{cursor: 'pointer'}}>Участники</h2>
                    <span className={styles.count}>{formatCount()}</span>
                </div>

            <div ref={containerRef} className={styles.avatarsContainer}>
                {visibleParticipants.map((participant, index) => (
                    <div
                        key={participant.id}
                        className={styles.avatarWrapper}
                        style={{zIndex: index + 1}}
                    >
                        <Avatar
                            size="M"
                            name={participant.name}
                            avatarUrl={participant.avatarUrl}
                        />
                    </div>
                ))}

                {remainingCount > 0 && (
                    <div
                        className={styles.avatarWrapper}
                        style={{zIndex: visibleCount + 1}}
                    >
                        <div className={styles.remainingCount}>
                            <span className={styles.remainingText}>+{remainingCount}</span>
                        </div>
                    </div>
                )}
            </div>

                {isAdmin && (
                    <Button variant="Filled" color="gray" onClick={handleInvite}>
                        Пригласить
                    </Button>
                )}
            </div>

            <ParticipantsModal
                isOpen={isOpen}
                onClose={closeModal}
                participants={modalParticipants}
                totalCount={modalTotalCount}
                isLoading={isModalLoading}
                isAdmin={isAdmin}
                onRemoveFromContacts={(id) => console.log('Убрать из контактов', id)}
                onExclude={(id) => console.log('Исключить', id)}
            />
        </>
    );
}
