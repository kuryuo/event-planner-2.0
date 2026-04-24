import PlusIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import styles from './AddColumnButton.module.scss';

type Props = {
    onClick: () => void;
    disabled?: boolean;
};

export default function AddColumnButton({onClick, disabled = false}: Props) {
    return (
        <button
            type="button"
            className={styles.button}
            onClick={onClick}
            disabled={disabled}
            aria-label="Добавить колонку"
            title="Добавить колонку"
        >
            <PlusIcon/>
        </button>
    );
}
