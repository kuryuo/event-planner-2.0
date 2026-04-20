import React, {useState, useRef, useEffect} from 'react';
import styles from './TextArea.module.scss';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: boolean;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function TextArea({
                                     label,
                                     error,
                                     helperText,
                                     disabled,
                                     leftIcon,
                                     rightIcon,
                                     ...props
                                 }: TextAreaProps) {
    const MAX_LENGTH = 800;
    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = useState(String(props.defaultValue ?? ''));
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const currentValue = isControlled ? String(props.value ?? '') : internalValue;

    useEffect(() => {
        if (isControlled) {
            setInternalValue(String(props.value ?? ''));
        }
    }, [isControlled, props.value]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [currentValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = e.target.value;
        if (!isControlled) {
            setInternalValue(nextValue);
        }
        props.onChange?.(e);
    };

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <div className={styles.labelWrapper}>
                    <label className={styles.label}>
                        {label}
                    </label>
                    <span className={styles.charCounter}>
                        {currentValue.length}/{MAX_LENGTH}
                    </span>
                </div>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}>
                {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    disabled={disabled}
                    value={currentValue}
                    onChange={handleChange}
                    maxLength={MAX_LENGTH}
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
