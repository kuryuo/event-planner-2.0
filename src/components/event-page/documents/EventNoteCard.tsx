import {useEffect, useRef, useState, type KeyboardEvent} from 'react';
import CheckIcon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import type {EventNote} from '@/types/api/Event.ts';
import {formatNoteRelativeTime} from '@/utils/formatNoteRelativeTime.ts';
import styles from './EventNoteCard.module.scss';

const NOTE_MAX_LENGTH = 120;

export interface EventNoteCardProps {
    note: EventNote;
    canEdit: boolean;
    onSave: (text: string) => Promise<void>;
}

export const EventNoteCard = ({note, canEdit, onSave}: EventNoteCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(note.text);
    const [isSaving, setIsSaving] = useState(false);
    const originalRef = useRef(note.text);

    useEffect(() => {
        if (!isEditing) {
            setDraft(note.text);
            originalRef.current = note.text;
        }
    }, [note.text, isEditing]);

    const startEdit = () => {
        if (!canEdit || isSaving) return;
        setDraft(note.text.slice(0, NOTE_MAX_LENGTH));
        originalRef.current = note.text;
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setDraft(originalRef.current);
        setIsEditing(false);
    };

    const commitEdit = async () => {
        const next = draft.slice(0, NOTE_MAX_LENGTH).trim();
        if (!next) {
            cancelEdit();
            return;
        }
        if (next === originalRef.current.trim()) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            await onSave(next);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            cancelEdit();
        }
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void commitEdit();
        }
    };

    if (isEditing) {
        return (
            <div className={`${styles.card} ${styles.cardEditing}`} role="group" aria-label="Редактирование заметки">
                <textarea
                    className={styles.textarea}
                    value={draft}
                    disabled={isSaving}
                    maxLength={NOTE_MAX_LENGTH}
                    rows={4}
                    aria-label="Текст заметки"
                    autoFocus
                    onChange={(event) => setDraft(event.target.value.slice(0, NOTE_MAX_LENGTH))}
                    onKeyDown={handleKeyDown}
                    onClick={(event) => event.stopPropagation()}
                />
                <div className={styles.editFooter}>
                    <span className={styles.counter}>
                        {draft.length}/{NOTE_MAX_LENGTH}
                    </span>
                    <div className={styles.editActions}>
                        <button
                            type="button"
                            className={styles.iconBtn}
                            disabled={isSaving}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={cancelEdit}
                            aria-label="Отменить"
                            title="Отменить"
                        >
                            <XIcon/>
                        </button>
                        <button
                            type="button"
                            className={styles.iconBtn}
                            disabled={isSaving || !draft.trim()}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => void commitEdit()}
                            aria-label="Сохранить"
                            title="Сохранить (Ctrl+Enter)"
                        >
                            <CheckIcon/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!canEdit) {
        return (
            <div className={styles.card}>
                <p className={styles.text}>{note.text}</p>
                <span className={styles.time}>{formatNoteRelativeTime(note.createdAt)}</span>
            </div>
        );
    }

    return (
        <div
            className={`${styles.card} ${styles.cardEditable}`}
            onDoubleClick={startEdit}
            title="Двойной клик для редактирования"
        >
            <p className={styles.text}>{note.text}</p>
            <span className={styles.time}>{formatNoteRelativeTime(note.createdAt)}</span>
        </div>
    );
};
