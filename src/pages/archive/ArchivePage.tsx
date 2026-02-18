import Sidebar from '@/components/sidebar/Sidebar';
import styles from './ArchivePage.module.scss';

export default function ArchivePage() {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={5} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>Архив</h1>
                <p className={styles.subtitle}>Страница в разработке</p>
            </div>
        </div>
    );
}
