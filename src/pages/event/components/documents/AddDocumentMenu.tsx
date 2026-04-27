import {useRef, useState} from 'react';
import FileIcon from '@/assets/image/file.svg?react';
import LinkIcon from '@/assets/image/link.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';
import styles from './AddDocumentMenu.module.scss';

export interface AddDocumentMenuProps {
    trigger: React.ReactNode;
    onPickFile?: (file: File) => void;
    onAddLink?: () => void;
}

export const AddDocumentMenu = ({
    trigger,
    onPickFile,
    onAddLink,
}: AddDocumentMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useClickOutside(wrapRef, () => setIsOpen(false), isOpen);

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.wrap} ref={wrapRef}>
            <span
                onClick={(event) => {
                    event.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
            >
                {trigger}
            </span>

            <input
                ref={fileInputRef}
                className={styles.fileInput}
                type="file"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (!file) return;
                    onPickFile?.(file);
                    setIsOpen(false);
                }}
            />

            {isOpen && (
                <div className={styles.menu} role="menu">
                    <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => {
                            openFileDialog();
                        }}
                        role="menuitem"
                    >
                        <FileIcon className={styles.icon}/>
                        Выбрать файл
                    </button>
                    <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => {
                            onAddLink?.();
                            setIsOpen(false);
                        }}
                        role="menuitem"
                    >
                        <LinkIcon className={styles.icon}/>
                        Добавить ссылку
                    </button>
                </div>
            )}
        </div>
    );
};

