import {useMemo, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import type {DateRange} from 'react-day-picker';
import PersonIcon from '@/assets/img/icon-m/person.svg?react';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import {DatePicker} from '@/ui/date-picker/DatePicker';
import {useClickOutside} from '@/hooks/ui/useClickOutside';
import styles from './TaskInlineCreator.module.scss';

type Assignee = {
    id: string;
    name: string;
};

type Props = {
    users: Assignee[];
    onSubmit: (payload: { title: string; assignedUserId?: string; dueDate?: string }) => void;
    onClose: () => void;
};

export default function TaskInlineCreator({users, onSubmit, onClose}: Props) {
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const form = useForm<{ title: string; query: string; assignedUserId: string; dateRange?: DateRange }>({
        defaultValues: {title: '', query: '', assignedUserId: ''},
    });
    const title = form.watch('title');
    const query = form.watch('query');
    const selectedUserId = form.watch('assignedUserId');
    const dateRange = form.watch('dateRange');
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
                            <PersonIcon/>
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
                        <button type="button" className={styles.iconBtn} onClick={() => setIsDateOpen((prev) => !prev)}>
                            <CalendarIcon/>
                        </button>

                        {isDateOpen && (
                            <div className={styles.dateDropdown}>
                                <DatePicker initialRange={dateRange} onRangeChange={(range) => form.setValue('dateRange', range)}/>
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
                        dueDate: (values.dateRange?.to ?? values.dateRange?.from)?.toISOString(),
                    }))}
                >
                    <Check2Icon/>
                </button>
            </div>
            {selectedUser && <div className={styles.selected}>Ответственный: {selectedUser.name}</div>}
        </div>
    );
}
