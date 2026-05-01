import {useState} from "react";
import Calendar from "@/pages/main/components/calendar/Calendar";
import { AppShell } from "@/components/app-shell/AppShell";
import Filters from "@/pages/main/components/filters/Filters";
import styles from "./MainPage.module.scss";
import {useGetProfileQuery} from "@/services/api/profileApi.ts";
import type {GetEventsPayload} from "@/types/api/Event.ts";

export default function MainPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<GetEventsPayload | undefined>(undefined);

    useGetProfileQuery();

    return (
        <AppShell
            pageWrapperClassName={styles.pageWrapper}
            sidebarColumnClassName={styles.sidebar}
            sidebarProps={{ notificationCount: 5 }}
        >
            <div className={styles.calendar}>
                <Calendar
                    onFilterClick={() => setShowFilters(prev => !prev)}
                    filters={filters}
                />
            </div>

            {showFilters && (
                <Filters 
                    onClose={() => setShowFilters(false)}
                    onApply={(appliedFilters) => {
                        setFilters(appliedFilters);
                    }}
                    appliedFilters={filters}
                />
            )}
        </AppShell>
    );
}
