import {useState, useEffect, useRef} from 'react';
import {useDateTime} from '@/hooks/api/useDateTime.ts';
import {useChips} from '@/hooks/ui/useChips.ts';
import {useGetProfileQuery} from '@/services/api/profileApi.ts';
import type {
    CreateEventPayload,
    EventResponse,
    EventTypeKind,
    UpdateEventPayload,
    VenueFormat
} from '@/types/api/Event.ts';
import {EVENT_FORMAT_MAP, FORMAT_REVERSE_MAP} from '@/const.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {combineDateTime, parseDateTime} from '@/utils/date';
import {isValidAddress, isValidUrl} from '@/utils/validation.ts';
import type {EventParticipantAssignment} from '@/types/api/Event.ts';
import {EVENT_TYPE_OPTIONS, normalizeEventTypes} from '@/utils/eventTypeLabels.ts';

const VENUE_FORMAT_MAP: Record<string, VenueFormat> = {
    InPerson: 'InPerson',
    Online: 'Online',
    Hybrid: 'Hybrid',
    offline: 'InPerson',
    online: 'Online',
    hybrid: 'Hybrid',
};

export const useEventForm = (eventData?: EventResponse | null) => {
    const {data: profile} = useGetProfileQuery();
    const {startDate, endDate, startTime, endTime, setStartDate, setEndDate, setStartTime, setEndTime} = useDateTime();

    const [title, setTitle] = useState('');
    const [format, setFormat] = useState('Очно');
    const [location, setLocation] = useState('');
    const [auditorium, setAuditorium] = useState('');
    const [avatarColor, setAvatarColor] = useState('#C2185B');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showCategorySelect, setShowCategorySelect] = useState(false);
    const [participants, setParticipants] = useState<EventParticipantAssignment[]>([]);
    const [description, setDescription] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<EventTypeKind[]>([]);

    const isInitialized = useRef(false);
    const initializedEventId = useRef<string | null>(null);
    const previousEventDataId = useRef<string | null | undefined>(undefined);

    const {
        chips: categories,
        inputValue,
        setInputValue,
        addChip,
        removeChip,
        handleKeyDown,
        setChips: setCategories,
    } = useChips();

    useEffect(() => {
        const currentEventId = eventData?.id ?? null;
        const eventIdChanged = previousEventDataId.current !== currentEventId;

        if (eventData && (!isInitialized.current || initializedEventId.current !== eventData.id)) {
            setTitle(eventData.name);
            setDescription(eventData.description || '');

            const rawVenueFormat = eventData.venueFormat || eventData.format || 'InPerson';
            const displayFormat = FORMAT_REVERSE_MAP[rawVenueFormat] || 'Очно';
            setFormat(displayFormat);

            if (displayFormat === 'Онлайн') {
                const loc = eventData.location?.trim() ?? '';
                const aud = eventData.auditorium?.trim() ?? '';
                // для онлайна ссылка приходит в location; auditorium — запасной вариант
                if (loc && isValidUrl(loc)) {
                    setAuditorium(loc);
                } else if (aud) {
                    setAuditorium(aud);
                } else {
                    setAuditorium(loc || aud || '');
                }
                setLocation('');
            } else {
                setLocation(eventData.location);
                setAuditorium(eventData.auditorium || '');
            }

            setCategories(eventData.categories ?? []);
            setSelectedTypes(normalizeEventTypes(eventData.types));

            if (eventData.color) {
                setAvatarColor(eventData.color);
            }

            if (eventData.avatar) {
                const avatarUrl = buildImageUrl(eventData.avatar);
                setAvatarPreview(avatarUrl ?? null);
            } else {
                setAvatarPreview(null);
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

            // участники (если backend отдаёт responsiblePersonId — назначаем организатором)
            if (eventData.responsiblePersonId) {
                setParticipants([{userId: eventData.responsiblePersonId, role: 'Organizer'}]);
            } else {
                setParticipants([]);
            }

            isInitialized.current = true;
            initializedEventId.current = eventData.id;
            previousEventDataId.current = currentEventId;
        } else if (!eventData && eventIdChanged) {
            setTitle('');
            setDescription('');
            setLocation('');
            setAuditorium('');
            setFormat('Очно');
            setParticipants([]);
            setCategories([]);
            setSelectedTypes([]);
            setAvatarColor('#C2298A');
            setAvatarFile(null);
            setAvatarPreview(null);
            setStartDate(undefined);
            setEndDate(undefined);
            setStartTime('');
            setEndTime('');
            isInitialized.current = false;
            initializedEventId.current = null;
            previousEventDataId.current = currentEventId;
        }
    }, [eventData?.id, eventData, setCategories, setEndDate, setEndTime, setStartDate, setStartTime]);

    /** Создание: в UI подставляем себя организатором, если список ещё пуст */
    useEffect(() => {
        if (eventData || !profile?.id) return;
        setParticipants((prev) => {
            if (prev.length > 0) return prev;
            return [{userId: profile.id, role: 'Organizer'}];
        });
    }, [eventData, profile?.id]);

    const buildParticipantsForApi = (): EventParticipantAssignment[] => {
        if (!profile?.id) return participants;
        const others = participants.filter((p) => p.userId !== profile.id);
        return [{userId: profile.id, role: 'Organizer'}, ...others];
    };

    const toggleEventType = (type: EventTypeKind) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
    };

    const validateForm = (): string | null => {
        if (!title.trim()) return 'Введите название мероприятия';
        if (format === 'Очно') {
            if (!location.trim() || !isValidAddress(location)) return 'Введите корректный адрес';
        } else if (format === 'Онлайн') {
            if (!auditorium.trim() || !isValidUrl(auditorium)) {
                return 'Укажите корректную ссылку для подключения (https://...)';
            }
        } else if (format === 'Гибрид') {
            if (!location.trim() || !isValidAddress(location)) return 'Введите корректный адрес';
            if (!auditorium.trim() || !isValidUrl(auditorium)) {
                return 'Укажите корректную ссылку для подключения (https://...)';
            }
        }
        if (!startDate || !startTime) return 'Необходимо указать дату и время начала';
        if (!endDate || !endTime) return 'Необходимо указать дату и время окончания';
        if (participants.length === 0 && !profile?.id) {
            return 'Добавьте хотя бы одного участника';
        }
        if (!profile?.id && !participants.some((p) => p.role === 'Organizer')) {
            return 'Назначьте хотя бы одного организатора';
        }
        if (!description.trim() || description.trim().length < 10) {
            return 'Описание должно содержать минимум 10 символов';
        }
        return null;
    };

    const preparePayload = ({publish}: {publish?: boolean} = {}): CreateEventPayload | UpdateEventPayload | null => {
        const validationError = validateForm();
        if (validationError) {
            console.error(validationError);
            return null;
        }

        const startDateTime = combineDateTime(startDate, startTime);
        const endDateTime = combineDateTime(endDate, endTime);

        if (!startDateTime || !endDateTime) {
            return null;
        }

        const venueFormat = VENUE_FORMAT_MAP[EVENT_FORMAT_MAP[format] || format] || 'InPerson';

        const linkTrimmed = auditorium.trim();
        const payloadLocation =
            format === 'Онлайн' ? linkTrimmed : location;
        const payloadAuditorium =
            format === 'Онлайн' ? null : linkTrimmed || null;

        const participantsForApi = buildParticipantsForApi();

        const basePayload = {
            name: title,
            description,
            startDate: startDateTime,
            endDate: endDateTime,
            location: payloadLocation,
            auditorium: payloadAuditorium,
            venueFormat,
            categories,
            types: selectedTypes,
            participants: participantsForApi,
            responsiblePersonId: profile?.id ?? participantsForApi.find((p) => p.role === 'Organizer')?.userId,
            color: avatarColor,
        };

        if (!eventData) {
            return {
                ...basePayload,
                avatar: avatarFile,
                publish: publish ?? true,
            };
        }

        return {
            ...basePayload,
            avatar: avatarFile,
        };
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return {
        title,
        setTitle,
        format,
        setFormat,
        location,
        setLocation,
        auditorium,
        setAuditorium,
        avatarColor,
        setAvatarColor,
        avatarPreview,
        handleAvatarChange,
        showCategorySelect,
        setShowCategorySelect,
        participants,
        setParticipants,
        description,
        setDescription,
        categories,
        inputValue,
        setInputValue,
        addChip,
        removeChip,
        handleKeyDown,
        selectedTypes,
        toggleEventType,
        eventTypeOptions: EVENT_TYPE_OPTIONS,
        preparePayload,
        validateForm,
        isEditMode: !!eventData,
    };
};
