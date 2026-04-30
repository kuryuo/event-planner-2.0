import styles from "./EventInfo.module.scss";
import {hexToAppColor} from "@/const";
import type {VenueFormat} from '@/types/api/Event.ts';
import {formatEventPlaceText} from '@/utils/eventPlace.ts';
import {Tag} from "antd";

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
                <h3 className={styles.sectionTitle}>Основная информация</h3>
                <div className={styles.infoGrid}>
                    <span className={styles.label}>Тип</span>
                    <span className={styles.value}>
                        <Tag
                            bordered={false}
                            style={{
                                ...tagTextStyleM,
                                backgroundColor: `var(--bg-${appColor})`,
                                color: `var(--content-${appColor})`,
                            }}
                        >
                            {categories?.[0]?.text || 'Событие'}
                        </Tag>
                    </span>

                    <span className={styles.label}>Дата и время</span>
                    <span className={styles.value}>{date || 'Не указано'}</span>

                    <span className={styles.label}>Место</span>
                    <span className={styles.value}>{placeText}</span>

                    <span className={styles.label}>Теги</span>
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

                    <span className={styles.label}>Посетители</span>
                    <span className={styles.value}>{visitorsCount ?? '—'}</span>
                </div>
            </section>

            <section className={styles.descriptionSection}>
                <h3 className={styles.sectionTitle}>Описание</h3>
                <p className={styles.descriptionText}>{description || 'Описание отсутствует'}</p>
            </section>
        </div>
    );
}
