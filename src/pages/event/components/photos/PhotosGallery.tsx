import styles from './PhotosGallery.module.scss';
import {buildImageUrl} from '@/utils/buildImageUrl';
import PhotoViewer from './PhotoViewer';
import {Button} from "antd";
import {Checkbox} from "antd";
import PlusLgIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import {useMemo} from "react";
import {usePhotosGallery} from '@/hooks/ui/usePhotosGallery';
import {useSelector} from "react-redux";
import type {RootState} from "@/store/store.ts";
import {useGetEventSubscribersQuery} from "@/services/api/eventApi.ts";
import {normalizeParticipantRole} from "@/utils/participantRole.ts";

interface PhotosGalleryProps {
    eventId: string;
}

const isVideoPath = (path?: string): boolean => {
    if (!path) return false;
    return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(path);
};

export default function PhotosGallery({eventId}: PhotosGalleryProps) {
    const currentUserId = useSelector((state: RootState) => state.profile.profile?.id ?? '');
    const {data: subscribersData} = useGetEventSubscribersQuery(
        {eventId, count: 200, offset: 0},
        {skip: !eventId},
    );
    const canManageMedia = useMemo(() => {
        const users = subscribersData?.res?.users ?? [];
        const role = users.find((user) => user.id === currentUserId)?.role ?? null;
        const normalizedRole = normalizeParticipantRole(role);
        return normalizedRole === 'Organizer' || normalizedRole === 'Editor';
    }, [subscribersData, currentUserId]);

    const {
        photos,
        isLoading,
        error,
        hasPhotos,
        hasSelectedPhotos,
        isSelectionMode,
        selectedPhotoIds,
        selectedPhotoIndex,
        isUploading,
        isDeleting,
        fileInputRef,
        handlePhotoClick,
        handleCloseViewer,
        handleNextPhoto,
        handlePrevPhoto,
        handleUploadClick,
        handleFileChange,
        handleSelectModeToggle,
        handleDeleteSelected,
        handleDeleteCurrent,
    } = usePhotosGallery(eventId);

    if (isLoading) {
        return (
            <div className={styles.gallery}>
                <div className={styles.loading}>Загрузка медиа...</div>
            </div>
        );
    }

    const uploadLabel = isUploading ? 'Загрузка...' : 'Загрузить фото и видео';

    return (
        <>
            <div className={styles.gallery}>
                {hasPhotos && (
                    <div className={styles.controls}>
                        <div className={styles.leftControls}>
                            {canManageMedia && (
                                <>
                                    <Button
                                        type="default"
                                        icon={<PlusLgIcon className={styles.icon}/>}
                                        className="ep-btn ep-btn--m ep-btn--filled-gray"
                                        onClick={handleUploadClick}
                                        disabled={isUploading}
                                    >
                                        {uploadLabel}
                                    </Button>
                                    <Button
                                        type={isSelectionMode ? "primary" : "text"}
                                        className={`ep-btn ep-btn--m ${isSelectionMode ? "ep-btn--filled-purple" : "ep-btn--text"}`}
                                        onClick={handleSelectModeToggle}
                                    >
                                        Выбрать
                                    </Button>
                                </>
                            )}
                        </div>
                        {canManageMedia && hasSelectedPhotos && (
                            <div className={styles.rightControls}>
                                <Button
                                    type="primary"
                                    danger
                                    icon={<TrashIcon className={styles.icon}/>}
                                    className="ep-btn ep-btn--m"
                                    onClick={handleDeleteSelected}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Удаление...' : 'Удалить'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {canManageMedia && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        style={{display: 'none'}}
                        onChange={handleFileChange}
                    />
                )}

                {error || !hasPhotos ? (
                    <div className={styles.emptyState}>
                        <h3 className={styles.emptyTitle}>
                            {canManageMedia ? 'Добавьте фото или видео' : 'Фото и видео отсутствуют'}
                        </h3>
                        <p className={styles.emptyText}>
                            {canManageMedia
                                ? 'Перетащите файлы сюда или нажмите на кнопку ниже'
                                : 'Пока нет медиафайлов для просмотра'}
                        </p>
                        {canManageMedia && (
                            <Button
                                type="primary"
                                icon={<PlusLgIcon className={styles.icon}/>}
                                className={`ep-btn ep-btn--m ep-btn--filled-purple ${styles.emptyUploadButton}`}
                                onClick={handleUploadClick}
                                disabled={isUploading}
                            >
                                {uploadLabel}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {photos.map((photo, index) => {
                            const imageUrl = buildImageUrl(photo.filePath);
                            if (!imageUrl) return null;

                            const isVideo = isVideoPath(photo.filePath);
                            const isSelected = selectedPhotoIds.has(photo.id);

                            return (
                                <div
                                    key={photo.id}
                                    className={`${styles.photoItem} ${isSelected ? styles.selected : ''} ${isSelectionMode ? styles.selectionMode : ''}`}
                                    onClick={() => handlePhotoClick(photo.id, index)}
                                >
                                    {canManageMedia && isSelectionMode && (
                                        <div className={styles.checkboxWrapper} onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={isSelected}
                                                className="ep-checkbox"
                                                onChange={() => handlePhotoClick(photo.id, index)}
                                            />
                                        </div>
                                    )}
                                    {isVideo ? (
                                        <>
                                            <video
                                                src={imageUrl}
                                                className={styles.photo}
                                                preload="metadata"
                                                muted
                                            />
                                            <div className={styles.videoBadge}>
                                                <span>Видео</span>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={imageUrl}
                                            alt={`Фото ${index + 1}`}
                                            className={styles.photo}
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedPhotoIndex !== null && !isSelectionMode && (
                <PhotoViewer
                    photos={photos}
                    initialIndex={selectedPhotoIndex}
                    onClose={handleCloseViewer}
                    onNext={handleNextPhoto}
                    onPrev={handlePrevPhoto}
                    onDeleteCurrent={canManageMedia ? handleDeleteCurrent : undefined}
                />
            )}
        </>
    );
}

