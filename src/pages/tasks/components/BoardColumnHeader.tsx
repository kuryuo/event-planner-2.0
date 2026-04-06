import {useMemo, useRef, useState} from 'react';
import PlusIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import PenIcon from '@/assets/img/icon-m/pen.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside';
import styles from './BoardColumnHeader.module.scss';

type Props = {
    title: string;
    count: number;
    colorIndex: number;
    showActions?: boolean;
    onCreateTask?: () => void;
    onRenameColumn?: () => void;
    onDeleteColumn?: () => void;
};

const dotColors = ['#9AA4AE', '#2B7FFF', '#2F9E44', '#E67E22', '#E03131'];

export default function BoardColumnHeader({
    title,
    count,
    colorIndex,
    showActions = true,
    onCreateTask,
    onRenameColumn,
    onDeleteColumn,
}: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dotColor = useMemo(() => dotColors[colorIndex % dotColors.length], [colorIndex]);
    const menuRef = useRef<HTMLDivElement | null>(null);
    useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                <span className={styles.dot} style={{backgroundColor: dotColor}}/>
                <strong className={styles.title}>{title}</strong>
                <span className={styles.count}>{count}</span>
            </div>

            {showActions && (
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={onCreateTask}
                        title="Создать задачу"
                        aria-label="Создать задачу"
                    >
                        <PlusIcon/>
                    </button>

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
}
