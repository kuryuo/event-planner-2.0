import {
    type ChangeEvent,
    type MouseEvent as ReactMouseEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import EmojiPicker, {type EmojiClickData} from 'emoji-picker-react';
import clsx from 'clsx';
import TextField from '@/ui/text-field/TextField.tsx';
import Avatar from '@/ui/avatar/Avatar.tsx';
import Chip from '@/ui/chip/Chip.tsx';
import ProfileActionModal from '@/components/profile-page/ProfileActionModal.tsx';
import {useGetProfileQuery} from '@/services/api/profileApi.ts';
import {
    useDeleteEventChatMessageMutation,
    useGetEventChatMessagesQuery,
    useLazySearchEventChatMessagesQuery,
    useSendEventChatMessageMutation,
    useSendEventChatMessageWithFilesMutation,
    useUpdateEventChatMessageMutation,
} from '@/services/api/chatApi.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import Link45degIcon from '@/assets/img/icon-m/link-45deg.svg?react';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import ArrowUpRightIcon from '@/assets/img/icon-m/arrow-up-right.svg?react';
import PenIcon from '@/assets/img/icon-m/pen.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import XIcon from '@/assets/img/icon-s/x.svg?react';
import DownloadIcon from '@/assets/img/icon-m/download.svg?react';
import CircleIcon from '@/assets/img/icon-m/circle.svg?react';
import FileLinesIcon from '@/assets/image/file-lines.svg?react';
import styles from './EventChat.module.scss';
import type {ChatAttachment, ChatMessage} from '@/types/api/Chat.ts';

interface EventChatProps {
    eventId: string;
}

interface MenuState {
    message: ChatMessage;
    isOwn: boolean;
    top: number;
    left: number;
}

interface ReplyDraft {
    id: string;
    authorName: string;
    text: string;
}

interface ComposerFile {
    file: File;
    previewUrl?: string;
    previewType: 'image' | 'video' | 'file';
}

const MAX_ATTACHMENTS = 10;

const formatTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--:--';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatDateLabel = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
        return 'Сегодня';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
    }).format(date);
};

