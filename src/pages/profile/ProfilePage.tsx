import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import styles from "./ProfilePage.module.scss";
import ChevronLeftIcon from '@/assets/img/icon-s/chevron-left.svg?react';
import BoxArrowLeftIcon from '@/assets/img/icon-m/box-arrow-left.svg?react';
import ProfileForm from "@/components/profile-page/ProfileForm.tsx";
import {Card} from '@/ui/card/Card.tsx';
import AvatarMenu from "@/components/profile-page/AvatarMenu.tsx";
import Button from '@/ui/button/Button.tsx';
import Switch from '@/ui/switch/Switch.tsx';
import {useGetProfileQuery, useUpdateProfileMutation} from "@/services/api/profileApi.ts";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import type {UpdateUserProfilePayload} from "@/types/api/Profile.ts";
import {useAuth} from "@/hooks/api/useAuth.ts";
import {useAvatarUpload} from "@/hooks/api/useAvatarUpload.ts";

export default function ProfilePage() {
    const [isAdmin] = useState(true);
    const [darkTheme, setDarkTheme] = useState(false);
    const navigate = useNavigate();
    const {logout} = useAuth();
    const {data: profile, isLoading} = useGetProfileQuery();
    const [updateProfile, {isLoading: isUpdating}] = useUpdateProfileMutation();
    const {
        fileInputRef,
        isUploading,
        triggerFileDialog,
        handleFileChange,
    } = useAvatarUpload();

    const handleBack = () => {
        navigate('/main');
    };

    const handleSubmit = async (data: UpdateUserProfilePayload) => {
        try {
            await updateProfile(data).unwrap();
        } catch (err) {
            console.error('Ошибка обновления профиля', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=50';
    const fullName = `${profile?.lastName ?? ''} ${profile?.firstName ?? ''} ${profile?.middleName ?? ''}`.trim() || '—';

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
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
                    <AvatarMenu
                        onUpload={triggerFileDialog}
                        onClear={() => console.log('Очистить аватар')}
                    >
                        <Card
                            size="M"
                            title={fullName}
                            subtitle={profile?.city ?? ''}
                            avatarUrl={buildImageUrl(profile?.avatarUrl) ?? fallbackAvatar}
                        />
                    </AvatarMenu>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{display: 'none'}}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </div>

                <ProfileForm
                    onSubmit={handleSubmit}
                    loading={isLoading || isUpdating}
                    initialData={{
                        firstName: profile?.firstName,
                        lastName: profile?.lastName,
                        middleName: profile?.middleName ?? '',
                        city: profile?.city ?? '',
                        phoneNumber: profile?.phoneNumber ?? '',
                        telegram: profile?.telegram ?? '',
                    }}
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
