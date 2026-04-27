import React, {useMemo, useState} from 'react';
import {Tabs as AntTabs} from 'antd';
import type {TabsProps as AntTabsProps} from 'antd';
import styles from './Tabs.module.scss';
import Badge from '../badge/Badge.tsx';

export interface TabItem {
    label: string;
    icon?: React.ReactNode;
    badgeCount?: number;
}

interface AppTabsProps {
    items: TabItem[];
    initialIndex?: number;
    activeIndex?: number;
    onChange?: (index: number) => void;
}

const Tabs = ({items, initialIndex = 0, activeIndex: controlledActiveIndex, onChange}: AppTabsProps) => {
    const [internalKey, setInternalKey] = useState(String(initialIndex));
    const isControlled = controlledActiveIndex !== undefined;
    const activeKey = isControlled ? String(controlledActiveIndex) : internalKey;

    const antItems: AntTabsProps['items'] = useMemo(
        () =>
            items.map((item, index) => ({
                key: String(index),
                label: (
                    <span className={styles.tabLabel}>
                        <span className={styles.icon}>{item.icon ?? <span className={styles.iconPlaceholder}/>}</span>
                        <span className={styles.label}>{item.label}</span>
                        <span className={styles.icon}>
                            {item.badgeCount !== undefined ? (
                                <Badge count={item.badgeCount}/>
                            ) : (
                                <span className={styles.iconPlaceholder}/>
                            )}
                        </span>
                    </span>
                ),
            })),
        [items],
    );

    return (
        <div className={styles.tabsContainer}>
            <AntTabs
                activeKey={activeKey}
                onChange={(key) => {
                    if (!isControlled) {
                        setInternalKey(key);
                    }
                    onChange?.(Number(key));
                }}
                items={antItems}
                className={styles.antTabs}
                tabBarGutter={0}
            />
        </div>
    );
};

export default Tabs;
