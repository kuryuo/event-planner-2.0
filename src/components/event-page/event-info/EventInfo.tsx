import {useState} from "react";
import styles from "./EventInfo.module.scss";
import Chip from "@/ui/chip/Chip";
import type {AppColor} from "@/const";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg?react";
import GeoAltIcon from "@/assets/img/icon-m/geo-alt.svg?react";
import LinkIcon from "@/assets/img/icon-m/link-45deg.svg?react";
import ChevronDownIcon from "@/assets/img/icon-s/chevron-down.svg?react";
import Button from "@/ui/button/Button";

interface EventInfoProps {
    categories?: Array<{ text: string }>;
    date: string;
    location: string;
    description: string;
}

const MAX_DESCRIPTION_LENGTH = 200;
const mockLink = "https://example.com/event"

export default function EventInfo({categories, date, location, description}: EventInfoProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const shouldShowExpandButton = description.length > MAX_DESCRIPTION_LENGTH;
    const displayDescription = isDescriptionExpanded
        ? description
        : description.slice(0, MAX_DESCRIPTION_LENGTH) + (shouldShowExpandButton ? "..." : "");

    return (
        <div className={styles.eventInfo}>
            {categories.length > 0 && (
                <div className={styles.categories}>
                    {categories.map((category, index) => (
                        <Chip
                            key={index}
                            text={category.text}
                            size="M"
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

                <div className={styles.infoRow}>
                    <LinkIcon className={styles.icon}/>
                    <a href={mockLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {mockLink}
                    </a>
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
