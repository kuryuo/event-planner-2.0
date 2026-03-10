import {useMemo, useState} from 'react';
import Button from '@/ui/button/Button.tsx';
import TextArea from '@/ui/text-area/TextArea.tsx';
import {useGetProfileQuery} from '@/services/api/profileApi.ts';
import {
    useGetEventChatMessagesQuery,
    useSendEventChatMessageMutation,
    useSendEventChatMessageWithFilesMutation,
} from '@/services/api/chatApi.ts';
import styles from './EventChat.module.scss';

interface EventChatProps {
    eventId: string;
}

const formatMessageDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export default function EventChat({eventId}: EventChatProps) {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const {data: profile} = useGetProfileQuery();
    const {data: messages, isLoading} = useGetEventChatMessagesQuery({eventId, count: 100, offset: 0});
    const [sendMessage, {isLoading: isSending}] = useSendEventChatMessageMutation();
    const [sendMessageWithFiles, {isLoading: isSendingWithFiles}] = useSendEventChatMessageWithFilesMutation();

    const sortedMessages = useMemo(() => {
        const source = messages ?? [];
        return [...source].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages]);

    const handleSend = async () => {
        const trimmedText = text.trim();
        if (!trimmedText && files.length === 0) return;

        try {
            if (files.length > 0) {
                await sendMessageWithFiles({
                    eventId,
                    text: trimmedText || undefined,
                    files,
                }).unwrap();
            } else {
                await sendMessage({
                    eventId,
                    text: trimmedText,
                }).unwrap();
            }

            setText('');
            setFiles([]);
        } catch (error) {
            console.error('Не удалось отправить сообщение', error);
        }
    };

    return (
        <div className={styles.chatWrap}>
            <div className={styles.messages}>
                {isLoading ? (
                    <div className={styles.empty}>Загрузка сообщений...</div>
                ) : sortedMessages.length === 0 ? (
                    <div className={styles.empty}>Пока нет сообщений</div>
                ) : (
                    sortedMessages.map(message => {
                        const isOwn = !!profile?.id && message.authorId === profile.id;

                        return (
                            <div
                                key={message.id}
                                className={isOwn ? `${styles.messageRow} ${styles.own}` : styles.messageRow}
                            >
                                <div className={styles.meta}>
                                    <span>{message.authorName || 'Пользователь'}</span>
                                    <span>{formatMessageDate(message.createdAt)}</span>
                                </div>
                                <div className={styles.text}>{message.text}</div>
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className={styles.attachments}>
                                        {message.attachments.map(attachment => (
                                            <span key={attachment.id} className={styles.attachment}>
                                                {attachment.fileName || 'Файл'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className={styles.composer}>
                <TextArea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Напишите сообщение"
                />

                <div className={styles.composerActions}>
                    <input
                        type="file"
                        multiple
                        onChange={(event) => {
                            const selectedFiles = Array.from(event.target.files ?? []);
                            setFiles(selectedFiles);
                        }}
                    />
                    {files.length > 0 && <span>Файлов выбрано: {files.length}</span>}
                    <Button
                        variant="Filled"
                        color="purple"
                        onClick={handleSend}
                        disabled={isSending || isSendingWithFiles}
                    >
                        Отправить
                    </Button>
                </div>
            </div>
        </div>
    );
}
