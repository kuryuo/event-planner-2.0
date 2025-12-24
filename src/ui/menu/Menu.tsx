import React, { useState, useMemo } from 'react';
import styles from './Menu.module.scss';
import TextField from '../text-field/TextField';
import Check2Icon from '@/assets/img/icon-m/check2.svg';
import PlusLgIcon from '@/assets/img/icon-s/plus-lg.svg?react';

export interface MenuOption {
    label?: string;
    description?: string;
    content?: React.ReactNode;
    isDivider?: boolean;
}

interface MenuProps {
    options: MenuOption[];
    onOptionClick?: (option: MenuOption, index: number) => void;
    withSearch?: boolean;
    searchPlaceholder?: string;
    withNewRoleInput?: boolean;
    onNewRoleCreate?: (roleName: string) => void;
    selectedValues?: string[];
}

export default function Menu({ 
    options, 
    onOptionClick, 
    withSearch = false, 
    searchPlaceholder = 'Поиск...', 
    withNewRoleInput = false,
    onNewRoleCreate,
    selectedValues = [] 
}: MenuProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [newRoleName, setNewRoleName] = useState('');

    const filteredOptions = useMemo(() => {
        if (!withSearch || !searchQuery.trim()) {
            return options;
        }
        const query = searchQuery.toLowerCase().trim();
        return options.filter(option => {
            if (option.isDivider) return true;
            const labelMatch = option.label?.toLowerCase().includes(query);
            const descriptionMatch = option.description?.toLowerCase().includes(query);
            return labelMatch || descriptionMatch;
        });
    }, [options, searchQuery, withSearch]);

    const handleNewRoleCreate = () => {
        const trimmed = newRoleName.trim();
        if (trimmed && onNewRoleCreate) {
            onNewRoleCreate(trimmed);
            setNewRoleName('');
        }
    };

    const handleNewRoleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNewRoleCreate();
        }
    };

    return (
        <div className={styles.menuContainer}>
            {withSearch && (
                <>
                    <div className={styles.searchWrapper}>
                        <TextField
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className={styles.divider} />
                </>
            )}
            {withNewRoleInput && (
                <>
                    <div className={styles.newRoleWrapper}>
                        <TextField
                            placeholder="новая роль"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            onKeyDown={handleNewRoleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNewRoleCreate();
                                    }}
                                    className={styles.plusButton}
                                >
                                    <PlusLgIcon />
                                </button>
                            }
                        />
                    </div>
                    <div className={styles.divider} />
                </>
            )}
            <ul className={styles.dropdown}>
                {filteredOptions.map((option, idx) => {
                    const originalIndex = options.findIndex(opt => 
                        opt === option || 
                        (opt.label === option.label && opt.description === option.description)
                    );

                    if (option.isDivider) {
                        return (
                            <li
                                key={`divider-${idx}`}
                                className={styles.dividerItem}
                                onClick={(e) => e.stopPropagation()}
                            />
                        );
                    }

                    const isSelected = option.label ? selectedValues.includes(option.label) : false;

                    return (
                        <li
                            key={originalIndex >= 0 ? originalIndex : idx}
                            className={styles.option}
                            onClick={() => {
                                onOptionClick?.(option, originalIndex >= 0 ? originalIndex : idx);
                            }}
                        >
                            <div className={styles.optionContent}>
                                {option.content ?? (
                                    <>
                                        <div className={styles.optionLabel}>{option.label}</div>
                                        {option.description && (
                                            <div className={styles.optionDescription}>{option.description}</div>
                                        )}
                                    </>
                                )}
                            </div>
                            {isSelected && (
                                <img src={Check2Icon} alt="Выбрано" className={styles.checkIcon} />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

