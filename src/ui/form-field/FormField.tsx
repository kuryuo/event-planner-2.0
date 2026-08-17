import type {ReactNode} from 'react';

interface FormFieldProps {
    error?: string;
    label?: string;
    children: ReactNode;
}

export const FormField = ({error, label, children}: FormFieldProps) => (
    <div className="ep-field">
        {label ? <span className="ep-field__label">{label}</span> : null}
        {children}
        {error ? (
            <span className="ep-field__helper ep-field__helper--error">{error}</span>
        ) : null}
    </div>
);
