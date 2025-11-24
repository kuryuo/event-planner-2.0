import type {ButtonHTMLAttributes, ReactNode} from 'react';
import styles from './Button.module.scss';
import clsx from 'clsx';

type ButtonSize = 'M' | 'S' | 'XS';
type ButtonVariant = 'Filled' | 'Dense' | 'Text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: ButtonSize;
    variant?: ButtonVariant;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
}

export default function Button({
                                   size = 'M',
                                   variant = 'Filled',
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
        className
    );

    return (
        <button className={buttonClass} {...props}>
            <span className={styles.iconLeft}>
        {leftIcon || <span className={styles.iconPlaceholder}/>}
    </span>
            <span className={styles.content}>{children}</span>
            <span className={styles.iconRight}>
        {rightIcon || <span className={styles.iconPlaceholder}/>}
    </span>
        </button>
    );
}
