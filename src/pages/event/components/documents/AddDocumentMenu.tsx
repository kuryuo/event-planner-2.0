import {useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {Dropdown} from 'antd';
import type {MenuProps} from 'antd';
import FileIcon from '@/assets/image/file.svg?react';
import LinkIcon from '@/assets/image/link.svg?react';
import styles from './AddDocumentMenu.module.scss';

export interface AddDocumentMenuProps {
    trigger: ReactNode;
    onPickFile?: (file: File) => void;
    onAddLink?: () => void;
}

export const AddDocumentMenu = ({
    trigger,
    onPickFile,
    onAddLink,
}: AddDocumentMenuProps) => {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const menuItems: MenuProps['items'] = [
        {
            key: 'file',
            icon: <FileIcon className={styles.icon}/>,
            label: 'Выбрать файл',
            onClick: () => {
                fileInputRef.current?.click();
            },
        },
        {
            key: 'link',
            icon: <LinkIcon className={styles.icon}/>,
            label: 'Добавить ссылку',
            onClick: () => {
                onAddLink?.();
                setOpen(false);
            },
        },
    ];

    return (
        <div className={styles.wrap}>
            <input
                ref={fileInputRef}
                className={styles.fileInput}
                type="file"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (!file) {
                        return;
                    }
                    onPickFile?.(file);
                    setOpen(false);
                }}
            />

            <Dropdown
                trigger={['click']}
                open={open}
                onOpenChange={setOpen}
                menu={{items: menuItems}}
                placement="bottomLeft"
            >
                <span
                    className={styles.trigger}
                    onClick={(event) => event.stopPropagation()}
                >
                    {trigger}
                </span>
            </Dropdown>
        </div>
    );
};
