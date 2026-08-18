import {useCallback, useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import {useSelector} from 'react-redux';
import PlusIcon from '@/assets/img/icon-s/plus-lg.svg?react';
import CheckIcon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import FilterIcon from '@/assets/img/icon-m/filter.svg?react';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import ChevronRightIcon from '@/assets/img/icon-m/chevron-right.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import JustifyIcon from '@/assets/img/icon-m/justify.svg?react';
import StackedIcon from '@/assets/img/icon-m/view-stacked.svg?react';
import {Button} from "antd";
import {Checkbox} from "antd";
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
    useDeleteEventAttachmentMutation,
    useUploadEventAttachmentFileMutation,
    useUploadEventAttachmentLinkMutation,
} from '@/services/api/eventApi.ts';
import {useApiToast} from '@/hooks/ui/useApiToast.ts';
import type {RootState} from '@/store/store.ts';
import styles from './EventDocumentsTab.module.scss';
import {isValidUrl} from '@/utils/validation.ts';
import type {EventAttachment, ParticipantRoleKind} from '@/types/api/Event.ts';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';
import {normalizeParticipantRole} from '@/utils/participantRole.ts';
import {useI18n} from '@/i18n/I18nProvider';

interface EventDocumentsTabProps {
    eventId: string;
    participantRole?: ParticipantRoleKind | string | null;
    canManageDocuments?: boolean;
}

