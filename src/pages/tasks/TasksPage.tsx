import Sidebar from '@/components/sidebar/Sidebar';
import {useEffect, useMemo, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useSearchParams} from 'react-router-dom';
import {ControlledBoard, moveCard, type KanbanBoard, type Card, type Column} from '@caldwell619/react-kanban';
import '@caldwell619/react-kanban/dist/styles.css';
import {
    useAddTaskCommentMutation,
    useCreateBoardColumnMutation,
    useCreateBoardTaskMutation,
    useDeleteBoardColumnMutation,
    useDeleteBoardTaskMutation,
    useGetEventBoardQuery,
    useGetMyEventsQuery,
    useGetTaskCommentsQuery,
    useGetTaskHistoryQuery,
    useMoveBoardTaskMutation,
    useUpdateBoardColumnMutation,
    useUpdateBoardTaskMutation,
} from '@/services/api/eventApi.ts';
import styles from './TasksPage.module.scss';

type BoardCard = Card & {
    id: string;
    taskId: string;
    title: string;
    description?: string;
    dueDate?: string;
};

type BoardColumn = Column<BoardCard> & {
    id: string;
    title: string;
    cards: BoardCard[];
};

const toBoard = (payload: any): KanbanBoard<BoardCard> => {
    const sourceRaw = payload?.result ?? payload ?? {};
    const source = Array.isArray(sourceRaw) ? (sourceRaw[0] ?? {}) : sourceRaw;
    const columns = source?.columns ?? source?.boardColumns ?? [];
    return {
        columns: (Array.isArray(columns) ? columns : []).map((column: any, columnIndex: number) => {
            const tasks = column?.tasks ?? column?.boardTasks ?? [];
            return {
                id: String(column?.id ?? `column-${columnIndex}`),
                title: String(column?.name ?? 'Колонка'),
                cards: (Array.isArray(tasks) ? tasks : []).map((task: any, taskIndex: number) => ({
                    id: String(task?.id ?? `task-${taskIndex}`),
                    taskId: String(task?.id ?? `task-${taskIndex}`),
                    title: String(task?.title ?? 'Новая задача'),
                    description: String(task?.description ?? ''),
                    dueDate: task?.dueDate ?? task?.deadline ?? undefined,
                })),
            };
        }),
    };
};

