import {useState, useEffect} from "react";
import {useDateTime} from "@/hooks/api/useDateTime.ts";
import {useChips} from "@/hooks/ui/useChips.ts";
import type {CreateEventPayload, UpdateEventPayload, EventResponse} from "@/types/api/Event.ts";
import {EVENT_FORMAT_MAP, FORMAT_REVERSE_MAP} from "@/const.ts";
import {combineDateTime, parseDateTime} from "@/utils/date";
import {useGetProfileQuery} from "@/services/api/profileApi.ts";

export const useEventForm = (eventData?: EventResponse | null) => {
    const {data: profile} = useGetProfileQuery();
    const {startDate, endDate, startTime, endTime, setStartDate, setEndDate, setStartTime, setEndTime} = useDateTime();

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
        setChips: setCategories,
    } = useChips();

    const {
        chips: roles,
        inputValue: roleInputValue,
        setInputValue: setRoleInputValue,
        removeChip: removeRole,
        handleKeyDown: handleRoleKeyDown,
        setChips: setRoles,
    } = useChips(["Организатор"]);

    useEffect(() => {
        if (eventData) {
            setTitle(eventData.name);
            setDescription(eventData.description || "");
            setLocation(eventData.location);
            setFormat(FORMAT_REVERSE_MAP[eventData.format] || eventData.format);
            setIsPrivate(eventData.eventType === "closed");
            
            if (eventData.maxParticipants && eventData.maxParticipants < 999999) {
                setParticipants(eventData.maxParticipants.toString());
                setIsParticipantsUnlimited(false);
            } else {
                setIsParticipantsUnlimited(true);
            }

            if (eventData.categories) {
                setCategories(eventData.categories);
            }

            if (eventData.startDate) {
                const {date, time} = parseDateTime(eventData.startDate);
                if (date) setStartDate(date);
                if (time) setStartTime(time);
            }
            if (eventData.endDate) {
                const {date, time} = parseDateTime(eventData.endDate);
                if (date) setEndDate(date);
                if (time) setEndTime(time);
            }
        }
    }, [eventData, setStartDate, setEndDate, setStartTime, setEndTime, setCategories]);

    const validate = (): string | null => {
        if (!title.trim()) return 'Необходимо указать название';
        if (!location.trim()) return 'Необходимо указать место';
        if (!startDate || !startTime) return 'Необходимо указать дату и время начала';
        if (!endDate || !endTime) return 'Необходимо указать дату и время окончания';
        if (!eventData && !profile?.id) return 'Не удалось получить ID пользователя';
        return null;
    };

    const preparePayload = (): CreateEventPayload | UpdateEventPayload | null => {
        const validationError = validate();
        if (validationError) {
            console.error(validationError);
            return null;
        }

        const startDateTime = combineDateTime(startDate, startTime);
        const endDateTime = combineDateTime(endDate, endTime);

        if (!startDateTime || !endDateTime) {
            return null;
        }

        const basePayload = {
            name: title,
            description: description,
            startDate: startDateTime,
            endDate: endDateTime,
            location: location,
            format: EVENT_FORMAT_MAP[format] || format,
            eventType: isPrivate ? "closed" : "open",
            maxParticipants: isParticipantsUnlimited ? 999999 : Number(participants),
        };

        if (!eventData && profile?.id) {
            return {
                ...basePayload,
                responsiblePersonId: profile.id,
                categories: categories,
                roles: roles,
            } as CreateEventPayload;
        }

        return basePayload as UpdateEventPayload;
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
        isEditMode: !!eventData,
    };
};