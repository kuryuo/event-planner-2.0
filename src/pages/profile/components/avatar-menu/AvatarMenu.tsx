import {useState} from "react";
import styles from "./AvatarMenu.module.scss";
import {Button} from "antd";
import PlusLgIcon from '@/assets/img/icon-l/plus-lg.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import {useI18n} from '@/i18n/I18nProvider';

interface AvatarMenuProps {
    children: React.ReactNode;
    onUpload?: () => void;
    onClear?: () => void;
}

export default function AvatarMenu({children, onUpload, onClear}: AvatarMenuProps) {
    const {t} = useI18n();
    const [open, setOpen] = useState(false);

    const handleEnter = () => setOpen(true);
    const handleLeave = () => setOpen(false);

    return (
        <div
            className={styles.triggerWrapper}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {children}
            {open && (
                <div
                    className={styles.menu}
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                >
                    <Button
                        type="text"
                        icon={<PlusLgIcon/>}
                        className={`ep-btn ep-btn--m ep-btn--text ${styles.button}`}
                        onClick={onUpload}
                    >
                        {t('profile.uploadAvatar')}
                    </Button>
                    <Button
                        type="text"
                        icon={<TrashIcon/>}
                        className={`ep-btn ep-btn--m ep-btn--text ${styles.button}`}
                        onClick={onClear}
                    >
                        {t('common.actions.clear')}
                    </Button>
                </div>
            )}
        </div>
    );
}

