import {useState, useRef} from "react";
import {useGetEventPhotosQuery, useUploadEventPhotoMutation, useDeleteEventPhotoMutation} from '@/services/api/eventApi';

const PHOTOS_PER_PAGE = 20;

export const usePhotosGallery = (eventId: string) => {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
    const [offset] = useState(0);
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
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        try {
            for (const file of files) {
                await uploadPhoto({eventId, file}).unwrap();
            }
            refetch();
        } catch (err) {
            console.error('Ошибка при загрузке медиа:', err);
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

    const handleDeleteCurrent = async () => {
        if (selectedPhotoIndex === null) return;

        const currentPhoto = photos[selectedPhotoIndex];
        if (!currentPhoto) return;

        try {
            await deletePhoto({eventId, photoId: currentPhoto.id}).unwrap();

            const nextTotal = photos.length - 1;
            if (nextTotal <= 0) {
                setSelectedPhotoIndex(null);
            } else {
                setSelectedPhotoIndex((prev) => {
                    if (prev === null) return null;
                    return Math.min(prev, nextTotal - 1);
                });
            }

            refetch();
        } catch (err) {
            console.error('Ошибка при удалении медиа:', err);
        }
    };

    return {
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
    };
};
