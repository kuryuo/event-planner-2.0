import {useState, useRef, useEffect} from 'react';
import styles from "./ParticipantsModal.module.scss";
import XIcon from '@/assets/img/icon-s/x.svg?react';
import {buildImageUrl} from '@/utils/buildImageUrl';
import ParticipantCard from './ParticipantCard';
import TextField from '@/ui/text-field/TextField';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import Filter from '@/assets/img/icon-m/filter.svg';
import ParticipantsFilterMenu from './ParticipantsFilterMenu';
import {useParticipantsModal} from '@/hooks/api/useParticipantsModal';
import {useGetEventRolesQuery} from '@/services/api/eventApi';

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
    eventId: string;
    onExclude?: (participantId: string) => void;
}

export default function ParticipantsModal({
    isOpen,
    onClose,
    isAdmin = false,
    eventId,
    onExclude,
}: ParticipantsModalProps) {
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [inContacts, setInContacts] = useState(false);
    const [searchName, setSearchName] = useState('');
    const filterButtonRef = useRef<HTMLButtonElement>(null);
    
    const {data: rolesData} = useGetEventRolesQuery(
        {eventId, count: 100},
        {skip: !isOpen || !eventId}
    );
    const roles = rolesData?.res || [];
    
    // Определяем выбранную роль (берем первую из массива, если есть) и получаем её название
    const selectedRoleId = selectedRoles.length > 0 ? selectedRoles[0] : undefined;
    const selectedRole = selectedRoleId 
        ? roles.find(r => r.id === selectedRoleId)?.name 
        : undefined;
    
    const {
        participants,
        totalCount,
        isLoading,
        openModal,
        closeModal,
    } = useParticipantsModal(
        eventId,
        {
            name: searchName || undefined,
            role: selectedRole,
            inContacts: inContacts || undefined,
        },
        50
    );
    
    // Синхронизируем состояние открытия модального окна
    useEffect(() => {
        if (isOpen) {
            openModal();
        } else {
            closeModal();
            // Сбрасываем фильтры при закрытии
            setSearchName('');
            setSelectedRoles([]);
            setInContacts(false);
        }
    }, [isOpen, openModal, closeModal]);

    const handleFilterClick = () => {
        setIsFilterMenuOpen(!isFilterMenuOpen);
    };

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [roleId] // Оставляем только одну выбранную роль
        );
    };

    const handleInContactsToggle = () => {
        setInContacts(prev => !prev);
    };

    const handleSearchChange = (value: string) => {
        setSearchName(value);
    };

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
                    <div className={styles.searchSection}>
                        <div className={styles.searchInput}>
                            <TextField
                                placeholder="введите имя"
                                leftIcon={<SearchIcon />}
                                value={searchName}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterButtonWrapper} ref={filterButtonRef}>
                            <button className={styles.filterButton} onClick={handleFilterClick}>
                                <img src={Filter} alt="Фильтр"/>
                            </button>
                            {isFilterMenuOpen && (
                                <ParticipantsFilterMenu
                                    eventId={eventId}
                                    isOpen={isFilterMenuOpen}
                                    onClose={() => setIsFilterMenuOpen(false)}
                                    selectedRoles={selectedRoles}
                                    onRoleToggle={handleRoleToggle}
                                    inContacts={inContacts}
                                    onInContactsToggle={handleInContactsToggle}
                                />
                            )}
                        </div>
                    </div>
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
                                    role={participant.role}
                                    eventId={eventId}
                                    userId={participant.id}
                                    isInContacts={participant.isContact ?? false}
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

