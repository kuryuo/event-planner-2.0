import clsx from 'clsx';
import styles from './Persona.module.scss';

type PersonaSize = 'M' | 'S';

interface PersonaProps {
    size?: PersonaSize;
    name: string;
    avatarUrl?: string;
    comment?: string;
    hasButton?: boolean;
    onButtonClick?: () => void;
}

export default function Persona({
                                    size = 'M',
                                    name,
                                    avatarUrl,
                                    comment,
                                    hasButton,
                                    onButtonClick,
                                }: PersonaProps) {

    const avatarSize = size === 'S' ? 32 : 48;

    const avatarSrc =
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
        )}&size=${avatarSize}&background=DDDDDD&color=555555`;

    return (
        <div className={clsx(styles.wrapper, styles[size])}>
            <img src={avatarSrc} alt={name} className={styles.avatar}/>

            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <span className={styles.name}>{name}</span>
                    {comment && <div className={styles.comment}>{comment}</div>}
                </div>

                {hasButton && (
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
