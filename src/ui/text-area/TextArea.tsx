import React, {useEffect, useRef, useState} from 'react';
import {Input} from 'antd';
import styles from './TextArea.module.scss';

const {TextArea: AntTextArea} = Input;

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: boolean;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const MAX_LENGTH = 800;

export default function TextArea({
    label,
    error,
    helperText,
    disabled,
    leftIcon,
    rightIcon,
    value,
    defaultValue,
    onChange,
    className,
    ...props
}: TextAreaProps) {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(String(defaultValue ?? ''));
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const currentValue = isControlled ? String(value ?? '') : internalValue;

    useEffect(() => {
        if (isControlled) {
            setInternalValue(String(value ?? ''));
        }
    }, [isControlled, value]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) {
            return;
        }
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [currentValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = e.target.value;
        if (!isControlled) {
            setInternalValue(nextValue);
        }
        onChange?.(e);
    };

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <div className={styles.labelWrapper}>
                    <label className={styles.label}>{label}</label>
                    <span className={styles.charCounter}>
                        {currentValue.length}/{MAX_LENGTH}
                    </span>
                </div>
            )}

            <div className={`${styles.field} ${error ? styles.error : ''} ${disabled ? styles.fieldDisabled : ''}`}>
                {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
                <AntTextArea
                    ref={(instance) => {
                        const ta = instance?.resizableTextArea?.textArea;
                        (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = ta ?? null;
                    }}
                    className={`${styles.textarea} ${className ?? ''}`}
                    disabled={disabled}
                    value={currentValue}
                    onChange={handleChange}
                    maxLength={MAX_LENGTH}
                    status={error ? 'error' : undefined}
                    autoSize={{minRows: 1}}
                    {...props}
                />
                {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
            </div>

            {helperText && (
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''}`}>
                    {helperText}
                </span>
            )}
        </div>
    );
}
