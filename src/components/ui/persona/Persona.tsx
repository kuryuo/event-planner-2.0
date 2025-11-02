import clsx from 'clsx';
import styles from './Persona.module.scss';
import Avatar from '../avatar/Avatar';

type PersonaSize = 'M' | 'S';

interface PersonaProps {
    size?: PersonaSize;
    name: string;
    avatarUrl?: string;
    comment?: string;
    hasButton?: boolean;
    onButtonClick?: () => void;
    avatarVariant?: 'default' | 'update';
}

export default function Persona({
                                    size = 'M',
                                    name,
                                    avatarUrl,
                                    comment,
                                    hasButton,
                                    onButtonClick,
                                    avatarVariant = 'default',
                                }: PersonaProps) {

    return (
        <div className={clsx(styles.wrapper, styles[size])}>
            <Avatar
                size={size}
                variant={avatarVariant}
                avatarUrl={avatarUrl}
                name={name}
                onClick={hasButton ? onButtonClick : undefined}
            />

            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <span className={styles.name}>{name}</span>
                    {comment && <div className={styles.comment}>{comment}</div>}
                </div>

                {hasButton && avatarVariant === 'default' && (
                    <button
                        className={styles.button}
                        onClick={onButtonClick}
                        aria-label="Action"
                    />
                )}
            </div>
        </div>
    );
}