import {useEffect, useRef, useState} from "react";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg?react";
import {Calendar} from "antd";
import {Switch} from "antd";
import {Input} from "antd";
import {TimePicker} from "antd";
import dayjs from "dayjs";
import {useDateTime} from "@/hooks/api/useDateTime.ts";
import {useClickOutside} from "@/hooks/ui/useClickOutside.ts";
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

    const [isTimeEnabled, setIsTimeEnabled] = useState(false);
    const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);

    useEffect(() => {
        // Если значения пришли извне (например, редактирование) — показываем поля.
        if (startTime) {
            setIsTimeEnabled(true);
        }
        if (endDate) {
            setIsEndDateEnabled(true);
        }
    }, [startTime, endDate]);

    return (
        <div className={styles.section}>
            <div className={styles.row}>
                <div className={styles.wrapper} data-variant="date" ref={startDatePickerRef}>
                    <CalendarIcon className={styles.icon} onClick={toggleStartDatePicker}/>
                    <Input
                        placeholder="Дата начала"
                        value={formattedStartDate}
                        onClick={toggleStartDatePicker}
                        readOnly
                        className={styles.input}
                    />
                    {showStartDatePicker && (
                        <div className={styles.picker}>
                            <Calendar
                                fullscreen={false}
                                value={startDate ? dayjs(startDate) : undefined}
                                onSelect={(value) => {
                                    setStartDate(value?.toDate());
                                    toggleStartDatePicker();
                                }}
                            />
                        </div>
                    )}
                </div>

                <div
                    className={styles.wrapper}
                    data-variant="time"
                    style={{
                        opacity: isTimeEnabled ? 1 : 0,
                        pointerEvents: isTimeEnabled ? "auto" : "none",
                    }}
                >
                    <TimePicker
                        className={styles.timePicker}
                        placeholder="Время"
                        value={startTime ? dayjs(startTime, "HH:mm") : null}
                        format="HH:mm"
                        minuteStep={5}
                        allowClear={false}
                        needConfirm={false}
                        onChange={(value) => setStartTime(value ? value.format("HH:mm") : "")}
                        inputReadOnly
                    />
                </div>
            </div>

            <div className={styles.toggles}>
                <label className={styles.toggleRow}>
                    <Switch
                        className="ep-switch"
                        checked={isTimeEnabled}
                        onChange={setIsTimeEnabled}
                    />
                    <span className={styles.toggleLabel}>Указать время</span>
                </label>

                <label className={styles.toggleRow}>
                    <Switch
                        className="ep-switch"
                        checked={isEndDateEnabled}
                        onChange={setIsEndDateEnabled}
                    />
                    <span className={styles.toggleLabel}>Дата окончания</span>
                </label>
            </div>

            {isEndDateEnabled ? (
                <div className={styles.row}>
                    <div className={styles.wrapper} data-variant="date" ref={endDatePickerRef}>
                        <CalendarIcon className={styles.icon} onClick={toggleEndDatePicker}/>
                        <Input
                            placeholder="Дата окончания"
                            value={formattedEndDate}
                            onClick={toggleEndDatePicker}
                            readOnly
                            className={styles.input}
                        />
                        {showEndDatePicker && (
                            <div className={styles.picker}>
                                <Calendar
                                    fullscreen={false}
                                    value={endDate ? dayjs(endDate) : undefined}
                                    onSelect={(value) => {
                                        setEndDate(value?.toDate());
                                        toggleEndDatePicker();
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div
                        className={styles.wrapper}
                        data-variant="time"
                        style={{
                            opacity: isTimeEnabled ? 1 : 0,
                            pointerEvents: isTimeEnabled ? "auto" : "none",
                        }}
                    >
                        <TimePicker
                            className={styles.timePicker}
                            placeholder="Время"
                            value={endTime ? dayjs(endTime, "HH:mm") : null}
                            format="HH:mm"
                            minuteStep={5}
                            allowClear={false}
                            needConfirm={false}
                            onChange={(value) => setEndTime(value ? value.format("HH:mm") : "")}
                            inputReadOnly
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

