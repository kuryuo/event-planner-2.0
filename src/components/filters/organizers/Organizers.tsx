import {useState, useMemo, useEffect} from "react";
import Select from "@/ui/select/Select.tsx";
import {Card} from "@/ui/card/Card.tsx";
import {useGetOrganizersQuery} from "@/services/api/userApi.ts";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import type {Organizer} from "@/types/api/User.ts";
import CloseIcon from "@/assets/img/icon-s/x.svg";
import styles from "./Organizers.module.scss";

interface OrganizersProps {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onSelectedChange?: (organizers: Organizer[]) => void;
    initialOrganizers?: Organizer[];
}

export default function Organizers({isOpen, onOpenChange, onSelectedChange, initialOrganizers}: OrganizersProps = {}) {
    const [inputValue, setInputValue] = useState("");
    const [selectedOrganizers, setSelectedOrganizers] = useState<Organizer[]>(initialOrganizers || []);
    const {data: organizersData, isLoading} = useGetOrganizersQuery();

    const availableOrganizers = useMemo(() => {
        if (!organizersData) return [];
        return organizersData.filter(organizer => 
            !selectedOrganizers.some(selected => selected.id === organizer.id)
        );
    }, [organizersData, selectedOrganizers]);

    const organizerOptions = availableOrganizers.map(organizer => {
        const fullName = `${organizer.lastName || ''} ${organizer.firstName || ''} ${organizer.middleName || ''}`.trim() || 'Без имени';
        return {
            label: fullName,
            description: organizer.city || undefined,
            content: (
                <Card
                    title={fullName}
                    avatarUrl={buildImageUrl(organizer.avatarUrl) || ''}
                    size="S"
                />
            ),
        };
    });

    const labelToOrganizerMap = useMemo(() => {
        const map = new Map<string, Organizer>();
        if (organizersData) {
            organizersData.forEach(organizer => {
                const fullName = `${organizer.lastName || ''} ${organizer.firstName || ''} ${organizer.middleName || ''}`.trim() || 'Без имени';
                map.set(fullName, organizer);
            });
        }
        return map;
    }, [organizersData]);

    const handleOrganizerSelect = (option: {label?: string}) => {
        if (option.label) {
            const organizer = labelToOrganizerMap.get(option.label);
            if (organizer && !selectedOrganizers.some(selected => selected.id === organizer.id)) {
                const newOrganizers = [...selectedOrganizers, organizer];
                setSelectedOrganizers(newOrganizers);
                onSelectedChange?.(newOrganizers);
                setInputValue('');
            }
        }
    };

    const handleRemoveOrganizer = (organizerId: string) => {
        const newOrganizers = selectedOrganizers.filter(org => org.id !== organizerId);
        setSelectedOrganizers(newOrganizers);
        onSelectedChange?.(newOrganizers);
    };

    useEffect(() => {
        if (initialOrganizers) {
            setSelectedOrganizers(initialOrganizers);
        }
    }, [initialOrganizers]);

    return (
        <div>
            <Select
                label="Организаторы"
                placeholder="Выберите организатора"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                disabled={isLoading}
                options={organizerOptions}
                onOptionClick={handleOrganizerSelect}
            />
            
            {selectedOrganizers.length > 0 && (
                <div className={styles.selectedOrganizers}>
                    {selectedOrganizers.map(organizer => {
                        const fullName = `${organizer.lastName || ''} ${organizer.firstName || ''} ${organizer.middleName || ''}`.trim() || 'Без имени';
                        return (
                            <Card
                                key={organizer.id}
                                title={fullName}
                                avatarUrl={buildImageUrl(organizer.avatarUrl) || ''}
                                size="S"
                                rightIcon={<img src={CloseIcon} alt="Удалить"/>}
                                onRightIconClick={() => handleRemoveOrganizer(organizer.id)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
