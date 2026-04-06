import PlusIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import styles from './AddColumnButton.module.scss';

type Props = {
    onClick: () => void;
};

export default function AddColumnButton({onClick}: Props) {
    return (
        <button type="button" className={styles.button} onClick={onClick} aria-label="Добавить колонку" title="Добавить колонку">
            <PlusIcon/>
        </button>
    );
}
