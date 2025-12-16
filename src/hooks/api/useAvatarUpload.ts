import {useRef} from "react";
import {useUpdateProfileAvatarMutation} from "@/services/api/profileApi.ts";

export function useAvatarUpload() {
    const [updateAvatar, {isLoading}] = useUpdateProfileAvatarMutation();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const triggerFileDialog = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            await updateAvatar({file}).unwrap();
        } catch (err) {
            console.error("Ошибка загрузки аватара", err);
        } finally {
            event.target.value = "";
        }
    };

    return {
        fileInputRef,
        isUploading: isLoading,
        triggerFileDialog,
        handleFileChange,
    };
}

