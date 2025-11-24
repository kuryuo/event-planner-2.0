import React from 'react';
import styles from './TextField.module.scss';

type TextFieldSize = 'M' | 'L';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: boolean;
    helperText?: string;
    fieldSize?: TextFieldSize;
}

export default function TextField({
                                      label,
                                      leftIcon,
                                      rightIcon,
                                      error,
                                      helperText,
                                      disabled,
                                      fieldSize = 'M',
                                      placeholder = 'placeholder',
                                      ...props
                                  }: TextFieldProps) {
    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && <label className={styles.label}>{label}</label>}

            <div
                className={`
                    ${styles.wrapper}
                    ${styles[`size${fieldSize.toUpperCase()}`]}
                    ${error ? styles.error : ''}
                    ${disabled ? styles.disabled : ''}
                `}
            >
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}

                <input
                    placeholder={placeholder}
                    className={`${styles.input} ${styles[`input${fieldSize.toUpperCase()}`]}`}
                    disabled={disabled}
                    {...props}
                />

                {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
            </div>

            {helperText && (
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''}`}>
                    {helperText}
                </span>
            )}
        </div>
    );
}
