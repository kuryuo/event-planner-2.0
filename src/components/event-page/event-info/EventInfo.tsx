import {useState} from "react";
import styles from "./EventInfo.module.scss";
import Chip from "@/ui/chip/Chip";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg?react";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg?react";
import ChevronDownIcon from "@/assets/img/icon-s/chevron-down.svg?react";
import Button from "@/ui/button/Button";
import {hexToAppColor} from "@/const";

interface EventInfoProps {
    categories?: Array<{ text: string }>;
    date: string;
    location: string;
    description: string;
    color?: string;
}

const MAX_DESCRIPTION_LENGTH = 200;

export default function EventInfo({categories, date, location, description, color}: EventInfoProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const shouldShowExpandButton = description.length > MAX_DESCRIPTION_LENGTH;
    const displayDescription = isDescriptionExpanded
        ? description
        : description.slice(0, MAX_DESCRIPTION_LENGTH) + (shouldShowExpandButton ? "..." : "");

    const appColor = hexToAppColor(color);

    return (
        <div className={styles.eventInfo}>
            {categories && categories.length > 0 && (
                <div className={styles.categories}>
                    {categories.map((category, index) => (
                        <Chip
                            key={index}
                            text={category.text}
                            size="M"
                            color={appColor}
                        />
                    ))}
                </div>
            )}

            <div className={styles.infoBlock}>
                <div className={styles.infoRow}>
                    <CalendarIcon className={styles.icon}/>
                    <span className={styles.infoText}>{date}</span>
                </div>

                <div className={styles.infoRow}>
                    <GeoAltIcon className={styles.icon}/>
                    <span className={styles.infoText}>{location}</span>
                </div>
            </div>

            <div className={styles.description}>
                <p className={styles.descriptionText}>{displayDescription}</p>
                {shouldShowExpandButton && (
                    <Button
                        variant="Text"
                        size="XS"
                        leftIcon={
                            <ChevronDownIcon
                                aria-label={isDescriptionExpanded ? "Свернуть" : "Развернуть"}
                                className={`${isDescriptionExpanded ? styles.expanded : ""}`}
                            />
                        }
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className={styles.expandButton}
                    >
                        {isDescriptionExpanded ? "Свернуть" : "Показать всё"}
                    </Button>
                )}
            </div>
        </div>
    );
}
