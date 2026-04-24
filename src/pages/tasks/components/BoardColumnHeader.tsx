import {useEffect, useMemo, useRef, useState, type KeyboardEvent} from 'react';
import PlusIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import PenIcon from '@/assets/img/icon-m/pen.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside';
import styles from './BoardColumnHeader.module.scss';

export type BoardColumnInlineTitleMode = 'none' | 'initial' | 'rename';

type Props = {
    title: string;
    count: number;
    colorIndex: number;
    showActions?: boolean;
    onCreateTask?: () => void;
    onRenameColumn?: () => void;
    onDeleteColumn?: () => void;
    /** Режим ввода названия в шапке колонки */
    inlineTitleMode?: BoardColumnInlineTitleMode;
    canEditTitleInline?: boolean;
    onCommitInlineTitle?: (name: string) => void | Promise<void>;
    onCancelInlineRename?: () => void;
    /** Отмена только что созданной колонки (пустое имя: Escape, blur, Enter) */
    onCancelInitialColumnCreate?: () => void;
};

const dotColors = ['#9AA4AE', '#2B7FFF', '#2F9E44', '#E67E22', '#E03131'];

const BoardColumnHeader = ({
    title,
    count,
    colorIndex,
    showActions = true,
    onCreateTask,
    onRenameColumn,
    onDeleteColumn,
    inlineTitleMode = 'none',
    canEditTitleInline = false,
    onCommitInlineTitle,
    onCancelInlineRename,
    onCancelInitialColumnCreate,
}: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const titleInputRef = useRef<HTMLInputElement | null>(null);
    const dotColor = useMemo(() => dotColors[colorIndex % dotColors.length], [colorIndex]);
    const menuRef = useRef<HTMLDivElement | null>(null);
    useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

    const isInlineEditing = inlineTitleMode === 'initial' || inlineTitleMode === 'rename';

    useEffect(() => {
        if (inlineTitleMode === 'initial') {
            setDraft('');
        } else if (inlineTitleMode === 'rename') {
            setDraft(title);
        }
    }, [inlineTitleMode, title]);

    useEffect(() => {
        if (inlineTitleMode === 'none') return;
        const node = titleInputRef.current;
        if (!node) return;
        node.focus();
        if (inlineTitleMode === 'rename') {
            node.select();
        }
    }, [inlineTitleMode]);

    const displayTitle = title.trim() || '\u200b';

    const handleDraftChange = (value: string) => {
        setDraft(value);
    };

    const handleTitleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (inlineTitleMode === 'rename') {
                onCancelInlineRename?.();
            } else if (inlineTitleMode === 'initial') {
                onCancelInitialColumnCreate?.();
            }
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            await onCommitInlineTitle?.(draft);
        }
    };

    const handleTitleBlur = () => {
        if (inlineTitleMode === 'initial') {
            const trimmed = draft.trim();
            if (!trimmed) {
                onCancelInitialColumnCreate?.();
                return;
            }
            void onCommitInlineTitle?.(draft);
            return;
        }
        if (inlineTitleMode !== 'rename') return;
        const trimmed = draft.trim();
        if (!trimmed) {
            onCancelInlineRename?.();
            return;
        }
        if (trimmed === title.trim()) {
            onCancelInlineRename?.();
            return;
        }
        void onCommitInlineTitle?.(draft);
    };

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                <span className={styles.dot} style={{backgroundColor: dotColor}}/>
                {isInlineEditing ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        className={styles.titleInput}
                        value={draft}
                        onChange={(event) => handleDraftChange(event.target.value)}
                        onKeyDown={(event) => void handleTitleKeyDown(event)}
                        onBlur={handleTitleBlur}
                        placeholder="Название колонки"
                        aria-label="Название колонки"
                    />
                ) : (
                    <strong
                        className={`${styles.title} ${canEditTitleInline ? styles.titleEditable : ''}`}
                        onDoubleClick={(event) => {
                            if (!canEditTitleInline) return;
                            event.stopPropagation();
                            onRenameColumn?.();
                        }}
                    >
                        {displayTitle}
                    </strong>
                )}
                <span className={styles.count}>{count}</span>
            </div>

            {showActions && (
                <div className={styles.actions}>
                    {onCreateTask && (
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={onCreateTask}
                            title="Создать задачу"
                            aria-label="Создать задачу"
                        >
                            <PlusIcon/>
                        </button>
                    )}

                    <div className={styles.menuWrap} ref={menuRef}>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            title="Действия колонки"
                            aria-label="Действия колонки"
                        >
                            <ThreeDotsVerticalIcon/>
                        </button>

                        {isMenuOpen && (
                            <div className={styles.menu}>
                                <button
                                    type="button"
                                    className={styles.menuItem}
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onRenameColumn?.();
                                    }}
                                >
                                    <PenIcon/>
                                    <span>Переименовать</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.menuItem} ${styles.danger}`}
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDeleteColumn?.();
                                    }}
                                >
                                    <TrashIcon/>
                                    <span>Удалить</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardColumnHeader;
