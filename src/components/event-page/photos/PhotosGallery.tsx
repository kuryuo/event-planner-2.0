import {useState, useRef} from "react";
import styles from './PhotosGallery.module.scss';
import {useGetEventPhotosQuery, useUploadEventPhotoMutation, useDeleteEventPhotoMutation} from '@/services/api/eventApi';
import {buildImageUrl} from '@/utils/buildImageUrl';
import octopusImage from '@/assets/img/octopus.png';
import PhotoViewer from './PhotoViewer';
import Button from '@/ui/button/Button';
import Checkbox from '@/ui/checkbox/Checkbox';
import PlusLgIcon from '@/assets/img/icon-m/plus-lg.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';

interface PhotosGalleryProps {
    eventId: string;
}

const PHOTOS_PER_PAGE = 20;

export default function PhotosGallery({eventId}: PhotosGalleryProps) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
    const [offset, setOffset] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const {data, isLoading, error, refetch} = useGetEventPhotosQuery({
        eventId,
        offset,
        count: PHOTOS_PER_PAGE,
    });

    const [uploadPhoto, {isLoading: isUploading}] = useUploadEventPhotoMutation();
    const [deletePhoto, {isLoading: isDeleting}] = useDeleteEventPhotoMutation();

    const photos = data?.result || [];
    const hasPhotos = photos.length > 0;
    const hasSelectedPhotos = selectedPhotoIds.size > 0;

    const handlePhotoClick = (photoId: string, index: number) => {
        if (isSelectionMode) {
            setSelectedPhotoIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(photoId)) {
                    newSet.delete(photoId);
                } else {
                    newSet.add(photoId);
                }
                return newSet;
            });
        } else {
            setSelectedPhotoIndex(index);
        }
    };

    const handleCloseViewer = () => {
        setSelectedPhotoIndex(null);
    };

    const handleNextPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
            setSelectedPhotoIndex(selectedPhotoIndex + 1);
        }
    };

    const handlePrevPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
            setSelectedPhotoIndex(selectedPhotoIndex - 1);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadPhoto({eventId, file}).unwrap();
            refetch();
        } catch (err) {
            console.error('Ошибка при загрузке фото:', err);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSelectModeToggle = () => {
        setIsSelectionMode(prev => !prev);
        if (isSelectionMode) {
            setSelectedPhotoIds(new Set());
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedPhotoIds.size === 0) return;

        try {
            for (const photoId of selectedPhotoIds) {
                await deletePhoto({eventId, photoId}).unwrap();
            }
            setSelectedPhotoIds(new Set());
            setIsSelectionMode(false);
            refetch();
        } catch (err) {
            console.error('Ошибка при удалении фото:', err);
        }
    };

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
