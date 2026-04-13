import {useMemo, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
    useCreateEventNoteMutation,
    useDeleteEventAttachmentMutation,
    useGetEventAttachmentsQuery,
    useGetEventAttachmentsFacetsQuery,
    useGetEventNotesQuery,
    useLazyDownloadEventAttachmentQuery,
    useUpdateEventNoteMutation,
    useUploadEventAttachmentFileMutation,
    useUploadEventAttachmentLinkMutation,
} from '@/services/api/eventApi.ts';
import type {EventAttachment, EventNote} from '@/types/api/Event.ts';
import TextField from '@/ui/text-field/TextField.tsx';
import TextArea from '@/ui/text-area/TextArea.tsx';
import Button from '@/ui/button/Button.tsx';
import styles from './EventDocumentsTab.module.scss';

interface EventDocumentsTabProps {
    eventId: string;
}

const getAttachmentLabel = (attachment: EventAttachment): string => {
    return attachment.title || attachment.fileName || attachment.url || 'Вложение';
};

const getAttachmentLink = (attachment: EventAttachment): string | null => {
    return attachment.url ?? attachment.filePath ?? null;
};

const getNotes = (rawNotes: EventNote[]): EventNote[] => {
    if (!Array.isArray(rawNotes)) return [];
    return rawNotes.map((note, index) => ({
        id: String(note?.id ?? `note-${index}`),
        text: note?.text ?? '',
        createdAt: note?.createdAt ?? null,
        updatedAt: note?.updatedAt ?? null,
    }));
};

