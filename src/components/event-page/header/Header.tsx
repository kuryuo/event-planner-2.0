import styles from './Header.module.scss';
import ChevronLeftIcon from '@/assets/img/icon-s/chevron-left.svg?react';
import Avatar from '@/ui/avatar/Avatar';
import Button from '@/ui/button/Button';
import Tabs, {type TabItem} from '@/ui/tabs/Tabs';

export default function Header() {
    const tabItems: TabItem[] = [
        {label: 'О мероприятии', badgeCount: 3},
        {label: 'Чат'},
        {label: 'Фотографии'},
    ];

    const handleTabChange = (index: number) => {
        console.log('Выбран таб:', index);
    };

    return (
        <header className={styles.header}>
            <button className={styles.backButton}>
                <ChevronLeftIcon className={styles.icon}/>
                <span className={styles.text}>Назад</span>
            </button>

            <div className={styles.main}>
                <div className={styles.left}>
                    <Avatar size="L" name="Название мероприятия"/>
                    <h2 className={styles.title}>Название мероприятия</h2>
                </div>
                <div className={styles.right}>
                    <Button variant="Filled">Я пойду</Button>
                </div>
            </div>

            <div className={styles.tabs}>
                <Tabs items={tabItems} onChange={handleTabChange}/>
            </div>
        </header>
    );
}
