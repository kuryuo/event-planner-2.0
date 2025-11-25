import {useState, useEffect, useRef} from "react";
import styles from "./Participants.module.scss";
import Avatar from "@/ui/avatar/Avatar";

interface Participant {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface ParticipantsProps {
    participants?: Participant[];
    maxParticipants?: number;
}

const mockParticipants: Participant[] = [
    {id: "1", name: "Алексей Смирнов", avatarUrl: "https://randomuser.me/api/portraits/men/15.jpg"},
    {id: "2", name: "Мария Волкова", avatarUrl: "https://randomuser.me/api/portraits/women/21.jpg"},
    {id: "3", name: "Дмитрий Орлов", avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg"},
    {id: "4", name: "Екатерина Иванова", avatarUrl: "https://randomuser.me/api/portraits/women/38.jpg"},
    {id: "5", name: "Илья Кузнецов", avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg"},
    {id: "6", name: "Анна Петрова", avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"},
    {id: "7", name: "Сергей Новиков", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"},
    {id: "8", name: "Ольга Соколова", avatarUrl: "https://randomuser.me/api/portraits/women/56.jpg"},
    {id: "9", name: "Павел Лебедев", avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg"},
    {id: "10", name: "Татьяна Морозова", avatarUrl: "https://randomuser.me/api/portraits/women/25.jpg"},
    {id: "11", name: "Иван Федоров", avatarUrl: "https://randomuser.me/api/portraits/men/28.jpg"},
];

const AVATAR_SIZE = 48;
const AVATAR_OVERLAP = 12;
const ADD_BUTTON_WIDTH = 48;
const ADD_BUTTON_MARGIN = 8;
const REMAINING_BADGE_WIDTH = 48;

export default function Participants({
                                         participants = mockParticipants,
                                         maxParticipants,
                                     }: ParticipantsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(8);

    const totalCount = participants.length;

    useEffect(() => {
        const calculateVisibleCount = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;

            let availableWidth = containerWidth;
            let count = 0;

            if (availableWidth >= AVATAR_SIZE) {
                availableWidth -= AVATAR_SIZE;
                count = 1;
            } else {
                setVisibleCount(0);
                return;
            }

            const avatarWidthWithOverlap = AVATAR_SIZE - AVATAR_OVERLAP;
            while (availableWidth >= avatarWidthWithOverlap && count < totalCount) {
                availableWidth -= avatarWidthWithOverlap;
                count++;
            }

            const hasRemaining = count < totalCount;
            if (hasRemaining) {
                const spaceForRemaining = REMAINING_BADGE_WIDTH - AVATAR_OVERLAP;
                if (availableWidth < spaceForRemaining) {
                    count--;
                }
            }

            const spaceForButton = ADD_BUTTON_WIDTH + ADD_BUTTON_MARGIN;
            if (availableWidth < spaceForButton) {
                if (count > 0) {
                    count--;
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

    return (
        <div className={styles.participants}>
            <div className={styles.header}>
                <h2 className={styles.title}>Участники</h2>
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
        </div>
    );
}
