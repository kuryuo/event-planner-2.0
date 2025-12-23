import React, {useState} from 'react';
import styles from './Select.module.scss';
import ChevronDownImg from '../../assets/img/icon-m/chevron-down.svg';
import Menu, { type MenuOption } from '../menu/Menu';

export interface Option {
    label?: string;
    description?: string;
    content?: React.ReactNode;
}

interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: boolean;
    helperText?: string;
    options?: Option[];
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onOptionClick?: (option: Option) => void;
}

export default function Select({
                                   label,
                                   leftIcon,
                                   rightIcon,
                                   error,
                                   helperText,
                                   disabled,
                                   options = [
                                       {label: 'Текст', description: 'Описание под текстом'},
                                       {label: 'Текст 2', description: 'Описание под текстом'},
                                   ],
                                   isOpen: controlledIsOpen,
                                   onOpenChange,
                                   onOptionClick,
                                   ...props
                               }: SelectProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [value, setValue] = useState(props.value || '');
    
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = (newIsOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newIsOpen);
        } else {
            setInternalIsOpen(newIsOpen);
        }
    };

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}>
                {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
                <input
                    placeholder="placeholder"
                    className={styles.input}
                    disabled={disabled}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    {...props}
                />
                <span
                    className={styles.rightIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) setIsOpen(!isOpen);
                    }}
                    style={{cursor: disabled ? 'not-allowed' : 'pointer'}}
                >
                    {rightIcon ?? (
                        <img
                            src={ChevronDownImg}
                            alt={isOpen ? 'chevron-up' : 'chevron-down'}
                            className={`${styles.chevronIcon} ${isOpen ? styles.expanded : ''}`}
                        />
                    )}
                </span>
            </div>

            {helperText && !isOpen && (
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''}`}>
                    {helperText}
                </span>
            )}

            {isOpen && !disabled && (
                <div className={styles.dropdownContainer}>
                    <Menu
                        options={options as MenuOption[]}
                        onOptionClick={(option) => {
                            if (onOptionClick) {
                                onOptionClick(option);
                            } else {
                                setValue(option.label ?? '');
                            }
                            setIsOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}