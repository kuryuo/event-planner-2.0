import {useState} from 'react';
import clsx from 'clsx';
import {Avatar, Dropdown} from 'antd';
import styles from './CardWithDropdown.module.scss';
import ChevronUpIcon from '@/assets/img/icon-m/chevron-up.svg?react';
import Menu from '../menu/Menu.tsx';

export interface CardWithDropdownProps {
    size?: 'M' | 'S';
    avatarShape?: 'circle' | 'square';
    title: string;
    subtitle: string;
    avatarUrl?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    selectOptions: Array<{label?: string; description?: string; content?: React.ReactNode; onClick?: () => void}>;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
    onSelectOpenChange?: (isOpen: boolean) => void;
    selectedValues?: string[];
    withNewRoleInput?: boolean;
    onNewRoleCreate?: (roleName: string) => void;
    disableRoleSelection?: boolean;
}

export function CardWithDropdown({
    size = 'M',
    avatarShape = 'circle',
    title,
    subtitle,
    avatarUrl,
    className,
    children,
    onClick,
    selectOptions,
    rightIcon,
    onRightIconClick,
    onSelectOpenChange,
    selectedValues = [],
    withNewRoleInput = false,
    onNewRoleCreate,
    disableRoleSelection = false,
}: CardWithDropdownProps) {
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleSelectToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newIsOpen = !isSelectOpen;
        setIsSelectOpen(newIsOpen);
        onSelectOpenChange?.(newIsOpen);
    };

    return (
        <div
            className={clsx(
                styles.wrapper,
                styles[size],
                onClick && styles.clickable,
                className,
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <Avatar
                className="ep-avatar"
                size={size === 'M' ? 48 : 36}
                shape={avatarShape}
                src={avatarUrl}
            >
                {(title?.[0] ?? "—").toUpperCase()}
            </Avatar>
            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <span className={clsx(styles.title, styles[size])}>{title}</span>
                    {subtitle ? (
                        <div className={styles.subtitleWrapper}>
                            <div className={styles.selectSubtitleWrapper}>
                                <span className={styles.subtitleText}>{subtitle}</span>
                                {!disableRoleSelection ? (
                                    <Dropdown
                                        trigger={['click']}
                                        open={isSelectOpen}
                                        onOpenChange={(next) => {
                                            setIsSelectOpen(next);
                                            onSelectOpenChange?.(next);
                                        }}
                                        placement="bottomLeft"
                                        dropdownRender={() => (
                                            <div
                                                className={styles.menuWrapper}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Menu
                                                    options={selectOptions.map((opt) => ({
                                                        label: opt.label,
                                                        description: opt.description,
                                                        content: opt.content,
                                                    }))}
                                                    onOptionClick={(_option, index) => {
                                                        selectOptions[index]?.onClick?.();
                                                        setIsSelectOpen(false);
                                                        onSelectOpenChange?.(false);
                                                    }}
                                                    withNewRoleInput={withNewRoleInput}
                                                    onNewRoleCreate={onNewRoleCreate}
                                                    selectedValues={selectedValues}
                                                />
                                            </div>
                                        )}
                                    >
                                        <button
                                            type="button"
                                            className={styles.chevronButton}
                                            onClick={handleSelectToggle}
                                            aria-label="Открыть меню"
                                        >
                                            <ChevronUpIcon
                                                className={clsx(styles.chevronIcon, isSelectOpen && styles.rotated)}
                                            />
                                        </button>
                                    </Dropdown>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </div>
                {children}
            </div>
            {rightIcon ? (
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
            ) : null}
        </div>
    );
}
