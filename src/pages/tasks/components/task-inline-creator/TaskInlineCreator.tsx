import {useMemo, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import PersonIcon from '@/assets/img/icon-m/person.svg?react';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import {Calendar} from "antd";
import dayjs from "dayjs";
import {useClickOutside} from '@/hooks/ui/useClickOutside';
import styles from './TaskInlineCreator.module.scss';
import {Avatar} from "antd";

type Assignee = {
    id: string;
    name: string;
    avatarUrl?: string;
};

type Props = {
    users: Assignee[];
    onSubmit: (payload: { title: string; assignedUserId?: string; dueDate?: string }) => void;
    onClose: () => void;
};

export default function TaskInlineCreator({users, onSubmit, onClose}: Props) {
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const form = useForm<{ title: string; query: string; assignedUserId: string; dueDate?: Date }>({
        defaultValues: {title: '', query: '', assignedUserId: ''},
    });
    const title = form.watch('title');
    const query = form.watch('query');
    const selectedUserId = form.watch('assignedUserId');
    const dueDate = form.watch('dueDate');
    const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId) ?? null, [users, selectedUserId]);

    const usersRef = useRef<HTMLDivElement | null>(null);
    const dateRef = useRef<HTMLDivElement | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useClickOutside(usersRef, () => setIsUsersOpen(false), isUsersOpen);
    useClickOutside(dateRef, () => setIsDateOpen(false), isDateOpen);
    useClickOutside(wrapRef, onClose, true);

    const filteredUsers = useMemo(() => {
        const normalized = query.toLowerCase().trim();
        if (!normalized) return users;
        return users.filter((user) => user.name.toLowerCase().includes(normalized));
    }, [query, users]);

    const formattedDueDate = useMemo(() => {
        if (!dueDate) return 'Дата';
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(dueDate);
    }, [dueDate]);

    return (
        <div className={styles.wrap} ref={wrapRef}>
            <input
                className={styles.input}
                value={title}
                onChange={(event) => form.setValue('title', event.target.value)}
                placeholder="Задача"
            />

            <div className={styles.bottomRow}>
                <div className={styles.leftActions}>
                    <div className={styles.popupWrap} ref={usersRef}>
                        <button type="button" className={styles.iconBtn} onClick={() => setIsUsersOpen((prev) => !prev)}>
                            {selectedUser ? (
                                <Avatar className="ep-avatar" size={36} src={selectedUser.avatarUrl}>
                                    {(selectedUser.name?.[0] ?? "—").toUpperCase()}
                                </Avatar>
                            ) : (
                                <PersonIcon/>
                            )}
                        </button>

                        {isUsersOpen && (
                            <div className={styles.dropdown}>
                                <label className={styles.searchField}>
                                    <SearchIcon/>
                                    <input
                                        value={query}
                                        onChange={(event) => form.setValue('query', event.target.value)}
                                        placeholder="Поиск..."
                                    />
                                </label>
                                <div className={styles.options}>
                                    {filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            className={styles.option}
                                            onClick={() => {
                                                form.setValue('assignedUserId', user.id);
                                                setIsUsersOpen(false);
                                            }}
                                        >
                                            <span>{user.name}</span>
                                            <span className={selectedUser?.id === user.id ? styles.radioActive : styles.radio}/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.popupWrap} ref={dateRef}>
                        <button type="button" className={styles.dateBtn} onClick={() => setIsDateOpen((prev) => !prev)}>
                            <CalendarIcon/>
                            <span>{formattedDueDate}</span>
                        </button>

                        {isDateOpen && (
                            <div className={styles.dateDropdown}>
                                <Calendar
                                    fullscreen={false}
                                    value={dueDate ? dayjs(dueDate) : undefined}
                                    onSelect={(value) => {
                                        const date = value?.toDate();
                                        form.setValue('dueDate', date);
                                        if (date) setIsDateOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.submitBtn}
                    disabled={!title.trim()}
                    onClick={form.handleSubmit((values) => onSubmit({
                        title: values.title.trim(),
                        assignedUserId: values.assignedUserId || undefined,
                        dueDate: values.dueDate?.toISOString(),
                    }))}
                >
                    <Check2Icon/>
                </button>
            </div>
            {selectedUser && <div className={styles.selected}>Ответственный: {selectedUser.name}</div>}
        </div>
    );
}
