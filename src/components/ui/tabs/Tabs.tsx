import React, {useState} from "react";
import clsx from "clsx";
import styles from "./Tabs.module.scss";
import Badge from "../badge/Badge";

export interface TabItem {
    label: string;
    icon?: React.ReactNode;
    badgeCount?: number;
}

interface TabsProps {
    items: TabItem[];
    initialIndex?: number;
    onChange?: (index: number) => void;
}

const Tabs = ({items, initialIndex = 0, onChange}: TabsProps) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setActiveIndex(index);
        if (onChange) onChange(index);
    };

    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={clsx(styles.tabItem, {[styles.active]: activeIndex === index})}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        {item.icon && <span className={styles.icon}>{item.icon}</span>}
                        <span className={styles.label}>{item.label}</span>
                        {item.badgeCount !== undefined && <Badge count={item.badgeCount}/>}
                    </div>
                ))}

                {hoverIndex !== null && (
                    <div
                        className={styles.hoverIndicator}
                        style={{
                            width: `${100 / items.length}%`,
                            left: `${(100 / items.length) * hoverIndex}%`,
                        }}
                    />
                )}

                <div
                    className={styles.indicator}
                    style={{
                        width: `${100 / items.length}%`,
                        left: `${(100 / items.length) * activeIndex}%`,
                    }}
                />
            </div>
        </div>
    );
};

export default Tabs;
