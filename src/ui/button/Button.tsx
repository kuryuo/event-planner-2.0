import type {ButtonHTMLAttributes, ReactNode} from 'react';
import styles from './Button.module.scss';
import clsx from 'clsx';

type ButtonSize = 'M' | 'S' | 'XS';
type ButtonVariant = 'Filled' | 'Text';
type ButtonColor = 'purple' | 'red' | 'gray' | 'default';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: ButtonSize;
    variant?: ButtonVariant;
    color?: ButtonColor;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
}

export default function Button({
                                   size = 'M',
                                   variant = 'Filled',
                                   color = 'purple',
                                   leftIcon,
                                   rightIcon,
                                   children,
                                   className,
                                   ...props
                               }: ButtonProps) {
    const buttonClass = clsx(
        styles.button,
        styles[size],
        styles[variant],
        styles[`${variant}-${color}`],
        className
    );

    return (
        <button className={buttonClass} {...props}>
            {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
            <span className={styles.content}>{children}</span>
            {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </button>
    );
}
