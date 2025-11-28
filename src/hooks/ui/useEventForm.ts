import {useState} from "react";
import {useDateTime} from "@/hooks/store/useDateTime.ts";
import {useProfile} from "@/hooks/api/useProfile.ts";
import {useChips} from "@/hooks/utils/useChips.ts";
import type {CreateEventPayload} from "@/types/api/Event.ts";
import {EVENT_FORMAT_MAP} from "@/const.ts";
import {combineDateTime} from "@/utils/date";

export const useEventForm = () => {
    const {profile} = useProfile();
    const {startDate, endDate, startTime, endTime} = useDateTime();

    const [title, setTitle] = useState("");
    const [format, setFormat] = useState("Очно");
    const [location, setLocation] = useState("");
    const [avatarColor, setAvatarColor] = useState("var(--pink-100)");
    const [isPrivate, setIsPrivate] = useState(false);
    const [showCategorySelect, setShowCategorySelect] = useState(false);
    const [participants, setParticipants] = useState("");
    const [isParticipantsUnlimited, setIsParticipantsUnlimited] = useState(true);
    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [description, setDescription] = useState("");

    const {
        chips: categories,
        inputValue,
        setInputValue,
        removeChip,
        handleKeyDown,
    } = useChips();

    const {
        chips: roles,
        inputValue: roleInputValue,
        setInputValue: setRoleInputValue,
        removeChip: removeRole,
        handleKeyDown: handleRoleKeyDown,
    } = useChips(["Организатор"]);

    const validate = (): string | null => {
        if (!title.trim()) return 'Необходимо указать название';
        if (!location.trim()) return 'Необходимо указать место';
        if (!startDate || !startTime) return 'Необходимо указать дату и время начала';
        if (!endDate || !endTime) return 'Необходимо указать дату и время окончания';
        if (!profile?.id) return 'Не удалось получить ID пользователя';
        return null;
    };

    const preparePayload = (): CreateEventPayload | null => {
        const validationError = validate();
        if (validationError) {
            console.error(validationError);
            return null;
        }

        const startDateTime = combineDateTime(startDate, startTime);
        const endDateTime = combineDateTime(endDate, endTime);

        if (!startDateTime || !endDateTime || !profile?.id) {
            return null;
        }

        return {
            name: title,
            description: description,
            startDate: startDateTime,
            endDate: endDateTime,
            location: location,
            format: EVENT_FORMAT_MAP[format] || format,
            eventType: isPrivate ? "closed" : "open",
            responsiblePersonId: profile.id,
            maxParticipants: isParticipantsUnlimited ? 999999 : Number(participants),
            categories: categories,
            roles: roles,
        };
    };

    return {
        title,
        setTitle,
        format,
        setFormat,
        location,
        setLocation,
        avatarColor,
        setAvatarColor,
        isPrivate,
        setIsPrivate,
        showCategorySelect,
        setShowCategorySelect,
        participants,
        setParticipants,
        isParticipantsUnlimited,
        setIsParticipantsUnlimited,
        roles,
        roleInputValue,
        setRoleInputValue,
        removeRole,
        handleRoleKeyDown,
        showRoleSelect,
        setShowRoleSelect,
        description,
        setDescription,

        categories,
        inputValue,
        setInputValue,
        removeChip,
        handleKeyDown,

        preparePayload,
    };
};