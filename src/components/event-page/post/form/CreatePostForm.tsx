import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import styles from "./CreatePostForm.module.scss";
import Button from "@/ui/button/Button";
import TextField from "@/ui/text-field/TextField";
import TextArea from "@/ui/text-area/TextArea";
import CloseIcon from "@/assets/img/icon-m/x.svg?react";

interface CreatePostFormProps {
    onClose: () => void;
    onSubmit: (title: string, text: string) => void;
    initialTitle?: string;
    initialText?: string;
    isEditMode?: boolean;
    isLoading?: boolean;
}

export default function CreatePostForm({onClose, onSubmit, initialTitle, initialText, isEditMode = false, isLoading = false}: CreatePostFormProps) {
    const {control, handleSubmit, reset} = useForm<{ postTitle: string; postText: string }>({
        defaultValues: {
            postTitle: initialTitle || '',
            postText: initialText || '',
        }
    });

    useEffect(() => {
        reset({
            postTitle: initialTitle || '',
            postText: initialText || '',
        });
    }, [initialTitle, initialText, reset]);

    const handlePublish = handleSubmit((values) => {
        onSubmit(values.postTitle, values.postText);
        reset({postTitle: '', postText: ''});
    });

    const handleClose = () => {
        reset({postTitle: '', postText: ''});
        onClose();
    };

    return (
        <div className={styles.createForm}>
            <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>{isEditMode ? "Редактировать пост" : "Новый пост"}</h3>
                <button
                    className={styles.closeButton}
                    onClick={handleClose}
                    aria-label="Закрыть"
                >
                    <CloseIcon className={styles.closeIcon}/>
                </button>
            </div>
            <div className={styles.formContent}>
                <Controller
                    name="postTitle"
                    control={control}
                    render={({field}) => (
                        <TextField
                            placeholder="Заголовок"
                            value={field.value}
                            onChange={field.onChange}
                            fieldSize="M"
                        />
                    )}
                />
                <Controller
                    name="postText"
                    control={control}
                    render={({field}) => (
                        <TextArea
                            placeholder="Основной текст"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </div>
            <Button
                variant="Filled"
                color="purple"
                onClick={handlePublish}
                className={styles.button}
                disabled={isLoading}
            >
                {isLoading ? "Сохранение..." : (isEditMode ? "Сохранить" : "Опубликовать")}
            </Button>
        </div>
    );
}
