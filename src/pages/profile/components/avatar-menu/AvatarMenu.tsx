import {useState} from "react";
import styles from "./AvatarMenu.module.scss";
import {Button} from "antd";
import PlusLgIcon from '@/assets/img/icon-l/plus-lg.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';

interface AvatarMenuProps {
    children: React.ReactNode;
    onUpload?: () => void;
    onClear?: () => void;
}

export default function AvatarMenu({children, onUpload, onClear}: AvatarMenuProps) {
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
                        Загрузить аватар
                    </Button>
                    <Button
                        type="text"
                        icon={<TrashIcon/>}
                        className={`ep-btn ep-btn--m ep-btn--text ${styles.button}`}
                        onClick={onClear}
                    >
                        Очистить
                    </Button>
                </div>
            )}
        </div>
    );
}

