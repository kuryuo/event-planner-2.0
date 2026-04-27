import {forwardRef, useState, type KeyboardEvent} from 'react';
import CheckIcon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import styles from './EventNewNoteCard.module.scss';

const NOTE_MAX_LENGTH = 120;

export interface EventNewNoteCardProps {
    isSubmitting?: boolean;
    onSubmit: (text: string) => Promise<void>;
    onClose?: () => void;
}

export const EventNewNoteCard = forwardRef<HTMLTextAreaElement, EventNewNoteCardProps>(function EventNewNoteCard(
    {isSubmitting = false, onSubmit, onClose},
    ref
) {
    const [draft, setDraft] = useState('');

    const trimmed = draft.trim();
    const canSubmit = trimmed.length > 0 && !isSubmitting;

    const dismiss = () => {
        setDraft('');
        onClose?.();
    };

    const submit = async () => {
        if (!canSubmit) return;
        await onSubmit(trimmed);
        setDraft('');
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void submit();
        }
    };

    return (
        <div className={styles.card}>
            <textarea
                ref={ref}
                className={styles.textarea}
                value={draft}
                disabled={isSubmitting}
                placeholder="Новая заметка..."
                maxLength={NOTE_MAX_LENGTH}
                rows={4}
                aria-label="Текст новой заметки"
                onChange={(event) => setDraft(event.target.value.slice(0, NOTE_MAX_LENGTH))}
                onKeyDown={handleKeyDown}
            />
            <div className={styles.footer}>
                <span className={styles.counter}>
                    {draft.length}/{NOTE_MAX_LENGTH}
                </span>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        disabled={isSubmitting}
                        onClick={dismiss}
                        aria-label="Закрыть"
                        title="Закрыть"
                    >
                        <XIcon/>
                    </button>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        disabled={!canSubmit}
                        onClick={() => void submit()}
                        aria-label="Сохранить заметку"
                        title="Сохранить (Ctrl+Enter)"
                    >
                        <CheckIcon/>
                    </button>
                </div>
            </div>
        </div>
    );
});
