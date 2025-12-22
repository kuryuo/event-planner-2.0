import React, { useState, useMemo } from 'react';
import styles from './Menu.module.scss';
import TextField from '../text-field/TextField';

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
}

export default function Menu({ options, onOptionClick, withSearch = false, searchPlaceholder = 'Поиск...' }: MenuProps) {
    const [searchQuery, setSearchQuery] = useState('');

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
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

