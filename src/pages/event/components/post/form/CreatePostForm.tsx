import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import styles from "./CreatePostForm.module.scss";
import {Button} from "antd";
import {Input} from "antd";
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
    const {control, handleSubmit, reset, formState: {errors}} = useForm<{ postTitle: string; postText: string }>({
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
                    rules={{required: 'Введите заголовок', minLength: {value: 3, message: 'Минимум 3 символа'}}}
                    render={({field}) => (
                        <Input
                            placeholder="Заголовок"
                            value={field.value}
                            onChange={field.onChange}
                            className="ep-input ep-input--m"
                        />
                    )}
                />
                <Controller
                    name="postText"
                    control={control}
                    rules={{required: 'Введите текст поста', minLength: {value: 10, message: 'Минимум 10 символов'}}}
                    render={({field}) => (
                        <Input.TextArea
                            className="ep-textarea"
                            placeholder="Основной текст"
                            value={field.value}
                            onChange={field.onChange}
                            autoSize={{minRows: 1}}
                            maxLength={800}
                        />
                    )}
                />
                {(errors.postTitle?.message || errors.postText?.message) && (
                    <div className={styles.error}>{String(errors.postTitle?.message || errors.postText?.message)}</div>
                )}
            </div>
            <Button
                type="primary"
                className={`ep-btn ep-btn--m ep-btn--filled-purple ${styles.button}`}
                onClick={handlePublish}
                disabled={isLoading}
            >
                {isLoading ? "Сохранение..." : (isEditMode ? "Сохранить" : "Опубликовать")}
            </Button>
        </div>
    );
}
