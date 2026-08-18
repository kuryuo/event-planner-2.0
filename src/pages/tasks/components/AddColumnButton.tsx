import PlusIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import styles from './AddColumnButton.module.scss';
import {useI18n} from '@/i18n/I18nProvider';

type Props = {
    onClick: () => void;
    disabled?: boolean;
};

export default function AddColumnButton({onClick, disabled = false}: Props) {
    const {t} = useI18n();
    return (
        <button
            type="button"
            className={styles.button}
            onClick={onClick}
            disabled={disabled}
            aria-label={t('common.actions.addColumn')}
            title={t('common.actions.addColumn')}
        >
            <PlusIcon/>
        </button>
    );
}
