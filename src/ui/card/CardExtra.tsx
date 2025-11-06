import { CardBase, type CardBaseProps } from './CardBase';
import styles from './Card.module.scss';

interface CardExtraProps extends CardBaseProps {
    addon?: React.ReactNode;
    onAddonClick?: () => void;
}

export function CardExtra({ addon, onAddonClick, ...props }: CardExtraProps) {
    return (
        <CardBase {...props} className={styles.wrapper}>
            {addon && (
                <div
                    className={styles.addon}
                    onClick={onAddonClick}
                    role={onAddonClick ? 'button' : undefined}
                    aria-label={onAddonClick ? 'Action' : undefined}
                >
                    {addon}
                </div>
            )}
        </CardBase>
    );
}
