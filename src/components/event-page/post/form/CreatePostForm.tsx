import {useState} from "react";
import styles from "./CreatePostForm.module.scss";
import Button from "@/ui/button/Button";
import TextField from "@/ui/text-field/TextField";
import TextArea from "@/ui/text-area/TextArea";
import CloseIcon from "@/assets/img/icon-m/x.svg?react";

interface CreatePostFormProps {
    onClose: () => void;
    onSubmit: (title: string, text: string) => void;
}

export default function CreatePostForm({onClose, onSubmit}: CreatePostFormProps) {
    const [postTitle, setPostTitle] = useState("");
    const [postText, setPostText] = useState("");

    const handlePublish = () => {
        onSubmit(postTitle, postText);
        setPostTitle("");
        setPostText("");
    };

    const handleClose = () => {
        setPostTitle("");
        setPostText("");
        onClose();
    };

    return (
        <div className={styles.createForm}>
            <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>Новый пост</h3>
                <button
                    className={styles.closeButton}
                    onClick={handleClose}
                    aria-label="Закрыть"
                >
                    <CloseIcon className={styles.closeIcon}/>
                </button>
            </div>
            <div className={styles.formContent}>
                <TextField
                    placeholder="Заголовок"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    fieldSize="M"
                />
                <TextArea
                    placeholder="Основной текст"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                />
            </div>
            <Button
                variant="Filled"
                color="purple"
                onClick={handlePublish}
                className={styles.button}
            >
                Опубликовать
            </Button>
        </div>
    );
}