import styles from './PhotosGallery.module.scss';
import {buildImageUrl} from '@/utils/buildImageUrl';
import octopusImage from '@/assets/img/octopus.png';
import PhotoViewer from './PhotoViewer';
import Button from '@/ui/button/Button';
import Checkbox from '@/ui/checkbox/Checkbox';
import PlusLgIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import {usePhotosGallery} from '@/hooks/ui/usePhotosGallery';

interface PhotosGalleryProps {
    eventId: string;
}

export default function PhotosGallery({eventId}: PhotosGalleryProps) {
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
    } = usePhotosGallery(eventId);

    if (isLoading) {
        return (
            <div className={styles.gallery}>
                <div className={styles.loading}>Загрузка фотографий...</div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.gallery}>
                {hasPhotos && (
                    <div className={styles.controls}>
                        <div className={styles.leftControls}>
                            <Button
                                variant="Filled"
                                color="gray"
                                leftIcon={<PlusLgIcon className={styles.icon}/>}
                                onClick={handleUploadClick}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Загрузка...' : 'Загрузить'}
                            </Button>
                            <Button
                                variant={isSelectionMode ? "Filled" : "Text"}
                                color={isSelectionMode ? "purple" : "gray"}
                                onClick={handleSelectModeToggle}
                            >
                                Выбрать
                            </Button>
                        </div>
                        {hasSelectedPhotos && (
                            <div className={styles.rightControls}>
                                <Button
                                    variant="Filled"
                                    color="red"
                                    leftIcon={<TrashIcon className={styles.icon}/>}
                                    onClick={handleDeleteSelected}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Удаление...' : 'Удалить'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />

                {error || !hasPhotos ? (
                    <div className={styles.emptyState}>
                        <img src={octopusImage} alt="Осьминог" className={styles.octopusImage}/>
                        <p className={styles.emptyText}>Пока фотографий нет</p>
                        <Button
                            variant="Filled"
                            color="gray"
                            leftIcon={<PlusLgIcon className={styles.icon}/>}
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className={styles.uploadButton}
                        >
                            {isUploading ? 'Загрузка...' : 'Загрузить'}
                        </Button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {photos.map((photo, index) => {
                            const imageUrl = buildImageUrl(photo.filePath);
                            if (!imageUrl) return null;
                            
                            const isSelected = selectedPhotoIds.has(photo.id);
                            
                            return (
                                <div
                                    key={photo.id}
                                    className={`${styles.photoItem} ${isSelected ? styles.selected : ''} ${isSelectionMode ? styles.selectionMode : ''}`}
                                    onClick={() => handlePhotoClick(photo.id, index)}
                                >
                                    {isSelectionMode && (
                                        <div className={styles.checkboxWrapper} onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handlePhotoClick(photo.id, index)}
                                            />
                                        </div>
                                    )}
                                    <img
                                        src={imageUrl}
                                        alt={`Фото ${index + 1}`}
                                        className={styles.photo}
                                        loading="lazy"
                                    />
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
                />
            )}
        </>
    );
}
