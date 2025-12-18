import {useMemo} from 'react';
import {
    useGetEventPostsQuery,
    useCreateEventPostMutation,
    useUpdateEventPostMutation,
    useDeleteEventPostMutation,
} from '@/services/api/eventPostApi.ts';

export interface Post {
    id: string;
    title: string;
    text: string;
    date: Date;
    createdAt: string;
    eventId: string;
    authorId: string;
}

export interface UseEventPostsOutput {
    posts: Post[];
    isLoading: boolean;
    error: unknown;
    createPost: (text: string) => Promise<void>;
    updatePost: (postId: string, text: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

export const useEventPosts = (eventId: string | null): UseEventPostsOutput => {
    const {data, isLoading, error} = useGetEventPostsQuery(
        {eventId: eventId ?? '', count: 10},
        {skip: !eventId}
    );

    const [createPostMutation, {isLoading: isCreating}] = useCreateEventPostMutation();
    const [updatePostMutation, {isLoading: isUpdating}] = useUpdateEventPostMutation();
    const [deletePostMutation, {isLoading: isDeleting}] = useDeleteEventPostMutation();

    const posts = useMemo(() => {
        if (!data?.result) return [];

        return data.result.map((post) => ({
            id: post.id,
            title: 'Заголовок поста',
            text: post.text,
            date: new Date(post.createdAt),
            createdAt: post.createdAt,
            eventId: post.eventId,
            authorId: post.authorId,
        }));
    }, [data]);

    const createPost = async (text: string) => {
        if (!eventId) return;
        await createPostMutation({eventId, text}).unwrap();
    };

    const updatePost = async (postId: string, text: string) => {
        if (!eventId) return;
        await updatePostMutation({eventId, postId, text}).unwrap();
    };

    const deletePost = async (postId: string) => {
        if (!eventId) return;
        await deletePostMutation({eventId, postId}).unwrap();
    };

    return {
        posts,
        isLoading,
        error,
        createPost,
        updatePost,
        deletePost,
        isCreating,
        isUpdating,
        isDeleting,
    };
};

