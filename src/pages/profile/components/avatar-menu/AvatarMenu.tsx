import {useState} from "react";
import styles from "./AvatarMenu.module.scss";
import Button from "@/ui/button/Button.tsx";
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
                        variant="Text"
                        color="default"
                        leftIcon={<PlusLgIcon/>}
                        onClick={onUpload}
                        className={styles.button}
                    >
                        Загрузить аватар
                    </Button>
                    <Button
                        variant="Text"
                        color="default"
                        leftIcon={<TrashIcon/>}
                        onClick={onClear}
                        className={styles.button}
                    >
                        Очистить
                    </Button>
                </div>
            )}
        </div>
    );
}