const EventDocumentsTab = ({eventId, participantRole, canManageDocuments: canManageDocumentsProp}: EventDocumentsTabProps) => {
    const {t, language} = useI18n();
    const {showApiError, showSuccess} = useApiToast();
    const currentUserId = useSelector((state: RootState) => state.profile.profile?.id ?? '');
    const {data: subscribersData} = useGetEventSubscribersQuery(
        {eventId, count: 200, offset: 0},
        {skip: !eventId}
    );

    const canManageDocuments = useMemo(() => {
        if (typeof canManageDocumentsProp === 'boolean') return canManageDocumentsProp;

        const roleFromEvent = normalizeParticipantRole(participantRole);
        if (roleFromEvent) return roleFromEvent !== 'Observer';

        const users = subscribersData?.res?.users ?? [];
        const role = users.find((user) => user.id === currentUserId)?.role ?? null;
        const normalizedRole = normalizeParticipantRole(role);
        return normalizedRole === 'Organizer' || normalizedRole === 'Editor' || normalizedRole === 'Assistant';
    }, [canManageDocumentsProp, participantRole, subscribersData, currentUserId]);

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
    const [deleteAttachment, {isLoading: isDeletingAttachment}] = useDeleteEventAttachmentMutation();
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [linkTitleDraft, setLinkTitleDraft] = useState('');
    const [linkUrlDraft, setLinkUrlDraft] = useState('');
    const [attachmentToOpen, setAttachmentToOpen] = useState<EventAttachment | null>(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState<EventAttachment | null>(null);
    const [openMenuAttachmentId, setOpenMenuAttachmentId] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const documentsDescription = canManageDocuments
        ? t('eventPage.documents.documentsDescriptionManage')
        : t('eventPage.documents.documentsDescriptionRead');

    const notesDescription = canManageDocuments
        ? t('eventPage.documents.notesDescriptionManage')
        : t('eventPage.documents.notesDescriptionRead');

    const handlePickFile = async (file: File) => {
        if (!eventId || !canManageDocuments) return;
        try {
            await uploadFile({eventId, file}).unwrap();
            showSuccess(t('eventPage.documents.uploadSuccess'));
        } catch (error) {
            showApiError(error, t('eventPage.documents.uploadFailed'));
        }
    };

    const handleAddLink = () => {
        setIsAddLinkOpen(true);
    };

    const submitLink = async () => {
        if (!eventId || !canManageDocuments) return;
        const trimmedUrl = linkUrlDraft.trim();
        const trimmedTitle = linkTitleDraft.trim();
        if (!trimmedUrl || !isValidUrl(trimmedUrl)) return;
        try {
            await uploadLink({eventId, url: trimmedUrl, title: trimmedTitle || undefined}).unwrap();
            setLinkTitleDraft('');
            setLinkUrlDraft('');
            setIsAddLinkOpen(false);
            showSuccess(t('eventPage.documents.linkAddedSuccess'));
        } catch (error) {
            showApiError(error, t('eventPage.documents.linkAddedFailed'));
        }
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
                    canEdit={canManageDocuments}
                    onSave={async (text) => {
                        if (!canManageDocuments) return;
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
        const units = language === 'ru' ? ['Б', 'КБ', 'МБ', 'ГБ'] : ['B', 'KB', 'MB', 'GB'];
        const idx = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
        const sized = value / Math.pow(1024, idx);
        const digits = idx === 0 ? 0 : sized >= 10 ? 0 : 1;
        return `${sized.toFixed(digits)} ${units[idx]}`;
    };

    const getAttachmentLabel = (att: EventAttachment): string => {
        return att.title || att.originalFileName || att.fileName || att.url || att.resource || t('eventPage.documents.attachmentFallback');
    };

    const getAttachmentKind = (att: EventAttachment): 'File' | 'Link' | 'Unknown' => {
        const kind = String(att.kind ?? att.type ?? '').toLowerCase();
        if (kind === 'link') return 'Link';
        if (kind === 'file') return 'File';
        if (att.resource?.startsWith('http')) return 'Link';
        return 'Unknown';
    };

    const closeAttachmentMenus = useCallback(() => {
        setOpenMenuAttachmentId(null);
    }, []);

    useEffect(() => {
        if (!openMenuAttachmentId) return;

        const handleOutsideClick = (event: Event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest(`.${styles.attachmentMenu}`) || target.closest(`.${styles.rowMenuWrap}`)) {
                return;
            }
            closeAttachmentMenus();
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [openMenuAttachmentId, closeAttachmentMenus]);

    const requestDeleteAttachment = useCallback((att: EventAttachment) => {
        setAttachmentToDelete(att);
        closeAttachmentMenus();
    }, [closeAttachmentMenus]);

    const confirmDeleteAttachment = async () => {
        if (!attachmentToDelete || !eventId || !canManageDocuments) return;

        try {
            await deleteAttachment({eventId, attachmentId: attachmentToDelete.id}).unwrap();
            if (attachmentToOpen?.id === attachmentToDelete.id) {
                setAttachmentToOpen(null);
            }
            showSuccess(t('eventPage.documents.deletedSuccess'));
            setAttachmentToDelete(null);
        } catch (error) {
            showApiError(error, t('eventPage.documents.deletedFailed'));
        }
    };

    const renderAttachmentMenu = (
        onDelete: () => void,
        style?: CSSProperties,
    ) => (
        <div
            className={styles.attachmentMenu}
            style={style}
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                className={styles.attachmentMenuDanger}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                }}
            >
                <TrashIcon className={styles.attachmentMenuTrashIcon}/>
                {t('common.actions.delete')}
            </button>
        </div>
    );

    const renderAttachmentActions = (att: EventAttachment) => {
        if (!canManageDocuments) return null;

        const isMenuOpen = openMenuAttachmentId === att.id;

        return (
            <div
                className={styles.rowMenuWrap}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={t('eventPage.documents.documentsTitle')}
                    title={t('eventPage.documents.documentsTitle')}
                    onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuAttachmentId((prev) => (prev === att.id ? null : att.id));
                    }}
                >
                    <ThreeDotsVerticalIcon/>
                </button>
                {isMenuOpen && renderAttachmentMenu(() => requestDeleteAttachment(att))}
            </div>
        );
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
                title={t('eventPage.documents.documentsTitle')}
                description={documentsDescription}
                emptyMessage={canManageDocuments ? t('eventPage.documents.addFirstDocument') : t('eventPage.documents.noDocuments')}
                emptyHint={canManageDocuments ? t('eventPage.documents.emptyHint') : undefined}
                headerAction={canManageDocuments ? (
                    <AddDocumentMenu
                        onPickFile={handlePickFile}
                        onAddLink={handleAddLink}
                        trigger={(
                            <Button type="default" className="ep-btn ep-btn--s ep-btn--filled-gray">
                                {t('eventPage.documents.add')}
                            </Button>
                        )}
                    />
                ) : undefined}
                emptyAction={canManageDocuments ? (
                    <AddDocumentMenu
                        onPickFile={handlePickFile}
                        onAddLink={handleAddLink}
                        trigger={(
                            <Button
                                type="primary"
                                icon={<PlusIcon/>}
                                className="ep-btn ep-btn--s ep-btn--filled-green"
                            >
                                {t('eventPage.documents.addDocument')}
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
                                placeholder={t('eventPage.documents.searchPlaceholder')}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </label>

                        <div className={styles.controlDropdown} ref={filterRef}>
                            <button type="button" className={styles.filterControl} onClick={() => setIsFilterOpen((p) => !p)}>
                                <FilterIcon/>
                                <span>{t('eventPage.documents.filter')}</span>
                                <ChevronDownIcon className={isFilterOpen ? styles.chevronUp : ''}/>
                            </button>

                            {isFilterOpen && (
                                <div className={styles.filterMenu}>
                                    <div>
                                        <h4>{t('eventPage.documents.type')}</h4>
                                        <div className={styles.typePills}>
                                            <button type="button" className={`${styles.pill} ${kindFile ? styles.pillActive : ''}`} onClick={() => setKindFile((p) => !p)}>{t('eventPage.documents.file')}</button>
                                            <button type="button" className={`${styles.pill} ${kindLink ? styles.pillActive : ''}`} onClick={() => setKindLink((p) => !p)}>{t('eventPage.documents.link')}</button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4>{t('eventPage.documents.author')}</h4>
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
                                                <span className={styles.authorLabel}>{t('eventPage.documents.author')}</span>
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
                                                    aria-label={t('eventPage.documents.authorSelect')}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        className={styles.subSearch}
                                                        placeholder={t('eventPage.documents.namePlaceholder')}
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
                                                                            <span className={styles.subName}>{a.displayName || t('eventPage.documents.userFallback')}</span>
                                                                        </button>
                                                                        <Checkbox checked={checked} className="ep-checkbox" onChange={toggleAuthor}/>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div>
                                        <h4>{t('eventPage.documents.extension')}</h4>
                                        {fileExtensions.map((ext) => (
                                            <div key={ext.extension} className={styles.filterCheckRow}>
                                                <Checkbox
                                                    checked={selectedExtensions.includes(ext.extension)}
                                                    className="ep-checkbox"
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
                                            <h4>{t('eventPage.documents.platforms')}</h4>
                                            {linkSites.map((site) => (
                                                <div key={site.siteKey} className={styles.filterCheckRow}>
                                                    <Checkbox
                                                        checked={selectedLinkSites.includes(site.siteKey)}
                                                        className="ep-checkbox"
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
                                        {t('eventPage.documents.resetFilter')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.controlsRight}>
                        <div className={styles.controlDropdown} ref={sortRef}>
                            <button type="button" className={styles.sortControl} onClick={() => setIsSortOpen((p) => !p)}>
                                <span>{sort === 'Newest' ? t('eventPage.documents.sortNewest') : sort === 'Oldest' ? t('eventPage.documents.sortOldest') : sort === 'TitleAsc' ? t('eventPage.documents.sortTitleAsc') : t('eventPage.documents.sortAuthorAsc')}</span>
                                <ChevronDownIcon className={isSortOpen ? styles.chevronUp : ''}/>
                            </button>
                            {isSortOpen && (
                                <div className={styles.sortMenu}>
                                    <button type="button" onClick={() => { setSort('Newest'); setIsSortOpen(false); }}>{t('eventPage.documents.sortNewest')}</button>
                                    <button type="button" onClick={() => { setSort('Oldest'); setIsSortOpen(false); }}>{t('eventPage.documents.sortOldest')}</button>
                                    <button type="button" onClick={() => { setSort('TitleAsc'); setIsSortOpen(false); }}>{t('eventPage.documents.sortTitleAsc')}</button>
                                    <button type="button" onClick={() => { setSort('AuthorAsc'); setIsSortOpen(false); }}>{t('eventPage.documents.sortAuthorAsc')}</button>
                                </div>
                            )}
                        </div>

                        <div className={styles.viewToggle}>
                            <button
                                type="button"
                                className={`${styles.viewBtn} ${viewMode === 'rows' ? styles.viewBtnActive : ''}`}
                                onClick={() => setViewMode('rows')}
                                aria-label={t('eventPage.documents.rowsView')}
                                title={t('eventPage.documents.rowsView')}
                            >
                                <JustifyIcon/>
                            </button>
                            <button
                                type="button"
                                className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.viewBtnActive : ''}`}
                                onClick={() => setViewMode('cards')}
                                aria-label={t('eventPage.documents.cardsView')}
                                title={t('eventPage.documents.cardsView')}
                            >
                                <StackedIcon/>
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'rows' && hasDocumentsList && (
                    <div className={styles.attachmentsTable}>
                        <div
                            className={`${styles.attachmentsHeader} ${canManageDocuments ? styles.withActions : ''}`}
                        >
                            <span>{t('eventPage.documents.columnName')}</span>
                            <span>{t('eventPage.documents.columnAuthor')}</span>
                            <span>{t('eventPage.documents.columnUploadDate')}</span>
                            <span>{t('eventPage.documents.columnSize')}</span>
                            {canManageDocuments ? <span aria-hidden /> : null}
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
                                            placeholder={t('eventPage.documents.linkTitlePlaceholder')}
                                        />
                                        <input
                                            className={styles.linkInput}
                                            value={linkUrlDraft}
                                            onChange={(e) => setLinkUrlDraft(e.target.value)}
                                            placeholder={t('eventPage.documents.linkUrlPlaceholder')}
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
                                        aria-label={t('common.actions.save')}
                                        title={t('common.actions.save')}
                                    >
                                        <CheckIcon/>
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.iconBtn}
                                        onClick={cancelLink}
                                        aria-label={t('common.actions.cancel')}
                                        title={t('common.actions.cancel')}
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
                                ? new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(att.createdAt))
                                : '—';
                            const size = formatBytes(att.size);
                            const kind = getAttachmentKind(att);
                            return (
                                <div
                                    key={att.id}
                                    role="button"
                                    tabIndex={0}
                                    className={`${styles.attachmentsRow} ${canManageDocuments ? styles.withActions : ''}`}
                                    onClick={() => setAttachmentToOpen(att)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            setAttachmentToOpen(att);
                                        }
                                    }}
                                >
                                    <div className={styles.nameCell}>
                                        {kind === 'Link' ? <LinkIcon className={styles.rowIcon}/> : <FileIcon className={styles.rowIcon}/>}
                                        <span className={styles.nameText}>{title}</span>
                                    </div>
                                    <div className={styles.metaCell}>{author}</div>
                                    <div className={styles.metaCell}>{date}</div>
                                    <div className={styles.metaCell}>{size}</div>
                                    {renderAttachmentActions(att)}
                                </div>
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
                                ? new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(att.createdAt))
                                : '—';
                            const size = formatBytes(att.size);
                            const kind = getAttachmentKind(att);
                            return (
                                <div key={att.id} className={styles.docCard} onClick={() => setAttachmentToOpen(att)}>
                                    <div className={styles.cardTop}>
                                        {kind === 'Link' ? <LinkIcon className={styles.rowIcon}/> : <FileIcon className={styles.rowIcon}/>}
                                        <span className={styles.cardTitle}>{title}</span>
                                        {renderAttachmentActions(att)}
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <span>{author}</span>
                                        <span>{date}</span>
                                        <span>{size}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </EventDocumentSection>
            <hr className={styles.divider} aria-hidden/>
            <EventDocumentSection
                title={t('eventPage.documents.notesTitle')}
                description={notesDescription}
                emptyMessage={t('eventPage.documents.noNotes')}
                headerAction={canManageDocuments ? (
                    <Button
                        type="default"
                        className="ep-btn ep-btn--s ep-btn--filled-gray"
                        onClick={() => {
                            setShowNewNoteForm(true);
                            requestAnimationFrame(() => newNoteTextareaRef.current?.focus());
                        }}
                    >
                        {t('eventPage.documents.createNote')}
                    </Button>
                ) : undefined}
            >
                {notesSectionChildren}
            </EventDocumentSection>

            <ProfileActionModal
                isOpen={Boolean(attachmentToDelete)}
                title={t('eventPage.documents.deleteDocumentTitle')}
                description={
                    attachmentToDelete
                        ? t('eventPage.documents.deleteDocumentDescription', {
                            name: getAttachmentLabel(attachmentToDelete),
                        })
                        : undefined
                }
                onClose={() => {
                    if (isDeletingAttachment) return;
                    setAttachmentToDelete(null);
                }}
                onConfirm={() => void confirmDeleteAttachment()}
                confirmText={t('common.actions.delete')}
                cancelText={t('common.actions.cancel')}
                confirmTone="danger"
                confirmDisabled={isDeletingAttachment}
            />

            <ProfileActionModal
                isOpen={Boolean(attachmentToOpen)}
                title={
                    attachmentToOpen
                        ? (getAttachmentKind(attachmentToOpen) === 'Link'
                            ? t('eventPage.documents.openLinkTitle')
                            : t('eventPage.documents.downloadFileTitle'))
                        : ''
                }
                description={
                    attachmentToOpen
                        ? (getAttachmentKind(attachmentToOpen) === 'Link'
                            ? undefined
                            : t('eventPage.documents.downloadFileDescription', {
                                name: getAttachmentLabel(attachmentToOpen),
                            }))
                        : undefined
                }
                onClose={() => {
                    if (isDownloading) return;
                    setAttachmentToOpen(null);
                }}
                onConfirm={() => void confirmOpenAttachment()}
                confirmText={attachmentToOpen && getAttachmentKind(attachmentToOpen) === 'Link' ? t('eventPage.documents.open') : t('eventPage.documents.download')}
                cancelText={t('common.actions.cancel')}
                confirmDisabled={isDownloading}
            >
                {attachmentToOpen && getAttachmentKind(attachmentToOpen) === 'Link' && (
                    <p className={styles.linkConfirmLine}>
                        {t('eventPage.documents.linkConfirm', {
                            url: attachmentToOpen.resource ?? attachmentToOpen.url ?? '—',
                        })}
                    </p>
                )}
            </ProfileActionModal>
        </div>
    );
};

export default EventDocumentsTab;
