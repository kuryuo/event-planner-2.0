import {useEffect, useMemo, useState} from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'app-theme-mode';

const resolveInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', theme);
};

/** Вызов до React (например из main.tsx), чтобы :root и Ant совпадали с localStorage до первой отрисовки */
export const applyThemeFromStorage = (): void => {
    if (typeof window === 'undefined') return;
    applyTheme(resolveInitialTheme());
};

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme());

    useEffect(() => {
        applyTheme(theme);
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useMemo(() => () => {
        setTheme((current) => current === 'dark' ? 'light' : 'dark');
    }, []);

    return {theme, isDark: theme === 'dark', toggleTheme};
};
