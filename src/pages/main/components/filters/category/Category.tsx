import {useState, useEffect} from "react";
import {Select} from "antd";
import {useChips} from "@/hooks/ui/useChips.ts";
import styles from "./Category.module.scss";
import {useGetCategoriesQuery} from "@/services/api/categoryApi.ts";
import {Tag} from "antd";

interface CategorySelectProps {
    label?: string;
    error?: boolean;
    helperText?: string;
    options?: { label: string; description?: string }[];
    disabled?: boolean;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onSelectedChange?: (categories: string[]) => void;
    initialCategories?: string[];
}

export default function Tags({
                                      error,
                                      disabled,
                                      isOpen,
                                      onOpenChange,
                                      onSelectedChange,
                                      initialCategories
                                  }: CategorySelectProps) {
    const {chips, inputValue, setInputValue, addChip, removeChip, setChips} = useChips(initialCategories || []);
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const {data: categoriesData, isLoading} = useGetCategoriesQuery();

    const categoryOptions = categoriesData?.result
        ? categoriesData.result.map(category => ({
            label: category.name,
            description: undefined,
            isSelected: chips.includes(category.name)
        }))
        : [];

    const filteredOptions = inputValue
        ? categoryOptions.filter(opt => 
            opt.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        : categoryOptions;

    const tagTextStyleM = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14,
        fontWeight: 450,
        lineHeight: "18px",
        padding: "2px 16px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;

    const actualIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
    const handleOpenChange = (open: boolean) => {
        if (onOpenChange) {
            onOpenChange(open);
        } else {
            setInternalIsOpen(open);
        }
    };

    useEffect(() => {
        if (inputValue && filteredOptions.length > 0) {
            handleOpenChange(true);
        }
    }, [inputValue]);

    useEffect(() => {
        if (initialCategories) {
            setChips(initialCategories);
        }
    }, [initialCategories, setChips]);

    return (
        <div>
            <div className={styles.label}>Теги</div>
            <Select
                className="ep-select"
                placeholder="Выберите тег"
                mode="multiple"
                showSearch
                value={chips}
                searchValue={inputValue}
                onSearch={(value) => {
                    setInputValue(value);
                    if (value) {
                        handleOpenChange(true);
                    }
                }}
                open={actualIsOpen}
                onDropdownVisibleChange={handleOpenChange}
                disabled={disabled || isLoading}
                options={filteredOptions.map((opt) => ({
                    value: opt.label,
                    label: opt.label,
                }))}
                onSelect={(value) => {
                    const next = String(value);
                    if (!chips.includes(next)) {
                        addChip(next);
                        onSelectedChange?.([...chips, next]);
                    }
                    setInputValue('');
                    handleOpenChange(false);
                }}
                onDeselect={(value) => {
                    const next = String(value);
                    if (chips.includes(next)) {
                        removeChip(next);
                        onSelectedChange?.(chips.filter((c) => c !== next));
                    }
                }}
                status={error ? "error" : undefined}
            />

            {chips.length > 0 && (
                <div className={styles.chipContainer}>
                    {chips.map((chip) => (
                        <Tag
                            key={chip}
                            closable
                            onClose={() => {
                                removeChip(chip);
                                const newChips = chips.filter(c => c !== chip);
                                onSelectedChange?.(newChips);
                            }}
                            style={{
                                ...tagTextStyleM,
                                backgroundColor: "transparent",
                                color: "var(--content-primary)",
                                borderColor: "var(--border-primary)",
                            }}
                        >
                            {chip}
                        </Tag>
                    ))}
                </div>
            )}
        </div>
    );
}
