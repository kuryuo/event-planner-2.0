import {useState} from "react";
import CloseIcon from "@/assets/img/icon-m/x.svg";
import DateTimeSection from "../../ui/date-time/DateTimeSection.tsx";
import styles from "./EventForm.module.scss";

export default function EventForm() {
    const [title, setTitle] = useState("");

    return (
        <div className={styles.formWrapper}>
            <div className={styles.header}>
                <input
                    type="text"
                    placeholder="Название мероприятия"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <button className={styles.closeButton}>
                    <img src={CloseIcon} alt="close"/>
                </button>
            </div>
            <div className={styles.form}>
                <DateTimeSection/>
            </div>
        </div>
    );
}