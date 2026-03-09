export interface ChatAttachment {
    id: string;
    fileName?: string | null;
    filePath?: string | null;
}

export interface ChatMessage {
    id: string;
    eventId?: string;
    authorId?: string;
    authorName?: string | null;
    text: string;
    createdAt: string;
    isEdited?: boolean;
    attachments?: ChatAttachment[];
}

export interface GetChatMessagesPayload {
    eventId: string;
    count?: number;
    offset?: number;
}

export interface SendChatMessagePayload {
    eventId: string;
    text: string;
    replyToMessageId?: string;
}

export interface SendChatMessageWithFilesPayload {
    eventId: string;
    text?: string;
    files?: File[];
    replyToMessageId?: string;
}
