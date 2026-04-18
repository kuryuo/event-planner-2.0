import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import CircleIcon from '@/assets/img/icon-l/circle.svg?react';
import CheckCircleIcon from '@/assets/image/check-circle.svg?react';
import WarningCircleIcon from '@/assets/image/warning-circle.svg?react';
import XCircleIcon from '@/assets/image/x-circle.svg?react';
import styles from './ToastProvider.module.scss';

type ToastType = 'info' | 'success' | 'warning' | 'error';

type ToastInput = {
    type?: ToastType;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    durationMs?: number;
};

type ToastItem = ToastInput & {
    id: string;
    durationMs: number;
};

type ToastContextValue = {
    showToast: (toast: ToastInput) => void;
    clearToasts: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const getIconByType = (type: ToastType) => {
    if (type === 'success') return CheckCircleIcon;
    if (type === 'warning') return WarningCircleIcon;
    if (type === 'error') return XCircleIcon;
    return CircleIcon;
};

function ToastCard({toast, count, onClose}: { toast: ToastItem; count: number; onClose: (id: string) => void }) {
    const [progress, setProgress] = useState(100);

    const Icon = getIconByType(toast.type ?? 'info');

    useEffect(() => {
        const startedAt = performance.now();
        const timer = window.setInterval(() => {
            const elapsed = performance.now() - startedAt;
            const next = Math.max(0, 100 - (elapsed / toast.durationMs) * 100);
            setProgress(next);
        }, 100);

        const closeTimer = window.setTimeout(() => onClose(toast.id), toast.durationMs);
        return () => {
            window.clearInterval(timer);
            window.clearTimeout(closeTimer);
        };
    }, [onClose, toast.durationMs, toast.id]);

    return (
        <article className={styles.toast}>
            <div className={`${styles.leadingIcon} ${styles[`icon_${toast.type ?? 'info'}`]}`}>
                <Icon/>
            </div>
            <div className={styles.message}>{toast.message}</div>
            {toast.actionLabel && (
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => {
                        toast.onAction?.();
                        onClose(toast.id);
                    }}
                >
                    {toast.actionLabel}
                </button>
            )}
            <div
                className={styles.counter}
                style={{
                    background: `conic-gradient(var(--bg-brand-green) ${progress * 3.6}deg, transparent 0deg)`,
                }}
            >
                <span>{count}</span>
            </div>
            <button type="button" className={styles.closeButton} onClick={() => onClose(toast.id)}>
                <CircleIcon/>
            </button>
        </article>
    );
}

export function ToastProvider({children}: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const closeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((input: ToastInput) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setToasts((prev) => [{
            id,
            type: input.type ?? 'info',
            message: input.message,
            actionLabel: input.actionLabel,
            onAction: input.onAction,
            durationMs: input.durationMs ?? 5000,
        }, ...prev].slice(0, 4));
    }, []);

    const clearToasts = useCallback(() => setToasts([]), []);

    const value = useMemo(() => ({showToast, clearToasts}), [showToast, clearToasts]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className={styles.viewport}>
                {toasts.map((toast, index) => (
                    <ToastCard
                        key={toast.id}
                        toast={toast}
                        count={toasts.length - index}
                        onClose={closeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
