import {useState, useEffect, useRef} from "react";
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
    const [avatarColor, setAvatarColor] = useState("#C2185B");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [showCategorySelect, setShowCategorySelect] = useState(false);
    const [participants, setParticipants] = useState("");
    const [isParticipantsUnlimited, setIsParticipantsUnlimited] = useState(true);
    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [description, setDescription] = useState("");

    const isInitialized = useRef(false);
    const initializedEventId = useRef<string | null>(null);

    const {
        chips: categories,
        inputValue,
        setInputValue,
        addChip,
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
        if (eventData && (!isInitialized.current || initializedEventId.current !== eventData.id)) {
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
            } else {
                setCategories([]);
            }

            if (eventData.startDate) {
                const {date, time} = parseDateTime(eventData.startDate);
                if (date) setStartDate(date);
                if (time) setStartTime(time);
            } else {
                setStartDate(undefined);
                setStartTime("");
            }
            
            if (eventData.endDate) {
                const {date, time} = parseDateTime(eventData.endDate);
                if (date) setEndDate(date);
                if (time) setEndTime(time);
            } else {
                setEndDate(undefined);
                setEndTime("");
            }

            isInitialized.current = true;
            initializedEventId.current = eventData.id;
        } else if (!eventData) {
            if (isInitialized.current) {
                setTitle("");
                setDescription("");
                setLocation("");
                setFormat("Очно");
                setIsPrivate(false);
                setParticipants("");
                setIsParticipantsUnlimited(true);
                setCategories([]);
                setRoles(["Организатор"]);
                setAvatarColor("#C2185B");
                setAvatarFile(null);
                setAvatarPreview(null);
                setStartDate(undefined);
                setEndDate(undefined);
                setStartTime("");
                setEndTime("");
                isInitialized.current = false;
                initializedEventId.current = null;
            }
        }
    }, [eventData?.id, setStartDate, setEndDate, setStartTime, setEndTime, setCategories]);

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
            const payload = {
                ...basePayload,
                responsiblePersonId: profile.id,
                categories: categories,
                roles: roles,
                color: avatarColor,
                avatar: avatarFile,
            } as CreateEventPayload;
            console.log('Создание мероприятия, отправляемые данные:', payload);
            return payload;
        }

        const updatePayload = {
            ...basePayload,
            color: avatarColor,
            avatar: avatarFile,
        } as UpdateEventPayload;
        console.log('Обновление мероприятия, отправляемые данные:', updatePayload);
        return updatePayload;
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
        avatarFile,
        avatarPreview,
        handleAvatarChange,
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
        addChip,
        removeChip,
        handleKeyDown,

        preparePayload,
        isEditMode: !!eventData,
    };
};