import {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import FileLinesIcon from '@/assets/image/file-lines.svg?react';
import {useGetEventBoardQuery} from '@/services/api/eventApi.ts';
import BoardTaskCard, {type BoardTaskCardPriority} from '@/pages/tasks/components/board-task-card/BoardTaskCard.tsx';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import styles from './EventTasksOverview.module.scss';

interface EventTasksOverviewProps {
    eventId: string;
}

interface TaskCard {
    id: string;
    title: string;
    description: string;
    assigneeName: string;
    assigneeAvatar?: string;
    dueDate?: string;
    commentsCount: number;
    priority: BoardTaskCardPriority;
    isCompleted: boolean;
}

const normalizePriority = (value?: string | null): BoardTaskCardPriority => {
    const normalized = (value ?? '').toLowerCase();
    if (normalized.includes('urgent') || normalized.includes('сроч')) return 'Срочный';
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
    const {data, isLoading} = useGetEventBoardQuery({eventId}, {
        skip: !eventId,
        refetchOnFocus: true,
        refetchOnReconnect: true,
        pollingInterval: 120000,
    });

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
                const rawAvatar = task?.assigneeAvatarUrl ?? task?.assigneeAvatar ?? null;
                flattened.push({
                    id,
                    title: task?.title || 'Название задачи',
                    description: task?.description || 'Описание отсутствует',
                    assigneeName: String(
                        task?.assigneeDisplayName
                        ?? task?.assigneeName
                        ?? task?.assignedUserName
                        ?? 'Не назначено',
                    ),
                    assigneeAvatar: buildImageUrl(rawAvatar),
                    dueDate: task?.dueDate ?? task?.deadline ?? undefined,
                    commentsCount: Number(task?.commentsCount ?? task?.commentCount ?? 0),
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
                            <BoardTaskCard
                                key={task.id}
                                title={task.title}
                                description={task.description}
                                dueDate={task.dueDate}
                                assigneeName={task.assigneeName}
                                assigneeAvatar={task.assigneeAvatar}
                                priority={task.priority}
                                commentsCount={task.commentsCount}
                            />
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
}
