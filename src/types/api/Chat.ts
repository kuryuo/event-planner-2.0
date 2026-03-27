export interface ChatAttachment {
    id: string;
    fileName?: string | null;
    filePath?: string | null;
    contentType?: string | null;
    size?: number | null;
}

export interface ChatReplyMessage {
    id: string;
    authorName?: string | null;
    text?: string | null;
}

export interface ChatMessage {
    id: string;
    eventId?: string;
    authorId?: string;
    authorName?: string | null;
    authorAvatarUrl?: string | null;
    text: string;
    createdAt: string;
    isEdited?: boolean;
    replyToMessageId?: string | null;
    replyToMessage?: ChatReplyMessage | null;
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

export interface SearchChatMessagesPayload {
    eventId: string;
    text: string;
    maxResults?: number;
}

export interface UpdateChatMessagePayload {
    eventId: string;
    messageId: string;
    text?: string;
    removeAttachmentIds?: string[];
}

export interface DeleteChatMessagePayload {
    eventId: string;
    messageId: string;
}

export interface AddChatMessageAttachmentsPayload {
    eventId: string;
    messageId: string;
    files: File[];
}

export interface DeleteChatMessageAttachmentPayload {
    eventId: string;
    messageId: string;
    attachmentId: string;
}
