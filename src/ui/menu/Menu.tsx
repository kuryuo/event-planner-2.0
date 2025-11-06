import React from 'react';
import styles from './Menu.module.scss';

interface MenuProps {
    options: {
        label: string;
        description?: string;
        leftIcon?: React.ReactNode;
        rightIcon?: React.ReactNode;
        onClick?: () => void;
    }[];
    isOpen: boolean;
    disabled?: boolean;
    className?: string;
}

export function Menu({options, isOpen, disabled, className}: MenuProps) {
    if (!isOpen || disabled) return null;

    return (
        <ul className={`${styles.dropdown} ${className ?? ''}`}>
            {options.map((option, idx) => (
                <li key={idx} className={styles.option} onClick={option.onClick}>
                    {option.leftIcon && <span className={styles.iconLeft}>{option.leftIcon}</span>}
                    <div className={styles.optionContent}>
                        <div className={styles.optionLabel}>{option.label}</div>
                        {option.description && (
                            <div className={styles.optionDescription}>{option.description}</div>
                        )}
                    </div>
                    {option.rightIcon && <span className={styles.iconRight}>{option.rightIcon}</span>}
                </li>
            ))}
        </ul>
    );
}
