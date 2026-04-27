import type {ReactNode} from 'react';

export interface Option {
    label?: string;
    description?: string;
    content?: ReactNode;
    isDivider?: boolean;
}
