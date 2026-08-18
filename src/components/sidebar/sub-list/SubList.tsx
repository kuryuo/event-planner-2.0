import {Avatar, Badge} from "antd";
import styles from './SubList.module.scss';
import {useI18n} from '@/i18n/I18nProvider';

interface SublistProps {
    title?: string;
    items: Array<{
        title: string;
        subtitle?: string;
        avatarUrl?: string;
        onClick?: () => void;
    }>;
}

export function Sublist({title, items}: SublistProps) {
    const {t} = useI18n();
    const resolvedTitle = title ?? t('sidebar.mySubscriptions');

    return (
        <div className={styles.sublist}>
            <div className={styles.header}>
                <h3 className={styles.title}>{resolvedTitle}</h3>
                <span className={styles.count}>{items.length}</span>
            </div>

            {items.length === 0 ? (
                <div className={styles.empty}>{t('sidebar.noSubscriptions')}</div>
            ) : (
                <div className={styles.list}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            onClick={item.onClick}
                            role={item.onClick ? "button" : undefined}
                            tabIndex={item.onClick ? 0 : undefined}
                            style={{display: "flex", alignItems: "center", gap: 12}}
                        >
                            <Avatar className="ep-avatar" size={36} src={item.avatarUrl}>
                                {(item.title?.[0] ?? "—").toUpperCase()}
                            </Avatar>
                            <div style={{display: "flex", flexDirection: "column", minWidth: 0, flex: 1}}>
                                <span style={{fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                    {item.title}
                                </span>
                                {item.subtitle ? (
                                    <span style={{color: "var(--content-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                        {item.subtitle}
                                    </span>
                                ) : null}
                            </div>
                            <Badge dot className="ep-badge--dot" />
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
