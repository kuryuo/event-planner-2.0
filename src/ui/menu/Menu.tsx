import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import {Menu as AntMenu} from 'antd';
import type {MenuProps} from 'antd';
import styles from './Menu.module.scss';
import TextField from '../text-field/TextField';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import PlusLgIcon from '@/assets/img/icon-s/plus-lg.svg?react';

export interface MenuOption {
    label?: string;
    description?: string;
    content?: React.ReactNode;
    isDivider?: boolean;
}

interface AppMenuProps {
    options: MenuOption[];
    onOptionClick?: (option: MenuOption, index: number) => void;
    withSearch?: boolean;
    searchPlaceholder?: string;
    withNewRoleInput?: boolean;
    onNewRoleCreate?: (roleName: string) => void;
    selectedValues?: string[];
    shape?: 'rounded' | 'square';
}

export default function Menu({
    options,
    onOptionClick,
    withSearch = false,
    searchPlaceholder = 'Поиск...',
    withNewRoleInput = false,
    onNewRoleCreate,
    selectedValues = [],
    shape = 'rounded',
}: AppMenuProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [newRoleName, setNewRoleName] = useState('');

    const filteredOptions = useMemo(() => {
        if (!withSearch || !searchQuery.trim()) {
            return options;
        }
        const query = searchQuery.toLowerCase().trim();
        return options.filter((option) => {
            if (option.isDivider) {
                return true;
            }
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

    const menuItems: MenuProps['items'] = useMemo(() => {
        const items: NonNullable<MenuProps['items']> = [];
        filteredOptions.forEach((option, idx) => {
            const originalIndex = options.findIndex(
                (opt) =>
                    opt === option ||
                    (opt.label === option.label && opt.description === option.description),
            );
            const resolvedIndex = originalIndex >= 0 ? originalIndex : idx;

            if (option.isDivider) {
                items.push({type: 'divider', key: `divider-${idx}`});
                return;
            }

            const isSelected = option.label ? selectedValues.includes(option.label) : false;

            items.push({
                key: String(resolvedIndex),
                label: (
                    <div className={styles.optionRow}>
                        <div className={styles.optionMain}>
                            {option.content ?? (
                                <>
                                    <div className={styles.optionLabel}>{option.label}</div>
                                    {option.description ? (
                                        <div className={styles.optionDescription}>{option.description}</div>
                                    ) : null}
                                </>
                            )}
                        </div>
                        {isSelected ? <Check2Icon className={styles.checkIcon}/> : null}
                    </div>
                ),
            });
        });
        return items;
    }, [filteredOptions, options, selectedValues]);

    return (
        <div className={clsx(styles.menuContainer, shape === 'square' && styles.square)}>
            {withSearch ? (
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
                    <div className={styles.divider}/>
                </>
            ) : null}
            {withNewRoleInput ? (
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
                                    <PlusLgIcon/>
                                </button>
                            }
                        />
                    </div>
                    <div className={styles.divider}/>
                </>
            ) : null}
            <AntMenu
                mode="vertical"
                selectable={false}
                className={styles.antMenu}
                items={menuItems}
                onClick={({key}) => {
                    const idx = Number(key);
                    if (Number.isNaN(idx)) {
                        return;
                    }
                    const opt = options[idx];
                    if (opt && !opt.isDivider) {
                        onOptionClick?.(opt, idx);
                    }
                }}
            />
        </div>
    );
}
