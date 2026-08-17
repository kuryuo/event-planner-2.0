import type {ReactNode} from 'react';
import styles from './AuthForm.module.scss';

interface AuthLayoutProps {
    title: string;
    children: ReactNode;
}

export const AuthLayout = ({title, children}: AuthLayoutProps) => (
    <div className={styles.container}>
        <div className={styles.form}>
            <h2 className={styles.title}>{title}</h2>
            {children}
        </div>
    </div>
);