export default function EventDocumentsTab({eventId}: EventDocumentsTabProps) {
    const filterForm = useForm<{
        searchValue: string;
        kindFile: boolean;
        kindLink: boolean;
        selectedAuthorIds: string[];
        selectedExtensions: string[];
        selectedLinkSites: string[];
        sort: 'Newest' | 'Oldest' | 'TitleAsc' | 'AuthorAsc';
    }>({
        defaultValues: {
            searchValue: '',
            kindFile: false,
            kindLink: false,
            selectedAuthorIds: [],
            selectedExtensions: [],
            selectedLinkSites: [],
            sort: 'Newest',
        },
    });
    const searchValue = filterForm.watch('searchValue');
    const kindFile = filterForm.watch('kindFile');
    const kindLink = filterForm.watch('kindLink');
    const selectedAuthorIds = filterForm.watch('selectedAuthorIds');
    const selectedExtensions = filterForm.watch('selectedExtensions');
    const selectedLinkSites = filterForm.watch('selectedLinkSites');
    const sort = filterForm.watch('sort');

    const {data: attachments = [], isLoading: isAttachmentsLoading} = useGetEventAttachmentsQuery({
        eventId,
        q: searchValue.trim() || undefined,
        kinds: [kindFile && 'File', kindLink && 'Link'].filter(Boolean).join(',') || undefined,
        authorIds: selectedAuthorIds.length ? selectedAuthorIds.join(',') : undefined,
        extensions: selectedExtensions.length ? selectedExtensions.join(',') : undefined,
        linkSites: selectedLinkSites.length ? selectedLinkSites.join(',') : undefined,
        sort,
    }, {skip: !eventId});
    const {data: attachmentFacets} = useGetEventAttachmentsFacetsQuery(eventId, {skip: !eventId});
    const {data: notesRaw = [], isLoading: isNotesLoading} = useGetEventNotesQuery(eventId, {skip: !eventId});

    const [uploadFile, {isLoading: isUploadingFile}] = useUploadEventAttachmentFileMutation();
    const [uploadLink, {isLoading: isUploadingLink}] = useUploadEventAttachmentLinkMutation();
    const [deleteAttachment, {isLoading: isDeletingAttachment}] = useDeleteEventAttachmentMutation();
    const [downloadAttachment] = useLazyDownloadEventAttachmentQuery();
    const [createNote, {isLoading: isCreatingNote}] = useCreateEventNoteMutation();
    const [updateNote, {isLoading: isUpdatingNote}] = useUpdateEventNoteMutation();

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    const linkForm = useForm<{ linkTitle: string; linkUrl: string }>({defaultValues: {linkTitle: '', linkUrl: ''}});
    const noteForm = useForm<{ newNoteText: string }>({defaultValues: {newNoteText: ''}});
    const editNoteForm = useForm<{ editingText: string }>({defaultValues: {editingText: ''}});

    const notes = useMemo(() => getNotes(notesRaw), [notesRaw]);
    const fileExtensions = attachmentFacets?.result?.fileExtensions ?? [];
    const linkSites = attachmentFacets?.result?.linkSites ?? [];
    const authors = attachmentFacets?.result?.authors ?? [];

    const handleFileUpload = async (file: File | null) => {
        if (!file || !eventId) return;
        await uploadFile({eventId, file});
    };

    const handleAddLink = linkForm.handleSubmit(async ({linkTitle, linkUrl}) => {
        if (!eventId || !linkUrl.trim()) return;
        await uploadLink({eventId, title: linkTitle.trim(), url: linkUrl.trim()});
        linkForm.reset();
    });

    const handleDownload = async (attachmentId: string, fileName: string) => {
        const result = await downloadAttachment({eventId, attachmentId});
        if (!('data' in result) || !result.data) return;
        const blobUrl = URL.createObjectURL(result.data);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(blobUrl);
    };

    const handleCreateNote = noteForm.handleSubmit(async ({newNoteText}) => {
        if (!newNoteText.trim()) return;
        await createNote({eventId, text: newNoteText.trim()});
        noteForm.reset();
    });

    const startEditNote = (note: EventNote) => {
        setEditingNoteId(note.id);
        editNoteForm.reset({editingText: note.text});
    };

    const saveNote = editNoteForm.handleSubmit(async ({editingText}) => {
        if (!editingNoteId) return;
        await updateNote({eventId, noteId: editingNoteId, text: editingText.trim()});
        setEditingNoteId(null);
        editNoteForm.reset({editingText: ''});
    });

    return (
        <div className={styles.layout}>
            <section className={styles.card}>
                <h3 className={styles.title}>Документы и вложения</h3>
                <input
                    className={styles.fileLabel}
                    value={searchValue}
                    onChange={(event) => filterForm.setValue('searchValue', event.target.value)}
                    placeholder="Поиск по вложениям"
                />
                <div className={styles.actions}>
                    <label><input type="checkbox" checked={kindFile} onChange={() => filterForm.setValue('kindFile', !kindFile)}/>Файл</label>
                    <label><input type="checkbox" checked={kindLink} onChange={() => filterForm.setValue('kindLink', !kindLink)}/>Ссылка</label>
                </div>
                <div className={styles.actions}>
                    <Button onClick={() => filterForm.setValue('sort', 'Newest')}>Сначала новые</Button>
                    <Button onClick={() => filterForm.setValue('sort', 'Oldest')}>Сначала старые</Button>
                    <Button onClick={() => filterForm.setValue('sort', 'TitleAsc')}>По названию</Button>
                    <Button onClick={() => filterForm.setValue('sort', 'AuthorAsc')}>По автору</Button>
                </div>
                {fileExtensions.length > 0 && (
                    <div className={styles.actions}>
                        {fileExtensions.map((item) => (
                            <label key={item.extension}>
                                <input
                                    type="checkbox"
                                    checked={selectedExtensions.includes(item.extension)}
                                    onChange={() => filterForm.setValue(
                                        'selectedExtensions',
                                        selectedExtensions.includes(item.extension)
                                            ? selectedExtensions.filter((v) => v !== item.extension)
                                            : [...selectedExtensions, item.extension]
                                    )}
                                />
                                {item.label}
                            </label>
                        ))}
                    </div>
                )}
                {linkSites.length > 0 && (
                    <div className={styles.actions}>
                        {linkSites.map((site) => (
                            <label key={site.siteKey}>
                                <input
                                    type="checkbox"
                                    checked={selectedLinkSites.includes(site.siteKey)}
                                    onChange={() => filterForm.setValue(
                                        'selectedLinkSites',
                                        selectedLinkSites.includes(site.siteKey)
                                            ? selectedLinkSites.filter((v) => v !== site.siteKey)
                                            : [...selectedLinkSites, site.siteKey]
                                    )}
                                />
                                {site.label}
                            </label>
                        ))}
                    </div>
                )}
                {authors.length > 0 && (
                    <div className={styles.actions}>
                        {authors.map((author) => (
                            <label key={author.id}>
                                <input
                                    type="checkbox"
                                    checked={selectedAuthorIds.includes(author.id)}
                                    onChange={() => filterForm.setValue(
                                        'selectedAuthorIds',
                                        selectedAuthorIds.includes(author.id)
                                            ? selectedAuthorIds.filter((v) => v !== author.id)
                                            : [...selectedAuthorIds, author.id]
                                    )}
                                />
                                {author.displayName || 'Участник'}
                            </label>
                        ))}
                    </div>
                )}
                <div className={styles.uploadRow}>
                    <label className={styles.fileLabel}>
                        <input
                            type="file"
                            className={styles.fileInput}
                            onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)}
                        />
                        <span>{isUploadingFile ? 'Загрузка...' : 'Загрузить файл'}</span>
                    </label>
                </div>

                <div className={styles.linkRow}>
                    <Controller name="linkTitle" control={linkForm.control} render={({field}) => (
                        <TextField value={field.value} onChange={field.onChange} placeholder="Название ссылки"/>
                    )}/>
                    <Controller name="linkUrl" control={linkForm.control} rules={{required: true}} render={({field}) => (
                        <TextField value={field.value} onChange={field.onChange} placeholder="https://..."/>
                    )}/>
                    <Button onClick={handleAddLink} disabled={isUploadingLink || !linkForm.watch('linkUrl')?.trim()}>
                        Добавить ссылку
                    </Button>
                </div>

                {isAttachmentsLoading ? (
                    <p className={styles.empty}>Загрузка вложений...</p>
                ) : attachments.length === 0 ? (
                    <p className={styles.empty}>Пока нет вложений</p>
                ) : (
                    <div className={styles.list}>
                        {attachments.map((attachment) => {
                            const title = getAttachmentLabel(attachment);
                            const link = getAttachmentLink(attachment);
                            return (
                                <article key={attachment.id} className={styles.item}>
                                    <div>
                                        <p className={styles.itemTitle}>{title}</p>
                                        {link && <a href={link} target="_blank" rel="noreferrer" className={styles.itemLink}>{link}</a>}
                                    </div>
                                    <div className={styles.actions}>
                                        <button type="button" onClick={() => handleDownload(attachment.id, title)}>Скачать</button>
                                        <button
                                            type="button"
                                            disabled={isDeletingAttachment}
                                            onClick={() => deleteAttachment({eventId, attachmentId: attachment.id})}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className={styles.card}>
                <h3 className={styles.title}>Заметки</h3>
                <Controller name="newNoteText" control={noteForm.control} render={({field}) => (
                    <TextArea value={field.value} onChange={field.onChange} placeholder="Новая заметка"/>
                )}/>
                <div className={styles.noteActions}>
                    <Button onClick={handleCreateNote} disabled={isCreatingNote || !noteForm.watch('newNoteText')?.trim()}>
                        Добавить заметку
                    </Button>
                </div>

                {isNotesLoading ? (
                    <p className={styles.empty}>Загрузка заметок...</p>
                ) : notes.length === 0 ? (
                    <p className={styles.empty}>Пока нет заметок</p>
                ) : (
                    <div className={styles.notesList}>
                        {notes.map((note) => (
                            <article key={note.id} className={styles.noteItem}>
                                {editingNoteId === note.id ? (
                                    <>
                                        <Controller name="editingText" control={editNoteForm.control} render={({field}) => (
                                            <TextArea value={field.value} onChange={field.onChange}/>
                                        )}/>
                                        <div className={styles.actions}>
                                            <button type="button" disabled={isUpdatingNote} onClick={saveNote}>Сохранить</button>
                                            <button type="button" onClick={() => setEditingNoteId(null)}>Отмена</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className={styles.noteText}>{note.text}</p>
                                        <button type="button" onClick={() => startEditNote(note)}>Редактировать</button>
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
