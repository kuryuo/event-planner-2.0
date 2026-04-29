import {useState, useMemo, useEffect} from "react";
import {Select} from "antd";
import {Avatar} from "antd";
import {useGetOrganizersQuery} from "@/services/api/userApi.ts";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import type {Organizer} from "@/types/api/User.ts";
import CloseIcon from "@/assets/img/icon-s/x.svg?react";
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
                <div style={{display: "flex", alignItems: "center", gap: 12}}>
                    <Avatar className="ep-avatar" size={36} src={buildImageUrl(organizer.avatarUrl) || undefined}>
                        {(fullName?.[0] ?? "—").toUpperCase()}
                    </Avatar>
                    <span style={{fontWeight: 650}}>{fullName}</span>
                </div>
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
                className="ep-select"
                placeholder="Выберите организатора"
                showSearch
                value={undefined}
                searchValue={inputValue}
                onSearch={(value) => setInputValue(value)}
                open={isOpen}
                onDropdownVisibleChange={onOpenChange}
                disabled={isLoading}
                options={organizerOptions.map((opt) => ({
                    value: opt.label,
                    label: opt.content ?? opt.label,
                }))}
                onSelect={(value) => {
                    handleOrganizerSelect({label: String(value)});
                    onOpenChange?.(false);
                }}
            />
            
            {selectedOrganizers.length > 0 && (
                <div className={styles.selectedOrganizers}>
                    {selectedOrganizers.map(organizer => {
                        const fullName = `${organizer.lastName || ''} ${organizer.firstName || ''} ${organizer.middleName || ''}`.trim() || 'Без имени';
                        return (
                            <div key={organizer.id} className={styles.selectedRow}>
                                <Avatar className="ep-avatar" size={36} src={buildImageUrl(organizer.avatarUrl) || undefined}>
                                    {(fullName?.[0] ?? "—").toUpperCase()}
                                </Avatar>
                                <span className={styles.selectedName}>{fullName}</span>
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => handleRemoveOrganizer(organizer.id)}
                                    aria-label="Удалить"
                                >
                                    <CloseIcon/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
