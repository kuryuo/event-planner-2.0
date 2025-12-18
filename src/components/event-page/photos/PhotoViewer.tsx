import {useEffect, useRef} from "react";
import styles from './PhotoViewer.module.scss';
import {buildImageUrl} from '@/utils/buildImageUrl';
import ChevronLeftIcon from '@/assets/img/icon-m/chevron-left.svg?react';
import ChevronRightIcon from '@/assets/img/icon-m/chevron-right.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside';

interface PhotoViewerProps {
    photos: Array<{id: string; filePath: string}>;
    initialIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function PhotoViewer({
    photos,
    initialIndex,
    onClose,
    onNext,
    onPrev,
}: PhotoViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const currentPhoto = photos[initialIndex];
    const imageUrl = buildImageUrl(currentPhoto?.filePath);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                onPrev();
            } else if (e.key === 'ArrowRight') {
                onNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose, onNext, onPrev]);

    if (!imageUrl) {
        return null;
    }

    const canGoPrev = initialIndex > 0;
    const canGoNext = initialIndex < photos.length - 1;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current?.contains(e.target as Node)) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        
        if (clickX < width / 2) {
            if (canGoPrev) {
                onPrev();
            }
        } else {
            if (canGoNext) {
                onNext();
            }
        }
    };

    useClickOutside(overlayRef, onClose, true);

    return (
        <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
            <div className={styles.viewer} ref={containerRef} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    <XIcon className={styles.closeIcon}/>
                </button>

                {canGoPrev && (
                    <button
                        className={`${styles.navButton} ${styles.prevButton}`}
                        onClick={onPrev}
                        aria-label="Предыдущее фото"
                    >
                        <ChevronLeftIcon className={styles.navIcon}/>
                    </button>
                )}

                <div className={styles.imageContainer}>
                    <img
                        src={imageUrl}
                        alt={`Фото ${initialIndex + 1}`}
                        className={styles.image}
                    />
                </div>

                {canGoNext && (
                    <button
                        className={`${styles.navButton} ${styles.nextButton}`}
                        onClick={onNext}
                        aria-label="Следующее фото"
                    >
                        <ChevronRightIcon className={styles.navIcon}/>
                    </button>
                )}

                <div className={styles.counter}>
                    {initialIndex + 1} / {photos.length}
                </div>
            </div>
        </div>
    );
}
