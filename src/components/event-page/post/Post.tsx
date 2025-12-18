import {useRef, useState} from "react";
import styles from "./Post.module.scss";
import OctopusImg from "@/assets/img/octopus.png";
import {formatDate} from "@/utils/date.ts";
import Button from "@/ui/button/Button";
import CreatePostForm from "./form/CreatePostForm";
import PenIcon from "@/assets/img/icon-m/pen.svg?react";
import TrashIcon from "@/assets/img/icon-m/trash.svg?react";
import {useClickOutside} from "@/hooks/ui/useClickOutside.ts";
import {useEventPosts} from "@/hooks/api/useEventPosts.ts";

interface PostsProps {
    eventId: string;
    isAdmin?: boolean;
}

export default function Post({eventId, isAdmin = false}: PostsProps) {
    const {
        posts,
        isLoading,
        createPost,
        updatePost,
        deletePost,
        isCreating,
        isUpdating,
    } = useEventPosts(eventId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [openDeleteMenuId, setOpenDeleteMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isMenuOpen = openDeleteMenuId !== null;

    const handleCreatePost = () => {
        setEditingPostId(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPostId(null);
    };

    const handleSubmit = async (_title: string, text: string) => {
        try {
            if (editingPostId) {
                await updatePost(editingPostId, text);
            } else {
                await createPost(text);
            }
            setIsFormOpen(false);
            setEditingPostId(null);
        } catch (error) {
            console.error("Ошибка при сохранении поста:", error);
        }
    };

    const handleEditPost = (postId: string) => {
        setEditingPostId(postId);
        setIsFormOpen(true);
    };

    const handleDeleteMenuClick = (postId: string) => {
        setOpenDeleteMenuId(openDeleteMenuId === postId ? null : postId);
    };

    const handleDeletePost = async (postId: string) => {
        try {
            await deletePost(postId);
            setOpenDeleteMenuId(null);
        } catch (error) {
            console.error("Ошибка при удалении поста:", error);
        }
    };

    useClickOutside(menuRef, () => setOpenDeleteMenuId(null), isMenuOpen);

    const editingPost = editingPostId ? posts.find(p => p.id === editingPostId) : null;

    if (isLoading) {
        return (
            <div className={styles.posts}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Посты</h2>
                </div>
                <div>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.posts}>
            <div className={styles.header}>
                <h2 className={styles.title}>Посты</h2>
                <span className={styles.count}>{posts.length}</span>
            </div>

            {isAdmin && !isFormOpen && (
                <Button variant="Filled" color="gray" onClick={handleCreatePost}>
                    Создать пост
                </Button>
            )}

            {isFormOpen && (
                <CreatePostForm
                    onClose={handleCloseForm}
                    onSubmit={handleSubmit}
                    initialTitle={editingPost?.title}
                    initialText={editingPost?.text}
                    isEditMode={editingPostId !== null}
                    isLoading={isCreating || isUpdating}
                />
            )}

            {posts.length === 0 ? (
                <div className={styles.emptyState}>
                    <img src={OctopusImg} alt="Нет постов" className={styles.octopusImage}/>
                    <p className={styles.emptyText}>Ждем новые посты...</p>
                </div>
            ) : (
                <div className={styles.postsList}>
                    {posts.map((post) => (
                        <article key={post.id} className={styles.post}>
                            <div className={styles.postTitleWrapper}>
                                <h3 className={styles.postTitle}>{post.title}</h3>
                                {isAdmin && (
                                    <div className={styles.postActions}>
                                        <button
                                            className={styles.postActionBtn}
                                            onClick={() => handleEditPost(post.id)}
                                            aria-label="Редактировать пост"
                                        >
                                            <PenIcon/>
                                        </button>
                                        <div
                                            className={styles.deleteMenuWrapper}
                                            ref={openDeleteMenuId === post.id ? menuRef : null}
                                        >
                                            <button
                                                className={styles.postActionBtn}
                                                onClick={() => handleDeleteMenuClick(post.id)}
                                                aria-label="Удалить пост"
                                            >
                                                <TrashIcon/>
                                            </button>
                                            {openDeleteMenuId === post.id && (
                                                <div className={styles.dropdown}>
                                                    <Button
                                                        variant="Text"
                                                        color="red"
                                                        leftIcon={<TrashIcon className={styles.trashIcon}/>}
                                                        onClick={() => handleDeletePost(post.id)}
                                                    >
                                                        Удалить пост
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className={styles.postText}>{post.text}</p>
                            <div className={styles.postFooter}>
                                <time className={styles.postDate}>{formatDate(post.date)}</time>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}