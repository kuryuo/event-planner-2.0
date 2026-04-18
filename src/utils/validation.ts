export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(\+7|7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
export const TELEGRAM_REGEX = /^@?[a-zA-Z0-9_]{5,32}$/;

export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

export const isValidPhone = (value: string): boolean => {
    const normalized = value.replace(/\s|\(|\)|-/g, '');
    return PHONE_REGEX.test(value.trim()) || /^(\+7|7|8)\d{10}$/.test(normalized);
};

export const isValidTelegram = (value: string): boolean => TELEGRAM_REGEX.test(value.trim());

export const isValidAddress = (value: string): boolean => {
    const trimmed = value.trim();
    return trimmed.length >= 5 && /[\p{L}\p{N}]/u.test(trimmed);
};

export const isValidUrl = (value: string): boolean => {
    try {
        const parsed = new URL(value.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};
