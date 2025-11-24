import React, {useState} from 'react';
import styles from './Select.module.scss';
import ChevronDownImg from '../../assets/img/icon-m/chevron-down.svg';
import ChevronUpImg from '../../assets/img/icon-m/chevron-up.svg';

interface Option {
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
                                   ...props
                               }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(props.value || '');

    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}

            <div className={`${styles.wrapper} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}>
                <span className={styles.iconLeft}>
        {leftIcon || <span className={styles.iconPlaceholder}/>}
    </span>

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
                alt={isOpen ? 'chevron-up' : 'chevron-down'}
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
                <ul className={styles.dropdown}>
                    {options.map((option, idx) => (
                        <li
                            key={idx}
                            className={styles.option}
                            onClick={() => {
                                setValue(option.label ?? '');
                                setIsOpen(false);
                            }}
                        >
                            <div className={styles.optionContent}>
                                {option.content ?? (
                                    <>
                                        <div className={styles.optionLabel}>{option.label}</div>
                                        {option.description && (
                                            <div className={styles.optionDescription}>{option.description}</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
