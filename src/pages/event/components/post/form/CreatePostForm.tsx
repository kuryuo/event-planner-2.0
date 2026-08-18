import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import styles from "./CreatePostForm.module.scss";
import {Button} from "antd";
import {Input} from "antd";
import CloseIcon from "@/assets/img/icon-m/x.svg?react";
import {useI18n} from '@/i18n/I18nProvider';

interface CreatePostFormProps {
    onClose: () => void;
    onSubmit: (title: string, text: string) => void;
    initialTitle?: string;
    initialText?: string;
    isEditMode?: boolean;
    isLoading?: boolean;
}

export default function CreatePostForm({onClose, onSubmit, initialTitle, initialText, isEditMode = false, isLoading = false}: CreatePostFormProps) {
    const {t} = useI18n();
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
                <h3 className={styles.formTitle}>{isEditMode ? t('eventPage.editPost') : t('eventPage.newPost')}</h3>
                <button
                    className={styles.closeButton}
                    onClick={handleClose}
                    aria-label={t('common.actions.close')}
                >
                    <CloseIcon className={styles.closeIcon}/>
                </button>
            </div>
            <div className={styles.formContent}>
                <Controller
                    name="postTitle"
                    control={control}
                    rules={{required: t('eventPage.enterTitle'), minLength: {value: 3, message: t('eventPage.min3')}}}
                    render={({field}) => (
                        <Input
                            placeholder={t('eventPage.title')}
                            value={field.value}
                            onChange={field.onChange}
                            className="ep-input ep-input--m"
                        />
                    )}
                />
                <Controller
                    name="postText"
                    control={control}
                    rules={{required: t('eventPage.enterPostText'), minLength: {value: 10, message: t('eventPage.min10')}}}
                    render={({field}) => (
                        <Input.TextArea
                            className="ep-textarea"
                            placeholder={t('eventPage.mainText')}
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
                {isLoading ? t('eventPage.saving') : (isEditMode ? t('common.actions.save') : t('eventPage.publish'))}
            </Button>
        </div>
    );
}
