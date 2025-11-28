import {useEffect, type RefObject} from 'react';

export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    handler: () => void,
    isOpen: boolean
) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, handler, isOpen]);
};
