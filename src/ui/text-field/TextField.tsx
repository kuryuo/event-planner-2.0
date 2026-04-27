import React from 'react';
import {Input} from 'antd';
import styles from './TextField.module.scss';

type TextFieldSize = 'M' | 'L';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
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
    placeholder,
    className,
    ...props
}: TextFieldProps) {
    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && <label className={styles.label}>{label}</label>}

            <Input
                placeholder={placeholder}
                disabled={disabled}
                status={error ? 'error' : undefined}
                prefix={leftIcon ? <span className={styles.affix}>{leftIcon}</span> : undefined}
                suffix={rightIcon ? <span className={styles.affix}>{rightIcon}</span> : undefined}
                size={fieldSize === 'L' ? 'large' : 'middle'}
                className={`${styles.inputWrap} ${styles[`size${fieldSize.toUpperCase()}`]} ${className ?? ''}`}
                {...props}
            />

            {helperText && (
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''}`}>
                    {helperText}
                </span>
            )}
        </div>
    );
}
