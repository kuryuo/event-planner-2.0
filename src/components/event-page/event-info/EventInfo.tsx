import {useState} from "react";
import styles from "./EventInfo.module.scss";
import Chip from "@/ui/chip/Chip";
import type {AppColor} from "@/const";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg";
import LinkIcon from "@/assets/img/icon-m/link-45deg.svg";
import ChevronDownIcon from "@/assets/img/icon-s/chevron-down.svg";

interface EventInfoProps {
    categories?: Array<{ text: string; color?: AppColor }>;
}

const MAX_DESCRIPTION_LENGTH = 200;

const mockCategories = [
    {text: "Технологии", color: "blue" as AppColor},
    {text: "Конференция", color: "purple" as AppColor},
    {text: "Онлайн", color: "green" as AppColor},
];

const mockDate = "15 декабря 2024, 18:00";
const mockLocation = "Москва, ул. Тверская, д. 10, офис 205";
const mockLink = "https://example.com/event";
const mockDescription = `Это очень длинное описание мероприятия, которое содержит много информации о том, что будет происходить на событии. Здесь может быть подробная информация о программе, спикерах, темах выступлений и многом другом. Описание может быть настолько длинным, что не поместится на экране, поэтому нужна кнопка для раскрытия полного текста. Это позволит пользователям сначала увидеть краткую версию, а затем при желании прочитать всё описание полностью.`;

export default function EventInfo({categories = mockCategories}: EventInfoProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const shouldShowExpandButton = mockDescription.length > MAX_DESCRIPTION_LENGTH;
    const displayDescription = isDescriptionExpanded
        ? mockDescription
        : mockDescription.slice(0, MAX_DESCRIPTION_LENGTH) + (shouldShowExpandButton ? "..." : "");

    return (
        <div className={styles.eventInfo}>
            {categories.length > 0 && (
                <div className={styles.categories}>
                    {categories.map((category, index) => (
                        <Chip
                            key={index}
                            text={category.text}
                            size="M"
                            color={category.color}
                        />
                    ))}
                </div>
            )}

            <div className={styles.infoBlock}>
                <div className={styles.infoRow}>
                    <img src={CalendarIcon} alt="Календарь" className={styles.icon}/>
                    <span className={styles.infoText}>{mockDate}</span>
                </div>

                <div className={styles.infoRow}>
                    <img src={GeoAltIcon} alt="Местоположение" className={styles.icon}/>
                    <span className={styles.infoText}>{mockLocation}</span>
                </div>

                <div className={styles.infoRow}>
                    <img src={LinkIcon} alt="Ссылка" className={styles.icon}/>
                    <a href={mockLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {mockLink}
                    </a>
                </div>
            </div>

            <div className={styles.description}>
                <p className={styles.descriptionText}>{displayDescription}</p>
                {shouldShowExpandButton && (
                    <button
                        className={styles.expandButton}
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                        <img
                            src={ChevronDownIcon}
                            alt={isDescriptionExpanded ? "Свернуть" : "Развернуть"}
                            className={`${styles.chevronIcon} ${isDescriptionExpanded ? styles.expanded : ""}`}
                        />
                        <span>{isDescriptionExpanded ? "Свернуть" : "Показать всё"}</span>
                    </button>
                )}
            </div>
        </div>
    );
}