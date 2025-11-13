import styles from "./Checkbox.module.scss";

interface CheckboxProps {
    checked?: boolean;
    onChange?: () => void;
}

export default function Checkbox({checked = false, onChange}: CheckboxProps) {
    return (
        <label className={styles.checkbox}>
            <input type="checkbox" checked={checked} onChange={onChange}/>
            <span className={styles.checkmark}></span>
        </label>
    );
}