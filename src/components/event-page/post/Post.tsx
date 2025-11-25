import styles from "./Post.module.scss";
import OctopusImg from "@/assets/img/octopus.png";
import {format} from "date-fns";
import {ru} from "date-fns/locale";

interface Post {
    id: string;
    title: string;
    text: string;
    date: Date;
}

interface PostsProps {
    posts?: Post[];
}

const mockPosts: Post[] = [
    {
        id: "1",
        title: "Добро пожаловать на мероприятие!",
        text: "Мы рады приветствовать всех участников нашего события. Сегодня вас ждет увлекательная программа с выступлениями спикеров и интересными дискуссиями.",
        date: new Date(2024, 8, 1), // 1 сентября 2024
    },
    {
        id: "2",
        title: "Обновление программы",
        text: "Хотим сообщить об изменениях в расписании. Второе выступление переносится на 15:00 вместо 14:30. Просим учесть это при планировании времени.",
        date: new Date(2024, 8, 5), // 5 сентября 2024
    },
];

const emptyPosts: Post[] = [];

export default function Post({posts = mockPosts}: PostsProps) {
    const formatDate = (date: Date): string => {
        return format(date, "d MMMM yyyy", {locale: ru});
    };

    return (
        <div className={styles.posts}>
            <div className={styles.header}>
                <h2 className={styles.title}>Посты</h2>
                <span className={styles.count}>{posts.length}</span>
            </div>

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