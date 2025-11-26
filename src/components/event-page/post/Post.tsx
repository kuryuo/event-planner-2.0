import {useState} from "react";
import styles from "./Post.module.scss";
import OctopusImg from "@/assets/img/octopus.png";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import Button from "@/ui/button/Button";
import CreatePostForm from "./form/CreatePostForm";

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

    const formatDate = (date: Date): string => {
        return format(date, "d MMMM yyyy", {locale: ru});
    };

    const handleCreatePost = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const handleSubmit = (title: string, text: string) => {
        console.log("Опубликовать пост:", {title, text});
        setIsFormOpen(false);
    };

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
                            <h3 className={styles.postTitle}>{post.title}</h3>
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
