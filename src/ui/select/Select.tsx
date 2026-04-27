import React, {useMemo, useState} from 'react';
import {AutoComplete} from 'antd';
import type {AutoCompleteProps} from 'antd';
import ChevronDownImg from '../../assets/img/icon-m/chevron-down.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import styles from './Select.module.scss';
import type {Option} from './Select.types.ts';

export type {Option} from './Select.types.ts';

interface SelectProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'value' | 'onChange'> {
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: boolean;
    helperText?: string;
    options?: Option[];
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onOptionClick?: (option: Option) => void;
    selectedValues?: string[];
    shape?: 'rounded' | 'square';
    value?: string | number | readonly string[] | undefined;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export default function Select({
    label,
    leftIcon,
    rightIcon,
    error,
    helperText,
    disabled,
    shape = 'rounded',
    options = [],
    isOpen: controlledIsOpen,
    onOpenChange,
    onOptionClick,
    selectedValues = [],
    value,
    onChange,
    onFocus,
    placeholder,
    className,
    ...rest
}: SelectProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlledOpen = controlledIsOpen !== undefined;
    const open = isControlledOpen ? Boolean(controlledIsOpen) : internalOpen;

    const setOpen = (next: boolean) => {
        if (isControlledOpen) {
            onOpenChange?.(next);
        } else {
            setInternalOpen(next);
            onOpenChange?.(next);
        }
    };

    const searchText = String(value ?? '');

    const antOptions: AutoCompleteProps['options'] = useMemo(() => {
        return options
            .filter((o) => !o.isDivider)
            .map((o, idx) => {
                const key = o.label ?? `opt-${idx}`;
                const selected = o.label ? selectedValues.includes(o.label) : false;
                return {
                    value: key,
                    label: (
                        <div className={styles.optionRow}>
                            <div className={styles.optionMain}>
                                {o.content ?? (
                                    <>
                                        <div className={styles.optionLabel}>{o.label}</div>
                                        {o.description ? (
                                            <div className={styles.optionDescription}>{o.description}</div>
                                        ) : null}
                                    </>
                                )}
                            </div>
                            {selected ? <Check2Icon className={styles.checkIcon}/> : null}
                        </div>
                    ),
                };
            });
    }, [options, selectedValues]);

    const handleSearch = (text: string) => {
        onChange?.({target: {value: text}} as React.ChangeEvent<HTMLInputElement>);
        if (text && options.length > 0) {
            setOpen(true);
        }
    };

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label ? <div className={styles.label}>{label}</div> : null}

            <div
                className={`${styles.wrapper} ${shape === 'square' ? styles.square : ''} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
            >
                <AutoComplete
                    className={`${styles.autocomplete} ${className ?? ''}`}
                    disabled={disabled}
                    value={searchText}
                    options={antOptions}
                    open={open && !disabled && options.length > 0}
                    onOpenChange={(next) => {
                        if (disabled) {
                            return;
                        }
                        setOpen(next);
                    }}
                    onSearch={handleSearch}
                    onSelect={(selectedValue) => {
                        const opt = options.find((o) => o.label === selectedValue);
                        if (opt) {
                            onOptionClick?.(opt);
                        }
                        setOpen(false);
                    }}
                    onFocus={(e) => {
                        if (options.length > 0) {
                            setOpen(true);
                        }
                        onFocus?.(e as React.FocusEvent<HTMLInputElement>);
                    }}
                    placeholder={placeholder as string | undefined}
                    popupClassName={styles.autocompletePopup}
                    listHeight={200}
                    notFoundContent={null}
                    prefix={leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : undefined}
                    {...(rest as AutoCompleteProps)}
                    suffixIcon={
                        <span
                            className={styles.rightIcon}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                if (!disabled) {
                                    setOpen(!open);
                                }
                            }}
                            style={{cursor: disabled ? 'not-allowed' : 'pointer'}}
                        >
                            {rightIcon ?? (
                                <ChevronDownImg className={`${styles.chevronIcon} ${open ? styles.expanded : ''}`}/>
                            )}
                        </span>
                    }
                />
            </div>

            {helperText && !open ? (
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''}`}>
                    {helperText}
                </span>
            ) : null}
        </div>
    );
}
