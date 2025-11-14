import clsx from 'clsx';
import styles from './Avatar.module.scss';
import PlusIcon from '@/assets/img/icon-l/plus-lg.svg';

type AvatarVariant = 'default' | 'update';
type AvatarSize = 'XS' | 'S' | 'M' | 'L';

interface AvatarProps {
    size?: AvatarSize;
    variant?: AvatarVariant;
    avatarUrl?: string;
    name?: string;
    onClick?: () => void;
}

const SIZE_MAP: Record<AvatarSize, number> = {
    L: 64,
    M: 48,
    S: 36,
    XS: 24,
};

export default function Avatar({
                                   size = 'S',
                                   variant = 'default',
                                   avatarUrl,
                                   name = '',
                                   onClick,
                               }: AvatarProps) {
    const pixelSize = SIZE_MAP[size];

    const avatarSrc =
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
        )}&size=${pixelSize}&background=DDDDDD&color=555555`;

    const handleClick = variant === 'update' ? onClick : undefined;

    return (
        <div
            className={clsx(styles.wrapper, styles[size], variant === 'update' && styles.update)}
            onClick={handleClick}
            style={{width: pixelSize, height: pixelSize}}
        >
            <img src={avatarSrc} alt={name} className={styles.avatar}/>
            {variant === 'update' && (
                <div className={styles.overlay}>
                    <img src={PlusIcon} alt="Add" className={styles.icon}/>
                </div>
            )}
        </div>
    );
}
