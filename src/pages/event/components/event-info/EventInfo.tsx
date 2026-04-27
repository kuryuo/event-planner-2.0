import styles from "./EventInfo.module.scss";
import Chip from "@/ui/chip/Chip";
import {hexToAppColor} from "@/const";

interface EventInfoProps {
    categories?: Array<{ text: string }>;
    date: string;
    location: string;
    description: string;
    color?: string;
    visitorsCount?: number;
}

export default function EventInfo({categories, date, location, description, color, visitorsCount}: EventInfoProps) {

    const appColor = hexToAppColor(color);

    return (
        <div className={styles.eventInfo}>
            <section className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Основная информация</h3>
                <div className={styles.infoGrid}>
                    <span className={styles.label}>Тип</span>
                    <span className={styles.value}>
                        <Chip
                            text={categories?.[0]?.text || 'Событие'}
                            size="M"
                            color={appColor}
                            variant="filled"
                        />
                    </span>

                    <span className={styles.label}>Дата и время</span>
                    <span className={styles.value}>{date || 'Не указано'}</span>

                    <span className={styles.label}>Место</span>
                    <span className={styles.value}>{location || 'Не указано'}</span>

                    <span className={styles.label}>Теги</span>
                    <span className={styles.value}>
                        <span className={styles.tagsRow}>
                            {(categories ?? []).map((category) => (
                                <Chip
                                    key={category.text}
                                    text={category.text}
                                    size="M"
                                    variant="outlined"
                                />
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
