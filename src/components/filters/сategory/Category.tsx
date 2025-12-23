import {useState, useEffect} from "react";
import Select from "@/ui/select/Select.tsx";
import {useChips} from "@/hooks/ui/useChips.ts";
import styles from "./Category.module.scss";
import {useGetCategoriesQuery} from "@/services/api/categoryApi.ts";
import Chip from "@/ui/chip/Chip.tsx";

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

export default function Category({
                                     error,
                                     helperText,
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
            <Select
                label="Категории"
                placeholder="Выберите категорию"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value) {
                        handleOpenChange(true);
                    }
                }}
                onFocus={() => {
                    if (categoryOptions.length > 0) {
                        handleOpenChange(true);
                    }
                }}
                error={error}
                helperText={helperText}
                disabled={disabled || isLoading}
                isOpen={actualIsOpen}
                onOpenChange={handleOpenChange}
                options={filteredOptions}
                selectedValues={chips}
                onOptionClick={(option) => {
                    if (option.label) {
                        if (chips.includes(option.label)) {
                            removeChip(option.label);
                            const newChips = chips.filter(c => c !== option.label);
                            onSelectedChange?.(newChips);
                        } else {
                            addChip(option.label);
                            const newChips = [...chips, option.label];
                            onSelectedChange?.(newChips);
                        }
                        setInputValue('');
                        handleOpenChange(false);
                    }
                }}
            />

            {chips.length > 0 && (
                <div className={styles.chipContainer}>
                    {chips.map((chip) => (
                        <Chip
                            key={chip}
                            text={chip}
                            closable
                            onClose={() => {
                                removeChip(chip);
                                const newChips = chips.filter(c => c !== chip);
                                onSelectedChange?.(newChips);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}