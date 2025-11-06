import {useState} from "react";
import styles from "./Checkbox.module.scss";

export function Checkbox() {
    const [checked, setChecked] = useState(false);

    return (
        <label className={styles.checkbox}>
            <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
            />
            <span className={styles.checkmark}></span>
        </label>
    );
}
