import Select from "@/ui/select/Select.tsx";
import {useChips} from "@/hooks/ui/useChips.ts";
import styles from "./Category.module.scss";
import {useGetCategoriesQuery} from "@/services/api/categoryApi.ts";

interface CategorySelectProps {
    label?: string;
    error?: boolean;
    helperText?: string;
    options?: { label: string; description?: string }[];
    disabled?: boolean;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function Category({
                                     error,
                                     helperText,
                                     disabled,
                                     isOpen,
                                     onOpenChange
                                 }: CategorySelectProps) {
    const {inputValue, setInputValue, addChip, handleKeyDown} = useChips();
    const {data: categoriesData, isLoading} = useGetCategoriesQuery();

    const categoryOptions = categoriesData?.result
        ? categoriesData.result.map(category => ({
            label: category.name,
            description: undefined
        }))
        : [];

    return (
        <div>
            <Select
                label="Категории"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                error={error}
                helperText={helperText}
                disabled={disabled || isLoading}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                options={categoryOptions}
            />

            {inputValue && categoryOptions.length > 0 && !disabled && (
                <div className={styles.menu}>
                    {categoryOptions
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