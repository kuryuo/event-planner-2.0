import {useState, useCallback} from 'react';

export const useChips = (initial: string[] = []) => {
    const [chips, setChips] = useState(initial);
    const [inputValue, setInputValue] = useState('');

    const addChip = useCallback((value: string) => {
        const normalized = value.trim();
        if (!normalized || chips.includes(normalized)) return;
        setChips((prev) => [...prev, normalized]);
    }, [chips]);

    const removeChip = useCallback((value: string) => {
        setChips((prev) => prev.filter((chip) => chip !== value));
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ' ' && inputValue.trim()) {
            event.preventDefault();
            addChip(inputValue);
            setInputValue('');
        }
    };

    return {
        chips,
        inputValue,
        setInputValue,
        addChip,
        removeChip,
        handleKeyDown,
    };
};
