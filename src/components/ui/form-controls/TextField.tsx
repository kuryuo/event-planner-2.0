import React from 'react';
import styles from './FormControls.module.scss';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: boolean;
    helperText?: string;
}

export default function TextField({
                                      label,
                                      leftIcon,
                                      rightIcon,
                                      error,
                                      helperText,
                                      disabled,
                                      ...props
                                  }: TextFieldProps) {

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <label className={`${styles.label} subtitle-m`}>
                    {label}
                </label>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''}`}>
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
                <input
                    placeholder={'placeholder'}
                    className={`${styles.inpu} body-m`}
                    disabled={disabled}
                    {...props}
                />
                {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
            </div>

            {helperText && (
                <span
                    className={`${styles.helperText} ${error ? styles.helperTextError : ''} caption-m`}
                >
          {helperText}
        </span>
            )}
        </div>
    );
}
