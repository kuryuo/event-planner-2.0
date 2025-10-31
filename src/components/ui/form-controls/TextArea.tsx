import React, {useState, useRef, useEffect} from 'react';
import styles from './FormControls.module.scss';

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

    const [value, setValue] = useState(props.value || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value.slice(0, MAX_LENGTH);
        setValue(newValue);
        if (props.onChange) props.onChange(e);
    };

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <div className={styles.labelWrapper}>
                    <label className={`${styles.label} subtitle-m`}>
                        {label}
                        {!value && !disabled && <span className={styles.requiredDot}/>}
                    </label>
                    <span className={`${styles.charCounter} caption-m`}>
      {String(value).length}/{MAX_LENGTH}
    </span>
                </div>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''}`}>
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    disabled={disabled}
                    value={value}
                    onChange={handleChange}
                    placeholder='placeholder'
                    {...props}
                />
                {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
            </div>

            {helperText && (
                <span className={`${styles.helperText} ${error ? styles.helperTextError : ''} caption-m`}>
                    {helperText}
                </span>
            )}
        </div>
    );
}