export default function TasksPage() {
    const [searchParams] = useSearchParams();
    const requestedEventId = searchParams.get('eventId');
    const {data: myEventsData} = useGetMyEventsQuery();
    const eventId = requestedEventId || myEventsData?.result?.[0]?.id || '';

    const {data: boardData, isLoading, refetch} = useGetEventBoardQuery(eventId, {skip: !eventId});
    const [moveTask] = useMoveBoardTaskMutation();
    const [createColumn] = useCreateBoardColumnMutation();
    const [updateColumn] = useUpdateBoardColumnMutation();
    const [deleteColumn] = useDeleteBoardColumnMutation();
    const [createTask] = useCreateBoardTaskMutation();
    const [updateTask] = useUpdateBoardTaskMutation();
    const [deleteTask] = useDeleteBoardTaskMutation();
    const [addComment, {isLoading: isSavingComment}] = useAddTaskCommentMutation();

    const hydratedBoard = useMemo(() => toBoard(boardData), [boardData]);
    const [boardState, setBoardState] = useState<KanbanBoard<BoardCard>>({columns: []});

    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [selectedTaskColumnId, setSelectedTaskColumnId] = useState('');
    const commentForm = useForm<{ commentText: string }>({defaultValues: {commentText: ''}});

    useEffect(() => {
        setBoardState(hydratedBoard);
    }, [hydratedBoard]);

    const board = boardState.columns.length ? boardState : hydratedBoard;

    const {data: comments = []} = useGetTaskCommentsQuery(
        {eventId, taskId: selectedTaskId},
        {skip: !eventId || !selectedTaskId}
    );
    const {data: history = []} = useGetTaskHistoryQuery(
        {eventId, taskId: selectedTaskId},
        {skip: !eventId || !selectedTaskId}
    );

    const handleCardSelect = (taskId: string, columnId: string) => {
        setSelectedTaskId(taskId);
        setSelectedTaskColumnId(columnId);
    };

    const handleMoveCard = async (card: BoardCard, source: any, destination: any) => {
        setBoardState((current) => moveCard(current, source, destination));
        try {
            await moveTask({
                eventId,
                taskId: card.taskId,
                targetColumnId: String(destination.toColumnId),
                newOrder: destination.toPosition,
            }).unwrap();
        } catch {
            await refetch();
        }
    };

    const handleCreateColumn = async () => {
        const name = window.prompt('Название новой колонки');
        if (!name?.trim()) return;
        await createColumn({eventId, name: name.trim()}).unwrap();
        await refetch();
    };

    const handleRenameColumn = async (column: BoardColumn) => {
        const name = window.prompt('Новое название колонки', column.title);
        if (!name?.trim()) return;
        await updateColumn({eventId, columnId: String(column.id), name: name.trim()}).unwrap();
        await refetch();
    };

    const handleDeleteColumn = async (column: BoardColumn) => {
        if (!window.confirm(`Удалить колонку "${column.title}"?`)) return;
        await deleteColumn({eventId, columnId: String(column.id)}).unwrap();
        await refetch();
    };

    const handleCreateTask = async (column: BoardColumn) => {
        const title = window.prompt('Название задачи');
        if (!title?.trim()) return;
        const description = window.prompt('Описание задачи (опционально)') ?? '';
        await createTask({
            eventId,
            columnId: String(column.id),
            title: title.trim(),
            description: description.trim() || undefined,
        }).unwrap();
        await refetch();
    };

    const handleEditTask = async () => {
        if (!selectedTaskId) return;
        const currentTask = board.columns
            .flatMap((column) => column.cards)
            .find((card) => card.taskId === selectedTaskId);
        if (!currentTask) return;

        const title = window.prompt('Название задачи', currentTask.title) ?? currentTask.title;
        const description = window.prompt('Описание задачи', currentTask.description ?? '') ?? currentTask.description ?? '';
        await updateTask({
            eventId,
            taskId: selectedTaskId,
            title: title.trim(),
            description: description.trim(),
        }).unwrap();
        await refetch();
    };

    const handleDeleteTask = async () => {
        if (!selectedTaskId) return;
        if (!window.confirm('Удалить задачу?')) return;
        await deleteTask({eventId, taskId: selectedTaskId}).unwrap();
        setSelectedTaskId('');
        setSelectedTaskColumnId('');
        await refetch();
    };

    const handleCommentSave = commentForm.handleSubmit(async ({commentText}) => {
        if (!eventId || !selectedTaskId || !commentText.trim()) return;
        await addComment({eventId, taskId: selectedTaskId, text: commentText.trim()}).unwrap();
        commentForm.reset({commentText: ''});
    });

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={5}/>
            </div>

            <div className={styles.content}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>Канбан доска</h1>
                        <p className={styles.subtitle}>Полное управление колонками и задачами</p>
                    </div>
                    <button type="button" className={styles.actionBtn} onClick={handleCreateColumn}>+ Колонка</button>
                </div>

                {isLoading ? (
                    <p className={styles.subtitle}>Загружаем доску...</p>
                ) : !eventId ? (
                    <p className={styles.subtitle}>Нет мероприятия для отображения доски</p>
                ) : (
                    <div className={styles.boardLayout}>
                        <section className={styles.boardWrap}>
                            <ControlledBoard<BoardCard>
                                renderCard={(card) => (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const parentColumn = board.columns.find((column) => column.cards.some((colCard) => colCard.taskId === card.taskId));
                                            handleCardSelect(card.taskId, String(parentColumn?.id ?? ''));
                                        }}
                                        className={styles.taskCard}
                                    >
                                        <strong>{card.title}</strong>
                                        <span>{card.description || 'Без описания'}</span>
                                    </button>
                                )}
                                renderColumnHeader={(column) => (
                                    <div className={styles.columnHeader}>
                                        <strong>{column.title}</strong>
                                        <div className={styles.columnActions}>
                                            <button type="button" onClick={() => handleCreateTask(column as BoardColumn)}>+ Задача</button>
                                            <button type="button" onClick={() => handleRenameColumn(column as BoardColumn)}>Переим.</button>
                                            <button type="button" onClick={() => handleDeleteColumn(column as BoardColumn)}>Удал.</button>
                                        </div>
                                    </div>
                                )}
                                onCardDragEnd={handleMoveCard}
                            >
                                {board}
                            </ControlledBoard>
                        </section>

                        <aside className={styles.detailsPane}>
                            <h3>Задача</h3>
                            {!selectedTaskId ? (
                                <p className={styles.subtitle}>Выберите задачу на доске</p>
                            ) : (
                                <>
                                    <div className={styles.selectedActions}>
                                        <button type="button" className={styles.actionBtn} onClick={handleEditTask}>Редактировать</button>
                                        <button type="button" className={styles.actionBtnDanger} onClick={handleDeleteTask}>Удалить</button>
                                    </div>
                                    <p className={styles.helperText}>Колонка: {selectedTaskColumnId || 'не определена'}</p>

                                    <div className={styles.section}>
                                        <h4>Комментарии</h4>
                                        <div className={styles.commentForm}>
                                            <Controller name="commentText" control={commentForm.control} render={({field}) => (
                                                <textarea
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Добавить комментарий"
                                                />
                                            )}/>
                                            <button type="button" disabled={isSavingComment} onClick={handleCommentSave}>Отправить</button>
                                        </div>
                                        <div className={styles.list}>
                                            {(comments as any[]).map((comment, index) => (
                                                <article key={comment?.id ?? index} className={styles.listItem}>
                                                    <p>{comment?.text ?? 'Без текста'}</p>
                                                    <span>{comment?.authorName ?? 'Участник'}</span>
                                                </article>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h4>История изменений</h4>
                                        <div className={styles.list}>
                                            {(history as any[]).map((item, index) => (
                                                <article key={item?.id ?? index} className={styles.listItem}>
                                                    <p>{item?.description ?? item?.action ?? 'Изменение'}</p>
                                                    <span>{item?.authorName ?? 'Система'}</span>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
