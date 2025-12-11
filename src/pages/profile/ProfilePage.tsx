import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import type {CardBaseProps} from "@/ui/card/CardBase.tsx";
import styles from "./ProfilePage.module.scss";
import ChevronLeftIcon from '@/assets/img/icon-s/chevron-left.svg?react';
import BoxArrowLeftIcon from '@/assets/img/icon-m/box-arrow-left.svg?react';
import ProfileForm from "@/components/profile-page/ProfileForm.tsx";
import {CardBase} from '@/ui/card/CardBase.tsx';
import Button from '@/ui/button/Button.tsx';
import Switch from '@/ui/switch/Switch.tsx';

const subscriptionsData: CardBaseProps[] = [
    {title: "Подписка 1", subtitle: "Описание подписки 1", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"},
    {
        title: "Подписка 2",
        subtitle: "Описание подписки 2",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {title: "Подписка 3", subtitle: "Описание подписки 3", avatarUrl: "https://randomuser.me/api/portraits/men/56.jpg"},
    {title: "Подписка 3", subtitle: "Описание подписки 3", avatarUrl: "https://randomuser.me/api/portraits/men/56.jpg"},
];

export default function ProfilePage() {
    const [subscriptions] = useState<CardBaseProps[]>(subscriptionsData);
    const [isAdmin] = useState(true);
    const [darkTheme, setDarkTheme] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/main');
    };

    const handleSubmit = (data: any) => {
        console.log('Данные профиля:', data);
    };

    const handleCancel = () => {
        navigate('/main');
    };

    const handleLogout = () => {
        console.log('Выход из аккаунта');
        navigate('/');
    };

    const mockUserData = {
        title: "Иванов Иван Иванович",
        subtitle: "email@example.com",
        avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
                    subscriptions={subscriptions}
                    notificationCount={5}
                    isAdmin={isAdmin}
                />
            </div>
            <div className={styles.content}>
                <button className={styles.backButton} onClick={handleBack}>
                    <ChevronLeftIcon className={styles.icon}/>
                    <span className={styles.text}>Назад</span>
                </button>

                <div className={styles.cardWrapper}>
                    <CardBase
                        size="M"
                        title={mockUserData.title}
                        subtitle={mockUserData.subtitle}
                        avatarUrl={mockUserData.avatarUrl}
                    />
                </div>

                <ProfileForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />

                <div className={styles.divider}></div>

                <div className={styles.appearanceSection}>
                    <h3 className={styles.sectionTitle}>Внешний вид</h3>
                    <div className={styles.switchRow}>
                        <Switch
                            checked={darkTheme}
                            onCheckedChange={setDarkTheme}
                            label="Темная тема"
                            labelPosition="right"
                            size="M"
                        />
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.logoutSection}>
                    <Button
                        variant="Text"
                        color="default"
                        onClick={handleLogout}
                        leftIcon={<BoxArrowLeftIcon/>}
                    >
                        Выйти из аккаунта
                    </Button>
                </div>
            </div>
        </div>
    );
}
