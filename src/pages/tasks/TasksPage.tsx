import Sidebar from '@/components/sidebar/Sidebar';
import styles from './TasksPage.module.scss';

export default function TasksPage() {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={5} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>Мои задачи</h1>
                <p className={styles.subtitle}>Страница в разработке</p>
            </div>
        </div>
    );
}
