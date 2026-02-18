import styles from './Divider.module.scss';

interface DividerProps {
    className?: string;
}

export default function Divider({className}: DividerProps) {
    return <div className={className ? `${styles.divider} ${className}` : styles.divider} />;
}
