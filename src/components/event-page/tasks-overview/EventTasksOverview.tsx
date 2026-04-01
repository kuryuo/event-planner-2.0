import {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import FileLinesIcon from '@/assets/image/file-lines.svg?react';
import {useGetEventBoardQuery} from '@/services/api/eventApi.ts';
import styles from './EventTasksOverview.module.scss';

interface EventTasksOverviewProps {
    eventId: string;
}

interface TaskCard {
    id: string;
    title: string;
    description: string;
    assignee: string;
    commentsCount: number;
    dueDateLabel: string;
    priority: string;
    isCompleted: boolean;
}

const formatDueDate = (value?: string | null): string => {
    if (!value) return 'Без срока';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Без срока';

    const day = parsed.getDate();
    const month = parsed.toLocaleString('ru-RU', {month: 'short'}).replace('.', '');
    return `До ${day} ${month}`;
};

const normalizePriority = (value?: string | null): string => {
    if (!value) return 'Средний';

    const normalized = value.toLowerCase();
    if (normalized.includes('high') || normalized.includes('выс')) return 'Высокий';
    if (normalized.includes('low') || normalized.includes('низ')) return 'Низкий';
    return 'Средний';
};

const isDoneColumn = (name?: string | null): boolean => {
    const normalized = (name ?? '').toLowerCase();
    return normalized.includes('done')
        || normalized.includes('готов')
        || normalized.includes('заверш')
        || normalized.includes('выполн');
};

export default function EventTasksOverview({eventId}: EventTasksOverviewProps) {
    const navigate = useNavigate();
    const {data, isLoading} = useGetEventBoardQuery(eventId, {skip: !eventId});

    const tasks = useMemo(() => {
        const payloadRaw = data?.result ?? data;
        const payload = Array.isArray(payloadRaw) ? (payloadRaw[0] ?? {}) : payloadRaw;
        const columns = payload?.columns ?? payload?.boardColumns ?? [];
        if (!Array.isArray(columns)) return [] as TaskCard[];

        const flattened: TaskCard[] = [];

        columns.forEach((column) => {
            const columnTasks = column?.tasks ?? column?.boardTasks ?? [];
            if (!Array.isArray(columnTasks)) return;

            columnTasks.forEach((task) => {
                const id = String(task?.id ?? Math.random());
                flattened.push({
                    id,
                    title: task?.title || 'Название задачи',
                    description: task?.description || 'Описание отсутствует',
                    assignee: task?.assigneeName || task?.assignedUserName || 'Не назначено',
                    commentsCount: Number(task?.commentsCount ?? task?.commentCount ?? 0),
                    dueDateLabel: formatDueDate(task?.dueDate ?? task?.deadline),
                    priority: normalizePriority(task?.priority),
                    isCompleted: isDoneColumn(column?.name),
                });
            });
        });

        return flattened;
    }, [data]);

    const totalCount = tasks.length;
    const completedCount = tasks.filter((task) => task.isCompleted).length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const visibleTasks = tasks.slice(0, 4);

    return (
        <aside className={styles.panel}>
            <div className={styles.headerRow}>
                <h3 className={styles.title}>Задачи</h3>
                {totalCount > 0 && (
                    <button className={styles.linkButton} onClick={() => navigate(`/tasks?eventId=${eventId}`)} type="button">
                        Смотреть все
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className={styles.emptyState}>Загрузка задач...</div>
            ) : totalCount === 0 ? (
                <div className={styles.emptyState}>
                    <FileLinesIcon className={styles.emptyIcon}/>
                    <p className={styles.emptyText}>Пока нет задач</p>
                    <button className={styles.boardButton} type="button" onClick={() => navigate(`/tasks?eventId=${eventId}`)}>
                        Перейти на доску
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.progressBlock}>
                        <div className={styles.progressHeader}>
                            <span>Выполнено</span>
                            <span>{completedCount}/{totalCount}</span>
                        </div>
                        <div className={styles.progressTrack}>
                            <div className={styles.progressFill} style={{width: `${progress}%`}}/>
                        </div>
                    </div>

                    <div className={styles.tasksList}>
                        {visibleTasks.map((task) => (
                            <article key={task.id} className={styles.taskCard}>
                                <span className={styles.priorityChip}>{task.priority}</span>
                                <h4 className={styles.taskTitle}>{task.title}</h4>
                                <p className={styles.taskDescription}>{task.description}</p>
                                <div className={styles.taskMeta}>
                                    <span className={styles.assignee}>{task.assignee}</span>
                                    <span className={styles.comments}>💬 {task.commentsCount}</span>
                                    <span className={styles.deadline}>{task.dueDateLabel}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
}
