import {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import PlusIcon from '@/assets/img/icon-s/plus-lg.svg?react';
import CheckIcon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import FilterIcon from '@/assets/img/icon-m/filter.svg?react';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import ChevronRightIcon from '@/assets/img/icon-m/chevron-right.svg?react';
import JustifyIcon from '@/assets/img/icon-m/justify.svg?react';
import StackedIcon from '@/assets/img/icon-m/view-stacked.svg?react';
import Button from '@/ui/button/Button.tsx';
import Checkbox from '@/ui/checkbox/Checkbox.tsx';
import {AddDocumentMenu} from './AddDocumentMenu.tsx';
import {EventDocumentSection} from './EventDocumentSection.tsx';
import {EventNewNoteCard} from './EventNewNoteCard.tsx';
import {EventNoteCard} from './EventNoteCard.tsx';
import FileIcon from '@/assets/image/file.svg?react';
import LinkIcon from '@/assets/image/link.svg?react';
import ProfileActionModal from '@/components/profile-action-modal/ProfileActionModal.tsx';
import {
    useGetEventAttachmentsQuery,
    useGetEventAttachmentsFacetsQuery,
    useGetEventSubscribersQuery,
    useGetEventNotesQuery,
    useCreateEventNoteMutation,
    useUpdateEventNoteMutation,
    useLazyDownloadEventAttachmentQuery,
    useUploadEventAttachmentFileMutation,
    useUploadEventAttachmentLinkMutation,
} from '@/services/api/eventApi.ts';
import type {RootState} from '@/store/store.ts';
import styles from './EventDocumentsTab.module.scss';
import {isValidUrl} from '@/utils/validation.ts';
import type {EventAttachment} from '@/types/api/Event.ts';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';

interface EventDocumentsTabProps {
    eventId: string;
}

const EventDocumentsTab = ({eventId}: EventDocumentsTabProps) => {
    const currentUserId = useSelector((state: RootState) => state.profile.profile?.id ?? '');
    const {data: subscribersData} = useGetEventSubscribersQuery(
        {eventId, count: 200, offset: 0},
        {skip: !eventId}
    );

    const canManageDocuments = useMemo(() => {
        const users = subscribersData?.res?.users ?? [];
        const role = users.find((user) => user.id === currentUserId)?.role ?? null;
        const normalizedRole = String(role ?? '').toLowerCase();
        return (
            !role
            || normalizedRole === 'organizer'
            || normalizedRole === 'editor'
            || normalizedRole === 'организатор'
            || normalizedRole === 'редактор'
        );
    }, [subscribersData, currentUserId]);

    const [searchValue, setSearchValue] = useState('');
    const [sort, setSort] = useState<'Newest' | 'Oldest' | 'TitleAsc' | 'AuthorAsc'>('Newest');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAuthorPanelOpen, setIsAuthorPanelOpen] = useState(false);
    const [authorSearch, setAuthorSearch] = useState('');
    const [kindFile, setKindFile] = useState(false);
    const [kindLink, setKindLink] = useState(false);
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
    const [selectedLinkSites, setSelectedLinkSites] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'rows' | 'cards'>('rows');

    const sortRef = useRef<HTMLDivElement | null>(null);
    const filterRef = useRef<HTMLDivElement | null>(null);
    const newNoteTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [showNewNoteForm, setShowNewNoteForm] = useState(false);
    useClickOutside(sortRef, () => setIsSortOpen(false), isSortOpen);
    useClickOutside(filterRef, () => { setIsFilterOpen(false); setIsAuthorPanelOpen(false); }, isFilterOpen || isAuthorPanelOpen);

    useEffect(() => {
        if (!isFilterOpen) {
            setIsAuthorPanelOpen(false);
        }
    }, [isFilterOpen]);

    const {data: facetsData} = useGetEventAttachmentsFacetsQuery(eventId, {skip: !eventId});
    const fileExtensions = facetsData?.result?.fileExtensions ?? [];
    const linkSites = facetsData?.result?.linkSites ?? [];
    const authors = facetsData?.result?.authors ?? [];

    const attachmentsQuery = useMemo(() => ({
        eventId,
        q: searchValue.trim() || undefined,
        kinds: [kindFile && 'File', kindLink && 'Link'].filter(Boolean).join(',') || undefined,
        authorIds: selectedAuthorIds.length ? selectedAuthorIds.join(',') : undefined,
        extensions: selectedExtensions.length ? selectedExtensions.join(',') : undefined,
        linkSites: selectedLinkSites.length ? selectedLinkSites.join(',') : undefined,
        sort,
    }), [eventId, searchValue, kindFile, kindLink, selectedAuthorIds, selectedExtensions, selectedLinkSites, sort]);

    const {data: attachments = []} = useGetEventAttachmentsQuery(attachmentsQuery, {skip: !eventId});
    const {data: notesRaw = []} = useGetEventNotesQuery(eventId, {skip: !eventId});
    const notes = useMemo(() => [...notesRaw].sort((a, b) => {
        const ta = new Date(a.createdAt ?? 0).getTime();
        const tb = new Date(b.createdAt ?? 0).getTime();
        return tb - ta;
    }), [notesRaw]);
    const [uploadFile] = useUploadEventAttachmentFileMutation();
    const [uploadLink] = useUploadEventAttachmentLinkMutation();
    const [createNote, {isLoading: isCreatingNote}] = useCreateEventNoteMutation();
    const [updateNote] = useUpdateEventNoteMutation();
    const [downloadAttachment] = useLazyDownloadEventAttachmentQuery();
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [linkTitleDraft, setLinkTitleDraft] = useState('');
    const [linkUrlDraft, setLinkUrlDraft] = useState('');
    const [attachmentToOpen, setAttachmentToOpen] = useState<EventAttachment | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const documentsDescription = canManageDocuments
        ? 'Загружайте файлы и добавляйте ссылки на документы, презентации, таблицы и другие материалы мероприятия'
        : 'Файлы и ссылки на документы, презентации, таблицы и другие материалы мероприятия';

    const notesDescription = canManageDocuments
        ? 'Записывайте идеи, мысли и короткие заметки по мероприятию'
        : 'Идеи, мысли и короткие заметки по мероприятию';

    const handlePickFile = async (file: File) => {
        if (!eventId) return;
        await uploadFile({eventId, file});
    };

    const handleAddLink = () => {
        setIsAddLinkOpen(true);
    };

    const submitLink = async () => {
        if (!eventId) return;
        const trimmedUrl = linkUrlDraft.trim();
        const trimmedTitle = linkTitleDraft.trim();
        if (!trimmedUrl || !isValidUrl(trimmedUrl)) return;
        await uploadLink({eventId, url: trimmedUrl, title: trimmedTitle || undefined});
        setLinkTitleDraft('');
        setLinkUrlDraft('');
        setIsAddLinkOpen(false);
    };

    const cancelLink = () => {
        setLinkTitleDraft('');
        setLinkUrlDraft('');
        setIsAddLinkOpen(false);
    };

    const hasDocumentsList = attachments.length > 0 || isAddLinkOpen;

    const hasNotesBoard = notes.length > 0 || (canManageDocuments && showNewNoteForm);
    const notesSectionChildren = hasNotesBoard ? (
        <div className={styles.notesBoard}>
            {canManageDocuments && showNewNoteForm && (
                <EventNewNoteCard
                    ref={newNoteTextareaRef}
                    isSubmitting={isCreatingNote}
                    onClose={() => setShowNewNoteForm(false)}
                    onSubmit={async (text) => {
                        await createNote({eventId, text}).unwrap();
                        setShowNewNoteForm(false);
                    }}
                />
            )}
            {notes.map((note) => (
                <EventNoteCard
                    key={note.id}
                    note={note}
                    canEdit={
                        canManageDocuments
                        || (Boolean(note.authorId) && note.authorId === currentUserId)
                    }
                    onSave={async (text) => {
                        await updateNote({eventId, noteId: note.id, text}).unwrap();
                    }}
                />
            ))}
        </div>
    ) : undefined;

    useEffect(() => {
        if (!showNewNoteForm) return;
        const id = requestAnimationFrame(() => {
            newNoteTextareaRef.current?.focus();
        });
        return () => cancelAnimationFrame(id);
    }, [showNewNoteForm]);

    const formatBytes = (value: number | null | undefined): string => {
        if (!value || value <= 0) return '—';
        const units = ['Б', 'КБ', 'МБ', 'ГБ'];
        const idx = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
        const sized = value / Math.pow(1024, idx);
        const digits = idx === 0 ? 0 : sized >= 10 ? 0 : 1;
        return `${sized.toFixed(digits)} ${units[idx]}`;
    };

    const getAttachmentLabel = (att: EventAttachment): string => {
        return att.title || att.originalFileName || att.fileName || att.url || att.resource || 'Вложение';
    };

    const getAttachmentKind = (att: EventAttachment): 'File' | 'Link' | 'Unknown' => {
        const kind = String(att.kind ?? att.type ?? '').toLowerCase();
        if (kind === 'link') return 'Link';
        if (kind === 'file') return 'File';
        if (att.resource?.startsWith('http')) return 'Link';
        return 'Unknown';
    };

    const confirmOpenAttachment = async () => {
        if (!attachmentToOpen) return;
        const kind = getAttachmentKind(attachmentToOpen);
        const label = getAttachmentLabel(attachmentToOpen);

        if (kind === 'Link') {
            const url = attachmentToOpen.resource ?? attachmentToOpen.url ?? '';
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
            setAttachmentToOpen(null);
            return;
        }

        setIsDownloading(true);
        try {
            const result = await downloadAttachment({eventId, attachmentId: attachmentToOpen.id});
            if (!('data' in result) || !result.data) {
                return;
            }
            const blobUrl = URL.createObjectURL(result.data);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = label;
            anchor.click();
            URL.revokeObjectURL(blobUrl);
        } finally {
            setIsDownloading(false);
            setAttachmentToOpen(null);
        }
    };

    return (
        <div className={styles.root}>
            <EventDocumentSection
                title="Документы"
                description={documentsDescription}
                emptyMessage={canManageDocuments ? 'Добавьте первый документ для мероприятия' : 'Пока нет документов'}
                emptyHint={canManageDocuments ? 'Перетащите файлы сюда или нажмите на кнопку ниже.' : undefined}
                headerAction={canManageDocuments ? (
                    <AddDocumentMenu
                        onPickFile={handlePickFile}
                        onAddLink={handleAddLink}
                        trigger={(
                            <Button size="S" variant="Filled" color="gray" type="button">
                                Добавить
                            </Button>
                        )}
                    />
                ) : undefined}
                emptyAction={canManageDocuments ? (
                    <AddDocumentMenu
                        onPickFile={handlePickFile}
                        onAddLink={handleAddLink}
                        trigger={(
                            <Button size="S" variant="Filled" color="green" leftIcon={<PlusIcon/>} type="button">
                                Добавить документ
                            </Button>
                        )}
                    />
                ) : undefined}
            >
                <div className={styles.boardControls}>
                    <div className={styles.controlsLeft}>
                        <label className={styles.searchControl}>
                            <SearchIcon/>
                            <input
                                type="text"
                                placeholder="Документ..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </label>

                        <div className={styles.controlDropdown} ref={filterRef}>
                            <button type="button" className={styles.filterControl} onClick={() => setIsFilterOpen((p) => !p)}>
                                <FilterIcon/>
                                <span>Фильтр</span>
                                <ChevronDownIcon className={isFilterOpen ? styles.chevronUp : ''}/>
                            </button>

                            {isFilterOpen && (
                                <div className={styles.filterMenu}>
                                    <div>
                                        <h4>Тип</h4>
                                        <div className={styles.typePills}>
                                            <button type="button" className={`${styles.pill} ${kindFile ? styles.pillActive : ''}`} onClick={() => setKindFile((p) => !p)}>Файл</button>
                                            <button type="button" className={`${styles.pill} ${kindLink ? styles.pillActive : ''}`} onClick={() => setKindLink((p) => !p)}>Ссылка</button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4>Автор</h4>
                                        <div
                                            className={styles.authorMenuWrap}
                                            onMouseEnter={() => setIsAuthorPanelOpen(true)}
                                            onMouseLeave={() => setIsAuthorPanelOpen(false)}
                                        >
                                            <button
                                                type="button"
                                                className={styles.authorSelect}
                                                onClick={(e) => e.stopPropagation()}
                                                onTouchStart={() => setIsAuthorPanelOpen(true)}
                                                aria-expanded={isAuthorPanelOpen}
                                                aria-haspopup="dialog"
                                            >
                                                <span className={styles.authorLabel}>Автор</span>
                                                <span className={styles.authorTrailing}>
                                                    {selectedAuthorIds.length > 0 ? (
                                                        <span className={styles.authorBadge}>{selectedAuthorIds.length}</span>
                                                    ) : null}
                                                    <ChevronRightIcon className={styles.authorChevron} aria-hidden/>
                                                </span>
                                            </button>

                                            {isAuthorPanelOpen ? (
                                                <div
                                                    className={styles.filterSubPanel}
                                                    role="dialog"
                                                    aria-label="Выбор авторов"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        className={styles.subSearch}
                                                        placeholder="Имя..."
                                                        value={authorSearch}
                                                        onChange={(e) => setAuthorSearch(e.target.value)}
                                                    />
                                                    <div className={styles.subList}>
                                                        {authors
                                                            .filter((a) => (a.displayName || '').toLowerCase().includes(authorSearch.toLowerCase()))
                                                            .map((a) => {
                                                                const checked = selectedAuthorIds.includes(a.id);
                                                                const toggleAuthor = () => {
                                                                    setSelectedAuthorIds((prev) =>
                                                                        prev.includes(a.id) ? prev.filter((v) => v !== a.id) : [...prev, a.id]
                                                                    );
                                                                };
                                                                return (
                                                                    <div key={a.id} className={styles.subItem}>
                                                                        <button
                                                                            type="button"
                                                                            className={styles.subLeft}
                                                                            onClick={toggleAuthor}
                                                                        >
                                                                            <span className={styles.subName}>{a.displayName || 'Пользователь'}</span>
                                                                        </button>
                                                                        <Checkbox checked={checked} onChange={toggleAuthor}/>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div>
                                        <h4>Расширение</h4>
                                        {fileExtensions.map((ext) => (
                                            <div key={ext.extension} className={styles.filterCheckRow}>
                                                <Checkbox
                                                    checked={selectedExtensions.includes(ext.extension)}
                                                    onChange={() => {
                                                        setSelectedExtensions((prev) =>
                                                            prev.includes(ext.extension)
                                                                ? prev.filter((v) => v !== ext.extension)
                                                                : [...prev, ext.extension]
                                                        );
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className={styles.filterCheckLabel}
                                                    onClick={() => {
                                                        setSelectedExtensions((prev) =>
                                                            prev.includes(ext.extension)
                                                                ? prev.filter((v) => v !== ext.extension)
                                                                : [...prev, ext.extension]
                                                        );
                                                    }}
                                                >
                                                    {ext.label}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {linkSites.length > 0 && (
                                        <div>
                                            <h4>Площадки</h4>
                                            {linkSites.map((site) => (
                                                <div key={site.siteKey} className={styles.filterCheckRow}>
                                                    <Checkbox
                                                        checked={selectedLinkSites.includes(site.siteKey)}
                                                        onChange={() => {
                                                            setSelectedLinkSites((prev) =>
                                                                prev.includes(site.siteKey)
                                                                    ? prev.filter((v) => v !== site.siteKey)
                                                                    : [...prev, site.siteKey]
                                                            );
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={styles.filterCheckLabel}
                                                        onClick={() => {
                                                            setSelectedLinkSites((prev) =>
                                                                prev.includes(site.siteKey)
                                                                    ? prev.filter((v) => v !== site.siteKey)
                                                                    : [...prev, site.siteKey]
                                                            );
                                                        }}
                                                    >
                                                        {site.label}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className={styles.resetFiltersBtn}
                                        onClick={() => {
                                            setKindFile(false);
                                            setKindLink(false);
                                            setSelectedAuthorIds([]);
                                            setSelectedExtensions([]);
                                            setSelectedLinkSites([]);
                                            setAuthorSearch('');
                                            setIsAuthorPanelOpen(false);
                                        }}
                                    >
                                        Сбросить фильтр
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.controlsRight}>
                        <div className={styles.controlDropdown} ref={sortRef}>
                            <button type="button" className={styles.sortControl} onClick={() => setIsSortOpen((p) => !p)}>
                                <span>{sort === 'Newest' ? 'Сначала новые' : sort === 'Oldest' ? 'Сначала старые' : sort === 'TitleAsc' ? 'А -> Я' : 'Автор: А -> Я'}</span>
                                <ChevronDownIcon className={isSortOpen ? styles.chevronUp : ''}/>
                            </button>
                            {isSortOpen && (
                                <div className={styles.sortMenu}>
                                    <button type="button" onClick={() => { setSort('Newest'); setIsSortOpen(false); }}>Сначала новые</button>
                                    <button type="button" onClick={() => { setSort('Oldest'); setIsSortOpen(false); }}>Сначала старые</button>
                                    <button type="button" onClick={() => { setSort('TitleAsc'); setIsSortOpen(false); }}>А -&gt; Я</button>
                                    <button type="button" onClick={() => { setSort('AuthorAsc'); setIsSortOpen(false); }}>Автор: А -&gt; Я</button>
                                </div>
                            )}
                        </div>

                        <div className={styles.viewToggle}>
                            <button
                                type="button"
                                className={`${styles.viewBtn} ${viewMode === 'rows' ? styles.viewBtnActive : ''}`}
                                onClick={() => setViewMode('rows')}
                                aria-label="Строками"
                                title="Строками"
                            >
                                <JustifyIcon/>
                            </button>
                            <button
                                type="button"
                                className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.viewBtnActive : ''}`}
                                onClick={() => setViewMode('cards')}
                                aria-label="Карточками"
                                title="Карточками"
                            >
                                <StackedIcon/>
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'rows' && hasDocumentsList && (
                    <div className={styles.attachmentsTable}>
                        <div className={styles.attachmentsHeader}>
                            <span>Название</span>
                            <span>Автор</span>
                            <span>Дата загрузки</span>
                            <span>Размер</span>
                        </div>

                        {isAddLinkOpen && (
                            <div className={styles.attachmentsRow}>
                                <div className={styles.nameCell}>
                                    <LinkIcon className={styles.rowIcon}/>
                                    <div className={styles.linkFields}>
                                        <input
                                            className={styles.linkInput}
                                            value={linkTitleDraft}
                                            onChange={(e) => setLinkTitleDraft(e.target.value)}
                                            placeholder="Название ссылки"
                                        />
                                        <input
                                            className={styles.linkInput}
                                            value={linkUrlDraft}
                                            onChange={(e) => setLinkUrlDraft(e.target.value)}
                                            placeholder="Вставьте ссылку..."
                                        />
                                    </div>
                                </div>
                                <div className={styles.metaCell}>—</div>
                                <div className={styles.metaCell}>—</div>
                                <div className={styles.rowActions}>
                                    <button
                                        type="button"
                                        className={styles.iconBtn}
                                        onClick={() => void submitLink()}
                                        disabled={!linkUrlDraft.trim() || !isValidUrl(linkUrlDraft)}
                                        aria-label="Сохранить ссылку"
                                        title="Сохранить"
                                    >
                                        <CheckIcon/>
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.iconBtn}
                                        onClick={cancelLink}
                                        aria-label="Отменить"
                                        title="Отменить"
                                    >
                                        <XIcon/>
                                    </button>
                                </div>
                            </div>
                        )}

                        {attachments.map((att) => {
                            const title = getAttachmentLabel(att);
                            const author = att.authorDisplayName || '—';
                            const date = att.createdAt
                                ? new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(att.createdAt))
                                : '—';
                            const size = formatBytes(att.size);
                            const kind = getAttachmentKind(att);
                            return (
                                <button
                                    key={att.id}
                                    type="button"
                                    className={styles.attachmentsRow}
                                    onClick={() => setAttachmentToOpen(att)}
                                >
                                    <div className={styles.nameCell}>
                                        {kind === 'Link' ? <LinkIcon className={styles.rowIcon}/> : <FileIcon className={styles.rowIcon}/>}
                                        <span className={styles.nameText}>{title}</span>
                                    </div>
                                    <div className={styles.metaCell}>{author}</div>
                                    <div className={styles.metaCell}>{date}</div>
                                    <div className={styles.metaCell}>{size}</div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {viewMode === 'cards' && attachments.length > 0 && (
                    <div className={styles.cardsGrid}>
                        {attachments.map((att) => {
                            const title = getAttachmentLabel(att);
                            const author = att.authorDisplayName || '—';
                            const date = att.createdAt
                                ? new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(att.createdAt))
                                : '—';
                            const size = formatBytes(att.size);
                            const kind = getAttachmentKind(att);
                            return (
                                <button key={att.id} type="button" className={styles.docCard} onClick={() => setAttachmentToOpen(att)}>
                                    <div className={styles.cardTop}>
                                        {kind === 'Link' ? <LinkIcon className={styles.rowIcon}/> : <FileIcon className={styles.rowIcon}/>}
                                        <span className={styles.cardTitle}>{title}</span>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <span>{author}</span>
                                        <span>{date}</span>
                                        <span>{size}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </EventDocumentSection>
            <hr className={styles.divider} aria-hidden/>
            <EventDocumentSection
                title="Заметки"
                description={notesDescription}
                emptyMessage="Пока нет заметок"
                headerAction={canManageDocuments ? (
                    <Button
                        size="S"
                        variant="Filled"
                        color="gray"
                        type="button"
                        onClick={() => {
                            setShowNewNoteForm(true);
                            requestAnimationFrame(() => newNoteTextareaRef.current?.focus());
                        }}
                    >
                        Создать заметку
                    </Button>
                ) : undefined}
            >
                {notesSectionChildren}
            </EventDocumentSection>

            <ProfileActionModal
                isOpen={Boolean(attachmentToOpen)}
                title={
                    attachmentToOpen
                        ? (getAttachmentKind(attachmentToOpen) === 'Link'
                            ? 'Переход по ссылке'
                            : 'Скачать файл?')
                        : ''
                }
                description={
                    attachmentToOpen
                        ? (getAttachmentKind(attachmentToOpen) === 'Link'
                            ? undefined
                            : `Скачать «${getAttachmentLabel(attachmentToOpen)}»?`)
                        : undefined
                }
                onClose={() => {
                    if (isDownloading) return;
                    setAttachmentToOpen(null);
                }}
                onConfirm={() => void confirmOpenAttachment()}
                confirmText={attachmentToOpen && getAttachmentKind(attachmentToOpen) === 'Link' ? 'Перейти' : 'Скачать'}
                cancelText="Отмена"
                confirmDisabled={isDownloading}
            >
                {attachmentToOpen && getAttachmentKind(attachmentToOpen) === 'Link' && (
                    <p className={styles.linkConfirmLine}>
                        Вы уверены, что хотите перейти по ссылке (
                        <span className={styles.linkConfirmUrlInline}>
                            {attachmentToOpen.resource ?? attachmentToOpen.url ?? '—'}
                        </span>
                        )?
                    </p>
                )}
            </ProfileActionModal>
        </div>
    );
};

export default EventDocumentsTab;
