import type {MyAssignedTaskItem} from '@/types/api/Event.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';

export const getTaskAssigneeName = (task: MyAssignedTaskItem): string =>
    String(
        task.assigneeDisplayName
        ?? task.assigneeName
        ?? task.assignedUserName
        ?? 'Исполнитель не назначен',
    );

export const getTaskAssigneeAvatar = (task: MyAssignedTaskItem): string | undefined =>
    buildImageUrl(task.assigneeAvatarUrl ?? task.assigneeAvatar) ?? undefined;

export const getTaskAssigneeId = (task: MyAssignedTaskItem): string | undefined =>
    task.assigneeId ?? task.assignedUserId ?? undefined;
