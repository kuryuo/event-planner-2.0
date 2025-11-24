import Select from "@/ui/select/Select";
import {useChips} from "@/hooks/useChips";
import styles from "./Category.module.scss";

interface CategorySelectProps {
    label?: string;
    error?: boolean;
    helperText?: string;
    options?: { label: string; description?: string }[];
    disabled?: boolean;
}

export default function Category({
                                     error,
                                     helperText,
                                     options = [],
                                     disabled
                                 }: CategorySelectProps) {
    const {inputValue, setInputValue, addChip, handleKeyDown} = useChips();

    return (
        <div>
            <Select
                label="Категории"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                error={error}
                helperText={helperText}
                disabled={disabled}
                options={[
                    {label: 'Просто текст'},
                    {label: 'Просто текст'},
                    {label: 'Просто текст'}
                ]}
            />

            {inputValue && options.length > 0 && !disabled && (
                <div className={styles.menu}>
                    {options
                        .filter((opt) => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
                        .map((opt) => (
                            <div
                                key={opt.label}
                                className={styles.menuItem}
                                onClick={() => {
                                    addChip(opt.label);
                                    setInputValue("");
                                }}
                            >
                                <strong>{opt.label}</strong>
                                {opt.description && <p>{opt.description}</p>}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}