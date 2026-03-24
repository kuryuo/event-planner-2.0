import {useEffect, useRef, useState} from "react";
import styles from './PhotoViewer.module.scss';
import {buildImageUrl} from '@/utils/buildImageUrl';
import ChevronLeftIcon from '@/assets/img/icon-m/chevron-left.svg?react';
import ChevronRightIcon from '@/assets/img/icon-m/chevron-right.svg?react';
import XIcon from '@/assets/img/icon-m/x.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import DownloadIcon from '@/assets/img/icon-m/download.svg?react';
import Link45degIcon from '@/assets/img/icon-m/link-45deg.svg?react';
import BoxArrowUpRightIcon from '@/assets/img/icon-m/box-arrow-up-right.svg?react';
import ArrowsAngleExpandIcon from '@/assets/img/icon-m/arrows-angle-expand.svg?react';
import ArrowsAngleContractIcon from '@/assets/img/icon-m/arrows-angle-contract.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside';

interface PhotoViewerProps {
    photos: Array<{id: string; filePath: string}>;
    initialIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onDeleteCurrent?: () => void | Promise<void>;
}

const isVideoPath = (path?: string): boolean => {
    if (!path) return false;
    return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(path);
};

export default function PhotoViewer({
    photos,
    initialIndex,
    onClose,
    onNext,
    onPrev,
    onDeleteCurrent,
}: PhotoViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentPhoto = photos[initialIndex];
    const mediaUrl = buildImageUrl(currentPhoto?.filePath);
    const isVideo = isVideoPath(currentPhoto?.filePath);

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
        const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.body.style.overflow = '';
        };
    }, [onClose, onNext, onPrev]);

    if (!mediaUrl) {
        return null;
    }

    const canGoPrev = initialIndex > 0;
    const canGoNext = initialIndex < photos.length - 1;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = mediaUrl;
        link.download = currentPhoto?.filePath?.split('/').pop() || `media-${initialIndex + 1}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(mediaUrl);
        } catch (error) {
            console.error('Не удалось скопировать ссылку на медиа:', error);
        }
    };

    const handleOpenExternal = () => {
        window.open(mediaUrl, '_blank', 'noopener,noreferrer');
    };

    const toggleFullscreen = async () => {
        const target = containerRef.current;
        if (!target) return;

        try {
            if (!document.fullscreenElement) {
                await target.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Не удалось переключить полноэкранный режим:', error);
        }
    };

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
                <div className={styles.topToolbar}>
                    {onDeleteCurrent && (
                        <button className={`${styles.toolbarButton} ${styles.dangerButton}`} onClick={() => void onDeleteCurrent()} aria-label="Удалить">
                            <TrashIcon/>
                        </button>
                    )}
                    <button className={styles.toolbarButton} onClick={handleDownload} aria-label="Скачать">
                        <DownloadIcon/>
                    </button>
                    <button className={styles.toolbarButton} onClick={() => void handleCopyLink()} aria-label="Копировать ссылку">
                        <Link45degIcon/>
                    </button>
                    <button className={styles.toolbarButton} onClick={handleOpenExternal} aria-label="Открыть в новой вкладке">
                        <BoxArrowUpRightIcon/>
                    </button>
                    <button className={styles.toolbarButton} onClick={() => void toggleFullscreen()} aria-label="Полный экран">
                        {isFullscreen ? <ArrowsAngleContractIcon/> : <ArrowsAngleExpandIcon/>}
                    </button>
                    <button className={styles.toolbarButton} onClick={onClose} aria-label="Закрыть">
                        <XIcon/>
                    </button>
                </div>

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
                    {isVideo ? (
                        <video
                            src={mediaUrl}
                            className={styles.media}
                            controls
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img
                            src={mediaUrl}
                            alt={`Фото ${initialIndex + 1}`}
                            className={styles.media}
                        />
                    )}
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
                    {isVideo ? 'Видео' : 'Фото'} {initialIndex + 1} / {photos.length}
                </div>
            </div>
        </div>
    );
}
