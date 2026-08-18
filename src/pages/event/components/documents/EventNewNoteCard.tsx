import {forwardRef, useState, type KeyboardEvent} from 'react';
import CheckIcon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import styles from './EventNewNoteCard.module.scss';
import {useI18n} from '@/i18n/I18nProvider';

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
    const {t} = useI18n();
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
                placeholder={t('eventPage.newNote')}
                maxLength={NOTE_MAX_LENGTH}
                rows={4}
                aria-label={t('eventPage.newNoteText')}
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
                        aria-label={t('common.actions.close')}
                        title={t('common.actions.close')}
                    >
                        <XIcon/>
                    </button>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        disabled={!canSubmit}
                        onClick={() => void submit()}
                        aria-label={t('eventPage.saveNote')}
                        title={`${t('common.actions.save')} (Ctrl+Enter)`}
                    >
                        <CheckIcon/>
                    </button>
                </div>
            </div>
        </div>
    );
});
