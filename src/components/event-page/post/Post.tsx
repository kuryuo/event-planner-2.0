import {useRef, useState} from "react";
import styles from "./Post.module.scss";
import OctopusImg from "@/assets/img/octopus.png";
import {formatDate} from "@/utils/date.ts";
import Button from "@/ui/button/Button";
import CreatePostForm from "./form/CreatePostForm";
import PenIcon from "@/assets/img/icon-m/pen.svg?react";
import TrashIcon from "@/assets/img/icon-m/trash.svg?react";
import {useClickOutside} from "@/hooks/utils/useClickOutside.ts";

interface Post {
    id: string;
    title: string;
    text: string;
    date: Date;
}

interface PostsProps {
    posts?: Post[];
    isAdmin?: boolean;
}

const mockPosts: Post[] = [
    {
        id: "1",
        title: "Добро пожаловать на мероприятие!",
        text: "Мы рады приветствовать всех участников нашего события. Сегодня вас ждет увлекательная программа с выступлениями спикеров и интересными дискуссиями.",
        date: new Date(2024, 8, 1),
    },
    {
        id: "2",
        title: "Обновление программы",
        text: "Хотим сообщить об изменениях в расписании. Второе выступление переносится на 15:00 вместо 14:30. Просим учесть это при планировании времени.",
        date: new Date(2024, 8, 5),
    },
];

export default function Post({posts = mockPosts, isAdmin = false}: PostsProps) {
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

    const handleSubmit = (title: string, text: string) => {
        if (editingPostId) {
            console.log("Редактировать пост:", {id: editingPostId, title, text});
        } else {
            console.log("Опубликовать пост:", {title, text});
        }
        setIsFormOpen(false);
        setEditingPostId(null);
    };

    const handleEditPost = (postId: string) => {
        setEditingPostId(postId);
        setIsFormOpen(true);
    };

    const handleDeleteMenuClick = (postId: string) => {
        setOpenDeleteMenuId(openDeleteMenuId === postId ? null : postId);
    };

    const handleDeletePost = (postId: string) => {
        console.log("Удалить пост:", postId);
        setOpenDeleteMenuId(null);
    };

    useClickOutside(menuRef, () => setOpenDeleteMenuId(null), isMenuOpen);

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
                    initialTitle={editingPostId ? posts.find(p => p.id === editingPostId)?.title : undefined}
                    initialText={editingPostId ? posts.find(p => p.id === editingPostId)?.text : undefined}
                    isEditMode={editingPostId !== null}
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