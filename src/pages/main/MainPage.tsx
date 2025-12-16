import {useState} from "react";
import Calendar from "@/components/calendar/Calendar";
import Sidebar from "@/components/sidebar/Sidebar";
import Filters from "@/components/filters/Filters";
import styles from "./MainPage.module.scss";
import {useGetProfileQuery} from "@/services/api/profileApi.ts";

export default function MainPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [isAdmin] = useState(true);

    useGetProfileQuery();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar
                    isAdmin={isAdmin}
                    notificationCount={5}
                />
            </div>

            <div className={styles.calendar}>
                <Calendar
                    onFilterClick={() => setShowFilters(prev => !prev)}
                />

                {showFilters && <div className={styles.overlay}/>}
            </div>

            {showFilters && (
                <div className={styles.filters}>
                    <Filters onClose={() => setShowFilters(false)}/>
                </div>
            )}
        </div>
    );
}
