import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {Button as AntButton} from 'antd';
import type {ButtonProps as AntButtonProps} from 'antd';
import clsx from 'clsx';
import styles from './Button.module.scss';

type ButtonSize = 'M' | 'S' | 'XS';
type ButtonVariant = 'Filled' | 'Text';
type ButtonColor = 'purple' | 'green' | 'red' | 'gray' | 'default';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
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
    disabled,
    type: nativeType = 'button',
    ...rest
}: ButtonProps) {
    const filled = variant === 'Filled';
    const text = variant === 'Text';

    let antBtnType: AntButtonProps['type'] = 'default';
    if (text) {
        antBtnType = 'text';
    } else if (filled && (color === 'purple' || color === 'green' || color === 'red')) {
        antBtnType = 'primary';
    } else if (filled && color === 'gray') {
        antBtnType = 'default';
    }

    const danger = (filled && color === 'red') || (text && color === 'red');

    const antSize: AntButtonProps['size'] = size === 'M' ? 'middle' : 'small';

    const toneClass = clsx(
        filled && color === 'purple' && styles.antFilledPurple,
        filled && color === 'green' && styles.antFilledGreen,
        filled && color === 'gray' && styles.antFilledGray,
        text && styles.antText,
        text && color === 'default' && styles.antTextDefault,
    );

    const sizeClass = clsx(
        size === 'M' && styles.antSizeM,
        size === 'S' && styles.antSizeS,
        size === 'XS' && styles.antSizeXs,
    );

    return (
        <AntButton
            type={antBtnType}
            danger={danger}
            size={antSize}
            disabled={disabled}
            htmlType={nativeType === 'submit' || nativeType === 'reset' || nativeType === 'button' ? nativeType : 'button'}
            icon={leftIcon ?? undefined}
            className={clsx(styles.antBtn, sizeClass, toneClass, className)}
            {...(rest as Omit<AntButtonProps, 'type' | 'htmlType' | 'size' | 'danger' | 'icon' | 'children' | 'className' | 'disabled'>)}
        >
            {children}
            {rightIcon ? <span className={styles.rightSlot}>{rightIcon}</span> : null}
        </AntButton>
    );
}
