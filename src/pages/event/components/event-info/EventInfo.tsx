import styles from "./EventInfo.module.scss";
import {hexToAppColor} from "@/const";
import type {VenueFormat} from '@/types/api/Event.ts';
import {formatEventPlaceText} from '@/utils/eventPlace.ts';
import {Tag} from "antd";
import {useI18n} from '@/i18n/I18nProvider';

interface EventInfoProps {
    categories?: Array<{ text: string }>;
    date: string;
    location: string;
    auditorium?: string | null;
    venueFormat?: VenueFormat | null;
    description: string;
    color?: string;
    visitorsCount?: number;
}

export default function EventInfo({
    categories,
    date,
    location,
    auditorium,
    venueFormat,
    description,
    color,
    visitorsCount,
}: EventInfoProps) {
    const {t} = useI18n();

    const appColor = hexToAppColor(color);
    const placeText = formatEventPlaceText({location, auditorium, venueFormat});
    const tagTextStyleM = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14,
        fontWeight: 450,
        lineHeight: "18px",
        padding: "2px 16px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;

    return (
        <div className={styles.eventInfo}>
            <section className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>{t('eventPage.mainInfo')}</h3>
                <div className={styles.infoGrid}>
                    <span className={styles.label}>{t('eventPage.type')}</span>
                    <span className={styles.value}>
                        <Tag
                            bordered={false}
                            style={{
                                ...tagTextStyleM,
                                backgroundColor: `var(--bg-${appColor})`,
                                color: `var(--content-${appColor})`,
                            }}
                        >
                            {categories?.[0]?.text || t('eventPage.event')}
                        </Tag>
                    </span>

                    <span className={styles.label}>{t('eventPage.dateTime')}</span>
                    <span className={styles.value}>{date || t('eventPage.notSpecified')}</span>

                    <span className={styles.label}>{t('eventPage.place')}</span>
                    <span className={styles.value}>{placeText}</span>

                    <span className={styles.label}>{t('eventPage.tags')}</span>
                    <span className={styles.value}>
                        <span className={styles.tagsRow}>
                            {(categories ?? []).map((category) => (
                                <Tag
                                    key={category.text}
                                    bordered
                                    style={{
                                        ...tagTextStyleM,
                                        backgroundColor: "transparent",
                                        color: "var(--content-primary)",
                                        borderColor: "var(--border-primary)",
                                    }}
                                >
                                    {category.text}
                                </Tag>
                            ))}
                        </span>
                    </span>

                    <span className={styles.label}>{t('eventPage.visitors')}</span>
                    <span className={styles.value}>{visitorsCount ?? '—'}</span>
                </div>
            </section>

            <section className={styles.descriptionSection}>
                <h3 className={styles.sectionTitle}>{t('eventPage.description')}</h3>
                <p className={styles.descriptionText}>{description || t('eventPage.noDescription')}</p>
            </section>
        </div>
    );
}