const formatBytes = (value?: number | null): string => {
    if (!value || value <= 0) {
        return 'Файл';
    }

    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveAttachmentType = (
    fileName?: string | null,
    contentType?: string | null,
    fallbackUrl?: string | null,
): 'image' | 'video' | 'file' => {
    const normalizedName = (fileName || fallbackUrl || '').toLowerCase();
    const normalizedType = (contentType || '').toLowerCase();

    if (
        normalizedType.startsWith('image/')
        || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(normalizedName)
    ) {
        return 'image';
    }

    if (
        normalizedType.startsWith('video/')
        || /\.(mp4|mov|avi|mkv|webm)$/i.test(normalizedName)
    ) {
        return 'video';
    }

    return 'file';
};

const shortText = (text?: string | null): string => {
    if (!text) {
        return 'Вложение';
    }
    return text.length > 72 ? `${text.slice(0, 72)}...` : text;
};

export default function EventChat({eventId}: EventChatProps) {
    const {data: profile} = useGetProfileQuery();

    const {data: messages = [], isLoading, isFetching} = useGetEventChatMessagesQuery({
        eventId,
        count: 200,
        offset: 0,
    });

    const [triggerSearch, {data: searchedMessages = [], isFetching: isSearchLoading}] = useLazySearchEventChatMessagesQuery();
    const [sendMessage, {isLoading: isSendingText}] = useSendEventChatMessageMutation();
    const [sendMessageWithFiles, {isLoading: isSendingWithFiles}] = useSendEventChatMessageWithFilesMutation();
    const [updateMessage, {isLoading: isUpdatingMessage}] = useUpdateEventChatMessageMutation();
    const [deleteMessage, {isLoading: isDeletingMessage}] = useDeleteEventChatMessageMutation();

    const [text, setText] = useState('');
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [menuState, setMenuState] = useState<MenuState | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<ChatMessage | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState<ReplyDraft | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [composerFiles, setComposerFiles] = useState<ComposerFile[]>([]);
    const [showOldBanner, setShowOldBanner] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages]);

    const messageById = useMemo(() => {
        return new Map(sortedMessages.map((message) => [message.id, message]));
    }, [sortedMessages]);

    const hasOldMessages = useMemo(() => {
        const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
        const threshold = Date.now() - twoWeeksMs;
        return sortedMessages.some((message) => new Date(message.createdAt).getTime() < threshold);
    }, [sortedMessages]);

    const unreadMarkerId = useMemo(() => {
        if (sortedMessages.length < 8) {
            return null;
        }

        return sortedMessages[Math.max(0, sortedMessages.length - 5)].id;
    }, [sortedMessages]);

    const searchResults = useMemo(() => {
        if (!searchText.trim()) {
            return [];
        }

        return searchedMessages;
    }, [searchText, searchedMessages]);

    useEffect(() => {
        if (!isSearchOpen || !searchText.trim()) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            triggerSearch({eventId, text: searchText.trim(), maxResults: 100});
        }, 260);

        return () => window.clearTimeout(timeoutId);
    }, [eventId, isSearchOpen, searchText, triggerSearch]);

    useEffect(() => {
        if (!menuState) {
            return;
        }

        const closeMenu = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuState(null);
            }
        };

        document.addEventListener('mousedown', closeMenu);
        return () => document.removeEventListener('mousedown', closeMenu);
    }, [menuState]);

    useEffect(() => {
        if (!isEmojiOpen) {
            return;
        }

        const closeEmoji = (event: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setIsEmojiOpen(false);
            }
        };

        document.addEventListener('mousedown', closeEmoji);
        return () => document.removeEventListener('mousedown', closeEmoji);
    }, [isEmojiOpen]);

    useEffect(() => {
        const element = messagesContainerRef.current;
        if (!element) {
            return;
        }

        const handleScroll = () => {
            const fromBottom = element.scrollHeight - (element.scrollTop + element.clientHeight);
            setShowOldBanner(fromBottom > 180 && hasOldMessages);
        };

        element.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => element.removeEventListener('scroll', handleScroll);
    }, [hasOldMessages]);

    useEffect(() => {
        if (isLoading || sortedMessages.length === 0) {
            return;
        }

        const element = messagesContainerRef.current;
        if (!element) {
            return;
        }

        const fromBottom = element.scrollHeight - (element.scrollTop + element.clientHeight);
        if (fromBottom < 180) {
            element.scrollTop = element.scrollHeight;
        }
    }, [isLoading, sortedMessages.length]);

    useEffect(() => {
        return () => {
            composerFiles.forEach((item) => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [composerFiles]);

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? []);
        if (selected.length === 0) {
            return;
        }

        setComposerFiles((prev) => {
            const remain = Math.max(0, MAX_ATTACHMENTS - prev.length);
            const nextFiles = selected.slice(0, remain).map((file) => {
                const type = resolveAttachmentType(file.name, file.type, null);
                return {
                    file,
                    previewType: type,
                    previewUrl: type === 'file' ? undefined : URL.createObjectURL(file),
                };
            });

            return [...prev, ...nextFiles];
        });

        event.target.value = '';
    };

    const clearComposer = () => {
        setText('');
        setEditingMessageId(null);
        setReplyDraft(null);
        setComposerFiles((prev) => {
            prev.forEach((item) => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
            return [];
        });
    };

    const handleSend = async () => {
        const trimmedText = text.trim();
        if (!trimmedText && composerFiles.length === 0) {
            return;
        }

        try {
            if (editingMessageId) {
                await updateMessage({
                    eventId,
                    messageId: editingMessageId,
                    text: trimmedText,
                }).unwrap();
                clearComposer();
                return;
            }

            if (composerFiles.length > 0) {
                await sendMessageWithFiles({
                    eventId,
                    text: trimmedText || undefined,
                    files: composerFiles.map((item) => item.file),
                    replyToMessageId: replyDraft?.id,
                }).unwrap();
                clearComposer();
                return;
            }

            await sendMessage({
                eventId,
                text: trimmedText,
                replyToMessageId: replyDraft?.id,
            }).unwrap();

            clearComposer();
        } catch (error) {
            console.error('Не удалось отправить сообщение', error);
        }
    };

    const handleContextMenu = (event: ReactMouseEvent, message: ChatMessage, isOwn: boolean) => {
        event.preventDefault();

        setMenuState({
            message,
            isOwn,
            top: event.clientY,
            left: event.clientX,
        });
    };

    const handleCopyText = async (value: string) => {
        if (!value.trim()) {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
        } catch (error) {
            console.error('Не удалось скопировать текст', error);
        }
    };

    const handleReply = (message: ChatMessage) => {
        setReplyDraft({
            id: message.id,
            authorName: message.authorName || 'Пользователь',
            text: shortText(message.text),
        });
        setEditingMessageId(null);
        setMenuState(null);
    };

    const handleEdit = (message: ChatMessage) => {
        setEditingMessageId(message.id);
        setText(message.text || '');
        setReplyDraft(null);
        setMenuState(null);
    };

    const handleDelete = async () => {
        if (!deleteCandidate) {
            return;
        }

        try {
            await deleteMessage({
                eventId,
                messageId: deleteCandidate.id,
            }).unwrap();
            setDeleteCandidate(null);
            if (editingMessageId === deleteCandidate.id) {
                clearComposer();
            }
        } catch (error) {
            console.error('Не удалось удалить сообщение', error);
        }
    };

    const handleJumpToBottom = () => {
        const element = messagesContainerRef.current;
        if (!element) {
            return;
        }

        element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth',
        });
    };

    const handleSelectSearchMessage = (messageId: string) => {
        setSelectedMessageId(messageId);
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    };

    const resolveReplyPreview = (message: ChatMessage): ReplyDraft | null => {
        if (message.replyToMessage?.id) {
            return {
                id: message.replyToMessage.id,
                authorName: message.replyToMessage.authorName || 'Пользователь',
                text: shortText(message.replyToMessage.text),
            };
        }

        if (message.replyToMessageId && messageById.has(message.replyToMessageId)) {
            const replied = messageById.get(message.replyToMessageId);
            if (!replied) {
                return null;
            }

            return {
                id: replied.id,
                authorName: replied.authorName || 'Пользователь',
                text: shortText(replied.text),
            };
        }

        return null;
    };

    const renderAttachment = (attachment: ChatAttachment) => {
        const fileUrl = buildImageUrl(attachment.filePath) || attachment.filePath || '';
        const type = resolveAttachmentType(attachment.fileName, attachment.contentType, attachment.filePath);

        if (type === 'image' && fileUrl) {
            return (
                <div key={attachment.id} className={styles.imageAttachment}>
                    <div className={styles.imageBackground} style={{backgroundImage: `url(${fileUrl})`}}/>
                    <img src={fileUrl} alt={attachment.fileName || 'image'} className={styles.imageContent}/>
                </div>
            );
        }

        if (type === 'video' && fileUrl) {
            return (
                <div key={attachment.id} className={styles.videoAttachment}>
                    <video src={fileUrl} controls preload="metadata"/>
                </div>
            );
        }

        return (
            <a
                key={attachment.id}
                className={styles.fileAttachmentRow}
                href={fileUrl || '#'}
                target="_blank"
                rel="noreferrer"
            >
                <span className={styles.fileIconWrap}><FileLinesIcon/></span>
                <span className={styles.fileMeta}>
                    <span>{attachment.fileName || 'Файл'}</span>
                    <span>{formatBytes(attachment.size)}</span>
                </span>
                <DownloadIcon className={styles.fileDownloadIcon}/>
            </a>
        );
    };

    const isBusy = isSendingText || isSendingWithFiles || isUpdatingMessage || isDeletingMessage;
    const mediaComposerFiles = composerFiles.filter((item) => item.previewType !== 'file');
    const documentComposerFiles = composerFiles.filter((item) => item.previewType === 'file');

    return (
        <div className={styles.chatWrap}>
            <div className={clsx(styles.chatBody, isSearchOpen && styles.chatBodyWithSearch)}>
                <div className={styles.messagesArea}>
                    <div ref={messagesContainerRef} className={styles.messagesScroll}>
                        {isLoading ? (
                            <div className={styles.centerState}>Загрузка сообщений...</div>
                        ) : sortedMessages.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.cubesPlaceholder}>
                                    {Array.from({length: 18}, (_, index) => <span key={index}/>) }
                                </div>
                                <p>Напишите первое сообщение</p>
                            </div>
                        ) : (
                            <>
                                {sortedMessages.map((message, index) => {
                                    const isOwn = Boolean(profile?.id && message.authorId === profile.id);
                                    const currentDate = formatDateLabel(message.createdAt);
                                    const prevDate = index > 0 ? formatDateLabel(sortedMessages[index - 1].createdAt) : null;
                                    const showDateDivider = Boolean(currentDate && currentDate !== prevDate);
                                    const replyPreview = resolveReplyPreview(message);

                                    return (
                                        <div key={message.id}>
                                            {showDateDivider && (
                                                <div className={styles.dayDivider}>
                                                    <Chip text={currentDate} size="M" variant="filled" color="cyan"/>
                                                </div>
                                            )}

                                            {unreadMarkerId === message.id && (
                                                <div className={styles.unreadDivider}>
                                                    <span>Непрочитанные сообщения</span>
                                                </div>
                                            )}

                                            <div
                                                ref={(element) => {
                                                    messageRefs.current[message.id] = element;
                                                }}
                                                className={clsx(
                                                    styles.messageRow,
                                                    isOwn && styles.own,
                                                    selectedMessageId === message.id && styles.selected,
                                                )}
                                            >
                                                {!isOwn && <CircleIcon className={styles.stubAvatar}/>} 

                                                <div
                                                    className={clsx(styles.bubble, isOwn && styles.ownBubble)}
                                                    onContextMenu={(event) => handleContextMenu(event, message, isOwn)}
                                                >
                                                    {replyPreview && (
                                                        <div className={styles.replyPreview}>
                                                            <ArrowUpRightIcon/>
                                                            <Avatar size="XS" name={replyPreview.authorName}/>
                                                            <span>{replyPreview.authorName}</span>
                                                            <span>{replyPreview.text}</span>
                                                        </div>
                                                    )}

                                                    {!isOwn && <div className={styles.authorName}>{message.authorName || 'Пользователь'}</div>}

                                                    {message.text && (
                                                        <div className={styles.messageTextRow}>
                                                            <p className={styles.messageText}>{message.text}</p>
                                                            <span className={styles.time}>{formatTime(message.createdAt)}</span>
                                                        </div>
                                                    )}

                                                    {Boolean(message.attachments?.length) && (
                                                        <div className={styles.attachmentsBlock}>
                                                            {message.attachments?.map((attachment) => renderAttachment(attachment))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    {showOldBanner && (
                        <div className={styles.oldMessagesBanner}>
                            <span>Вы просматриваете старые сообщения</span>
                            <button onClick={handleJumpToBottom}>Перейти к последним сообщениям</button>
                        </div>
                    )}

                    <div className={styles.composerWrap}>
                        {mediaComposerFiles.length > 0 && (
                            <div className={styles.selectedFilesGrid}>
                                {mediaComposerFiles.map((item, index) => (
                                    <div key={`${item.file.name}-${index}`} className={styles.filePreviewCard}>
                                        {item.previewType === 'image' && item.previewUrl && (
                                            <img src={item.previewUrl} alt={item.file.name} className={styles.previewImage}/>
                                        )}
                                        {item.previewType === 'video' && item.previewUrl && (
                                            <video src={item.previewUrl} className={styles.previewImage}/>
                                        )}
                                        <button
                                            className={styles.removePreview}
                                            onClick={() => {
                                                setComposerFiles((prev) => {
                                                    const targetIndex = prev.findIndex((candidate) => candidate === item);
                                                    if (targetIndex < 0) {
                                                        return prev;
                                                    }
                                                    const next = [...prev];
                                                    const current = next[targetIndex];
                                                    if (current?.previewUrl) {
                                                        URL.revokeObjectURL(current.previewUrl);
                                                    }
                                                    next.splice(targetIndex, 1);
                                                    return next;
                                                });
                                            }}
                                        >
                                            <XIcon/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {documentComposerFiles.length > 0 && (
                            <div className={styles.selectedFilesList}>
                                {documentComposerFiles.map((item, index) => (
                                    <div key={`${item.file.name}-${index}`} className={styles.fileAttachmentRow}>
                                        <span className={styles.fileIconWrap}><FileLinesIcon/></span>
                                        <span className={styles.fileMeta}>
                                            <span>{item.file.name}</span>
                                            <span>{formatBytes(item.file.size)}</span>
                                        </span>
                                        <button
                                            className={styles.fileRemoveRowButton}
                                            onClick={() => {
                                                setComposerFiles((prev) => {
                                                    const targetIndex = prev.findIndex((candidate) => candidate === item);
                                                    if (targetIndex < 0) {
                                                        return prev;
                                                    }
                                                    const next = [...prev];
                                                    const current = next[targetIndex];
                                                    if (current?.previewUrl) {
                                                        URL.revokeObjectURL(current.previewUrl);
                                                    }
                                                    next.splice(targetIndex, 1);
                                                    return next;
                                                });
                                            }}
                                            aria-label="Удалить файл"
                                        >
                                            <XIcon/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {editingMessageId && (
                            <div className={styles.editingBanner}>
                                <PenIcon/>
                                <span>Редактирование сообщения</span>
                                <button onClick={() => setEditingMessageId(null)}><XIcon/></button>
                            </div>
                        )}

                        {replyDraft && (
                            <div className={styles.replyBanner}>
                                <ArrowUpRightIcon/>
                                <Avatar size="S" name={replyDraft.authorName}/>
                                <span>{replyDraft.authorName}</span>
                                <span>{replyDraft.text}</span>
                                <button onClick={() => setReplyDraft(null)}><XIcon/></button>
                            </div>
                        )}

                        <div className={styles.composerRow}>
                            <button className={styles.iconButton} onClick={openFileDialog} aria-label="Прикрепить файл">
                                <Link45degIcon/>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className={styles.hiddenInput}
                                multiple
                                onChange={handleFilesSelected}
                            />

                            <input
                                className={styles.composerInput}
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                                placeholder={editingMessageId ? 'Измените сообщение...' : 'Напишите сообщение...'}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        void handleSend();
                                    }
                                }}
                            />

                            <div className={styles.composerRight}>
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setIsEmojiOpen((prev) => !prev)}
                                    aria-label="Emoji"
                                >
                                    😊
                                </button>

                                <button
                                    className={clsx(styles.iconButton, styles.sendButton)}
                                    onClick={() => void handleSend()}
                                    disabled={isBusy}
                                    aria-label="Отправить"
                                >
                                    <ArrowUpRightIcon/>
                                </button>
                            </div>

                            {isEmojiOpen && (
                                <div className={styles.emojiPanel} ref={emojiRef}>
                                    <EmojiPicker
                                        onEmojiClick={(emojiData: EmojiClickData) => {
                                            setText((prev) => `${prev}${emojiData.emoji}`);
                                        }}
                                        previewConfig={{showPreview: false}}
                                        searchDisabled={false}
                                        skinTonesDisabled
                                        autoFocusSearch={false}
                                        height={320}
                                        width={320}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className={styles.searchToggle}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                    aria-label="Поиск в чате"
                >
                    <SearchIcon/>
                </button>

                {isSearchOpen && (
                    <aside className={styles.searchPanel}>
                        <h3>Поиск в чате</h3>
                        <TextField
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Текст сообщения..."
                            leftIcon={<SearchIcon/>}
                        />

                        {isSearchLoading && <p className={styles.searchState}>Ищем сообщения...</p>}

                        {!isSearchLoading && !searchText.trim() && (
                            <p className={styles.searchState}>Введите запрос, чтобы найти сообщения</p>
                        )}

                        {!isSearchLoading && searchText.trim() && searchResults.length === 0 && (
                            <div className={styles.searchEmpty}>
                                <p>Ничего не найдено</p>
                                <p>Попробуйте изменить запрос</p>
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <>
                                <p className={styles.resultsCount}>Результаты ({searchResults.length})</p>
                                <div className={styles.resultsList}>
                                    {searchResults.map((item) => (
                                        <button
                                            key={item.id}
                                            className={clsx(styles.resultItem, selectedMessageId === item.id && styles.resultActive)}
                                            onClick={() => handleSelectSearchMessage(item.id)}
                                        >
                                            <div className={styles.resultHeader}>
                                                <Avatar size="S" name={item.authorName || 'Пользователь'}/>
                                                <span>{item.authorName || 'Пользователь'}</span>
                                                <span>{formatTime(item.createdAt)}</span>
                                            </div>
                                            <p>{shortText(item.text)}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </aside>
                )}
            </div>

            {menuState && (
                <div
                    className={styles.contextMenu}
                    ref={menuRef}
                    style={{top: menuState.top, left: menuState.left}}
                >
                    <button onClick={() => handleReply(menuState.message)}>
                        <ArrowUpRightIcon/>
                        Ответить
                    </button>

                    {menuState.isOwn && (
                        <button onClick={() => handleEdit(menuState.message)}>
                            <PenIcon/>
                            Редактировать
                        </button>
                    )}

                    <button onClick={() => void handleCopyText(menuState.message.text)}>
                        <Check2Icon/>
                        Копировать текст
                    </button>

                    {menuState.isOwn && (
                        <button className={styles.dangerItem} onClick={() => {
                            setDeleteCandidate(menuState.message);
                            setMenuState(null);
                        }}>
                            <TrashIcon/>
                            Удалить
                        </button>
                    )}
                </div>
            )}

            <ProfileActionModal
                isOpen={Boolean(deleteCandidate)}
                title="Удалить сообщение?"
                onClose={() => setDeleteCandidate(null)}
                onConfirm={() => void handleDelete()}
                confirmText="Удалить"
                confirmTone="danger"
            />

            {isFetching && <div className={styles.loadingOverlay}>Обновляем чат...</div>}
        </div>
    );
}
