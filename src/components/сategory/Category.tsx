import React, {useState} from "react";
import Select from "@/ui/select/Select.tsx";
import Chip from "@/ui/chip/Chip";
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
    const [categories, setCategories] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " && inputValue.trim()) {
            e.preventDefault();
            addCategory(inputValue.trim());
            setInputValue("");
        }
    };

    const addCategory = (text: string) => {
        if (!categories.includes(text)) {
            setCategories([...categories, text]);
        }
    };

    const removeCategory = (text: string) => {
        setCategories(categories.filter((c) => c !== text));
    };

    return (
        <div>
            <Select
                options={[
                    {label: 'Просто текст'},
                    {label: 'Просто текст'},
                    {label: 'Просто текст'}
                ]}
                label="Категории"
                error={error}
                helperText={helperText}
                disabled={disabled}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <div className={styles.chipContainer}>
                {categories.map((c) => (
                    <Chip key={c} text={c} closable onClose={() => removeCategory(c)}/>
                ))}
            </div>

            {inputValue && options.length > 0 && !disabled && (
                <div className={styles.menu}>
                    {options
                        .filter((opt) =>
                            opt.label.toLowerCase().includes(inputValue.toLowerCase())
                        )
                        .map((opt) => (
                            <div
                                key={opt.label}
                                className={styles.menuItem}
                                onClick={() => {
                                    addCategory(opt.label);
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
