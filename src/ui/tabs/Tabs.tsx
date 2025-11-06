import React, {useState, useRef, useEffect} from "react";
import clsx from "clsx";
import styles from "./Tabs.module.scss";
import Badge from "../badge/Badge.tsx";

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

const WIDTH_PERCENT = 0.7;
const OFFSET_PERCENT = (1 - WIDTH_PERCENT) / 2;

const Tabs = ({items, initialIndex = 0, onChange}: TabsProps) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [indicatorStyle, setIndicatorStyle] = useState({left: 0, width: 0});
    const [hoverStyle, setHoverStyle] = useState<{ left: number; width: number } | null>(null);
    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

    const calculateStyle = (index: number) => {
        const el = tabRefs.current[index];
        if (!el) return null;
        return {
            left: el.offsetLeft + el.offsetWidth * OFFSET_PERCENT,
            width: el.offsetWidth * WIDTH_PERCENT,
        };
    };

    useEffect(() => {
        const style = calculateStyle(activeIndex);
        if (style) setIndicatorStyle(style);

        const handleResize = () => {
            const style = calculateStyle(activeIndex);
            if (style) setIndicatorStyle(style);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [activeIndex]);

    const handleClick = (index: number) => {
        setActiveIndex(index);
        onChange?.(index);
    };

    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        ref={el => void (tabRefs.current[index] = el)}
                        className={clsx(styles.tabItem, {[styles.active]: activeIndex === index})}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => {
                            const style = calculateStyle(index);
                            if (style) setHoverStyle(style);
                        }}
                        onMouseLeave={() => setHoverStyle(null)}
                    >
                        {item.icon && <span className={styles.icon}>{item.icon}</span>}
                        <span className={styles.label}>{item.label}</span>
                        {item.badgeCount !== undefined && <Badge count={item.badgeCount}/>}
                    </div>
                ))}

                {hoverStyle && (
                    <div
                        className={styles.hoverIndicator}
                        style={{
                            left: `${hoverStyle.left}px`,
                            width: `${hoverStyle.width}px`,
                        }}
                    />
                )}

                <div
                    className={styles.indicator}
                    style={{
                        left: `${indicatorStyle.left}px`,
                        width: `${indicatorStyle.width}px`,
                    }}
                />
            </div>
        </div>
    );
};

export default Tabs;
