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
                <label className={`${styles.label} subtitle-m`}>
                    {label}
                    {!value && !disabled && <span className={styles.requiredDot}/>}
                </label>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''}`}>
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}

                <input
                    placeholder="placeholder"
                    className={`${styles.input} body-m`}
                    disabled={disabled}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
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
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''} caption-m`}>
             {helperText}
                </span>
            )}

            {isOpen && !disabled && (
                <Menu
                    isOpen={isOpen}
                    disabled={disabled}
                    options={[
                        {
                            label: 'Option 1',
                            description: 'Описание под текстом',
                            leftIcon,
                            onClick: () => setIsOpen(false)
                        },
                        {label: 'Option 2', description: 'Описание под текстом', onClick: () => setIsOpen(false)},
                    ]}
                />
            )}
        </div>
    );
}
