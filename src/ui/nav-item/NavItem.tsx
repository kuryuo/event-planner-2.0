import type {ButtonHTMLAttributes, ReactNode} from 'react';
import clsx from 'clsx';
import styles from './NavItem.module.scss';

interface NavItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    label: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export default function NavItem({
                                    label,
                                    leftIcon,
                                    rightIcon,
                                    className,
                                    type = 'button',
                                    ...props
                                }: NavItemProps) {
    return (
        <button
            type={type}
            className={clsx(styles.navItem, className)}
            {...props}
        >
            <span className={styles.left}>
                <span className={styles.leftIcon}>{leftIcon}</span>
                <span className={styles.label}>{label}</span>
            </span>
            <span className={styles.rightIcon}>{rightIcon}</span>
        </button>
    );
}
