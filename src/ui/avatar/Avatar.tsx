import clsx from 'clsx';
import styles from './Avatar.module.scss';
import PlusIcon from '@/assets/img/icon-l/plus-lg.svg';
import UserFallbackAvatar from '@/assets/image/avatar.png';
import EventFallbackAvatar from '@/assets/image/avatar_event.png';

type AvatarVariant = 'default' | 'update';
type AvatarSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
type AvatarShape = 'circle' | 'square';
type AvatarFallbackType = 'user' | 'event';

interface AvatarProps {
    size?: AvatarSize;
    variant?: AvatarVariant;
    shape?: AvatarShape;
    avatarUrl?: string;
    name?: string;
    fallbackType?: AvatarFallbackType;
    className?: string;
    onClick?: () => void;
}

const SIZE_MAP: Record<AvatarSize, number> = {
    XL: 96,
    L: 64,
    M: 48,
    S: 36,
    XS: 24,
};

export default function Avatar({
                                    size = 'S',
                                    variant = 'default',
                                    shape = 'circle',
                                    avatarUrl,
                                    name = '',
                                    fallbackType = 'user',
                                    className,
                                    onClick,
                                }: AvatarProps) {
    const pixelSize = SIZE_MAP[size];

    const avatarSrc = avatarUrl;
    const fallbackSrc = fallbackType === 'event' ? EventFallbackAvatar : UserFallbackAvatar;

    const handleClick = variant === 'update' ? onClick : undefined;

    return (
        <div
            className={clsx(styles.wrapper, styles[size], styles[shape], className, variant === 'update' && styles.update)}
            onClick={handleClick}
            style={{width: pixelSize, height: pixelSize}}
        >
            {avatarSrc ? (
                <img src={avatarSrc} alt={name} className={styles.avatar}/>
            ) : (
                <img src={fallbackSrc} alt={name} className={styles.avatar}/>
            )}
            {variant === 'update' && (
                <div className={styles.overlay}>
                    <img src={PlusIcon} alt="Add" className={styles.icon}/>
                </div>
            )}
        </div>
    );
}
