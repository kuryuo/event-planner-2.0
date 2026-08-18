import styles from "./NextEvent.module.scss";
import {Button} from "antd";
import {useI18n} from '@/i18n/I18nProvider';

interface NextEventProps {
    title: string;
    date: string;
    isSubscribed?: boolean;
    isOrganizer?: boolean;
    onAttend?: () => void;
    onDetails?: () => void;
}

export default function NextEvent({
                                      title,
                                      date,
                                      isSubscribed = false,
                                      isOrganizer = false,
                                      onAttend,
                                      onDetails,
                                  }: NextEventProps) {
    const {t} = useI18n();

    return (
        <div className={styles.nextEvent}>
            <div className={styles.label}>{t('sidebar.soon')}</div>
            <div className={styles.title}>{title}</div>
            <div className={styles.date}>{date}</div>
            <div className={styles.actions}>
                {!isOrganizer && (
                    <Button 
                        type={isSubscribed ? "default" : "primary"}
                        className={`ep-btn ep-btn--m ${isSubscribed ? "ep-btn--filled-gray" : "ep-btn--filled-purple"}`}
                        onClick={onAttend}
                    >
                        {isSubscribed ? t('common.actions.leaveEvent') : t('common.actions.joinEvent')}
                    </Button>
                )}
                <Button type="text" className="ep-btn ep-btn--m ep-btn--text" onClick={onDetails}>
                    {t('sidebar.details')}
                </Button>
            </div>
        </div>
    );
}
