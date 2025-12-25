import {useState} from "react";
import Calendar from "@/components/calendar/Calendar";
import Sidebar from "@/components/sidebar/Sidebar";
import Filters from "@/components/filters/Filters";
import styles from "./MainPage.module.scss";
import {useGetProfileQuery} from "@/services/api/profileApi.ts";
import type {GetEventsPayload} from "@/types/api/Event.ts";

export default function MainPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<GetEventsPayload | undefined>(undefined);

    useGetProfileQuery();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar />
            </div>

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
        </div>
    );
}
