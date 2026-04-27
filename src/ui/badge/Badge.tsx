import type {CSSProperties} from 'react';
import clsx from 'clsx';
import styles from './Badge.module.scss';
import type {AppColor} from '@/const';

type BadgeVariant = 'text' | 'dot' | 'plain';
type BadgeSize = 'S' | 'M';

interface BadgeProps {
    count?: number;
    color?: AppColor;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}

const Badge = ({
    count,
    color = 'brand-green',
    variant = 'text',
    size = 'S',
    className,
}: BadgeProps) => {
    return (
        <div
            className={clsx(
                styles.badge,
                styles[`variant-${variant}`],
                variant === 'dot' && styles[`size-${size}`],
                className,
            )}
            style={
                variant === 'plain'
                    ? undefined
                    : ({['--badge-bg' as string]: `var(--bg-${color})`} as CSSProperties)
            }
        >
            {(variant === 'text' || variant === 'plain') && count}
        </div>
    );
};

export default Badge;
