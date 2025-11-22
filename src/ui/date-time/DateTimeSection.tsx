import {useRef} from "react";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg";
import {SingleDatePicker} from "../date-picker/SingleDatePicker";
import {useDateTime} from "@/hooks/useDateTime";
import {useClickOutside} from "@/hooks/useClickOutside";
import styles from "./DateTimeSection.module.scss";

export default function DateTimeSection() {
    const {
        startDate,
        endDate,
        startTime,
        endTime,
        formattedStartDate,
        formattedEndDate,
        showStartDatePicker,
        showEndDatePicker,
        setStartTime,
        setEndTime,
        setStartDate,
        setEndDate,
        toggleStartDatePicker,
        toggleEndDatePicker,
    } = useDateTime();

    const startDatePickerRef = useRef<HTMLDivElement>(null);
    const endDatePickerRef = useRef<HTMLDivElement>(null);

    useClickOutside(startDatePickerRef, toggleStartDatePicker, showStartDatePicker);
    useClickOutside(endDatePickerRef, toggleEndDatePicker, showEndDatePicker);

    return (
        <div className={styles.section}>
            <div className={styles.title}>
                <span>Дата и место</span>
                <span className={styles.dot}></span>
            </div>
            <div className={styles.inputs}>
                <div className={styles.wrapper} ref={startDatePickerRef}>
                    <img
                        src={CalendarIcon}
                        alt="calendar"
                        className={styles.icon}
                        onClick={toggleStartDatePicker}
                    />
                    <input
                        type="text"
                        placeholder="Дата"
                        className={styles.date}
                        value={formattedStartDate}
                        onClick={toggleStartDatePicker}
                        readOnly
                    />
                    {showStartDatePicker && (
                        <div className={styles.picker}>
                            <SingleDatePicker
                                initialDate={startDate}
                                onDateChange={setStartDate}
                            />
                        </div>
                    )}
                </div>
                <input
                    type="time"
                    className={styles.time}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <span className={styles.sep}>–</span>
                <input
                    type="time"
                    className={styles.time}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                <div className={styles.wrapper} ref={endDatePickerRef}>
                    <img
                        src={CalendarIcon}
                        alt="calendar"
                        className={styles.icon}
                        onClick={toggleEndDatePicker}
                    />
                    <input
                        type="text"
                        placeholder="Дата"
                        className={styles.date}
                        value={formattedEndDate}
                        onClick={toggleEndDatePicker}
                        readOnly
                    />
                    {showEndDatePicker && (
                        <div className={styles.picker}>
                            <SingleDatePicker
                                initialDate={endDate}
                                onDateChange={setEndDate}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
