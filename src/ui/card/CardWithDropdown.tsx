import { useState, useRef } from 'react';
import clsx from 'clsx';
import styles from './CardWithDropdown.module.scss';
import { type CardProps} from './Card.tsx';
import Avatar from '../avatar/Avatar.tsx';
import ChevronUpIcon from '@/assets/img/icon-m/chevron-up.svg?react';
import Menu from '../menu/Menu.tsx';
import { useClickOutside } from '@/hooks/ui/useClickOutside.ts';

export interface CardWithDropdownProps extends Omit<CardProps, 'subtitle'> {
    subtitle: string;
    selectOptions: Array<{ label?: string; description?: string; content?: React.ReactNode; onClick?: () => void }>;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

export function CardWithDropdown({
    size = 'M',
    title,
    subtitle,
    avatarUrl,
    className,
    children,
    onClick,
    selectOptions,
    rightIcon,
    onRightIconClick,
}: CardWithDropdownProps) {
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectButtonRef = useRef<HTMLButtonElement>(null);

    const handleSelectToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSelectOpen(!isSelectOpen);
    };

    useClickOutside(selectRef, () => {
        setIsSelectOpen(false);
    }, isSelectOpen);

    return (
        <div
            className={clsx(
                styles.wrapper,
                styles[size],
                onClick && styles.clickable,
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {avatarUrl && <Avatar size={size} avatarUrl={avatarUrl} name={title} />}
            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <span className={clsx(styles.title, styles[size])}>{title}</span>
                    {subtitle && (
                        <div className={styles.subtitleWrapper}>
                            <div className={styles.selectSubtitleWrapper} ref={selectRef}>
                                <span className={styles.subtitleText}>{subtitle}</span>
                                <button
                                    ref={selectButtonRef}
                                    className={styles.chevronButton}
                                    onClick={handleSelectToggle}
                                    aria-label="Открыть меню"
                                    type="button"
                                >
                                    <ChevronUpIcon className={clsx(styles.chevronIcon, isSelectOpen && styles.rotated)} />
                                </button>
                                {isSelectOpen && (
                                    <div className={styles.menuWrapper}>
                                        <Menu
                                            options={selectOptions.map(opt => ({
                                                label: opt.label,
                                                description: opt.description,
                                                content: opt.content,
                                            }))}
                                            onOptionClick={(option, index) => {
                                                selectOptions[index]?.onClick?.();
                                                setIsSelectOpen(false);
                                            }}
                                            withSearch={true}
                                            searchPlaceholder="Поиск..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {children}
            </div>
            {rightIcon && (
                <div
                    className={styles.rightIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRightIconClick?.();
                    }}
                    role={onRightIconClick ? 'button' : undefined}
                    aria-label={onRightIconClick ? 'Action' : undefined}
                >
                    {rightIcon}
                </div>
            )}
        </div>
    );
}
