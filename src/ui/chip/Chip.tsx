import type {CSSProperties, MouseEvent} from 'react';
import clsx from 'clsx';
import {Tag} from 'antd';
import CloseImg from '@/assets/img/icon-s/x.svg?react';
import type {AppColor} from '@/const';
import styles from './Chip.module.scss';

/** Совпадает с `typography-variables.scss` (body-s / caption-m, regular). */
const CHIP_TEXT_STYLE: Record<'S' | 'M', CSSProperties> = {
    S: {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 16,
        fontWeight: 450,
        lineHeight: '22px',
    },
    M: {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14,
        fontWeight: 450,
        lineHeight: '18px',
    },
};

interface ChipProps {
    text: string;
    size?: 'S' | 'M';
    closable?: boolean;
    variant?: 'outlined' | 'filled';
    color?: AppColor;
    onClose?: (event: MouseEvent<HTMLElement>) => void;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    className?: string;
    style?: CSSProperties;
}

const Chip = ({
    text,
    size = 'M',
    closable = false,
    variant = 'outlined',
    color = 'pink',
    onClose,
    onClick,
    className,
    style,
}: ChipProps) => {
    const filledVars: CSSProperties | undefined =
        variant === 'filled'
            ? ({
                  ['--chip-bg' as string]: `var(--bg-${color})`,
                  ['--chip-color' as string]: `var(--content-${color})`,
              } as CSSProperties)
            : undefined;

    const tagStyle: CSSProperties = {
        ...CHIP_TEXT_STYLE[size],
        ...filledVars,
        ...(onClick ? {cursor: 'pointer'} : {}),
        ...style,
    };

    return (
        <Tag
            bordered={variant === 'outlined'}
            closable={closable}
            onClose={onClose}
            onClick={onClick}
            closeIcon={closable ? <CloseImg/> : undefined}
            className={clsx(
                styles.chip,
                styles[variant],
                styles[`size-${size}`],
                className,
            )}
            style={tagStyle}
        >
            <span className={styles.text}>{text}</span>
        </Tag>
    );
};

export default Chip;
