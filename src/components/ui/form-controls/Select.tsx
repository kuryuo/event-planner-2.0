import React, {useState} from 'react';
import styles from './FormControls.module.scss';
import ChevronDownImg from '../../../assets/img/icon-m/chevron-down.svg';
import ChevronUpImg from '../../../assets/img/icon-m/chevron-up.svg';
import {Menu} from "@/components/ui/menu/Menu.tsx";

interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: boolean;
    helperText?: string;
}

export default function Select({
                                   label,
                                   leftIcon,
                                   rightIcon,
                                   error,
                                   helperText,
                                   disabled,
                                   ...props
                               }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(props.value || '');

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {!value && !disabled && <span className={styles.requiredDot}/>}
                </label>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}>
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}

                <input
                    placeholder="placeholder"
                    className={styles.input}
                    disabled={disabled}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    {...props}
                />

                <span
                    className={styles.iconRight}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) setIsOpen(!isOpen);
                    }}
                    style={{cursor: disabled ? 'not-allowed' : 'pointer'}}
                >
                    {rightIcon ?? (
                        <img
                            src={isOpen ? ChevronUpImg : ChevronDownImg}
                            alt={isOpen ? "chevron-up" : "chevron-down"}
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
                <Menu
                    isOpen={isOpen}
                    disabled={disabled}
                    options={[
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                        {label: 'Текст', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                    ]}
                />
            )}
        </div>
    );
}
