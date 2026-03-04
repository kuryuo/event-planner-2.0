import {useState, useEffect, useRef} from 'react';
import {useDateTime} from '@/hooks/api/useDateTime.ts';
import {useChips} from '@/hooks/ui/useChips.ts';
import type {CreateEventPayload, EventResponse, EventTypeKind, UpdateEventPayload, VenueFormat} from '@/types/api/Event.ts';
import {EVENT_FORMAT_MAP, FORMAT_REVERSE_MAP} from '@/const.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {combineDateTime, parseDateTime} from '@/utils/date';

const EVENT_TYPE_OPTIONS: EventTypeKind[] = [
    'Hackathon',
    'Lecture',
    'Webinar',
    'UrFU',
    'PP',
    'SpecialCourse',
    'Practice',
];

const VENUE_FORMAT_MAP: Record<string, VenueFormat> = {
    InPerson: 'InPerson',
    Online: 'Online',
    Hybrid: 'Hybrid',
    offline: 'InPerson',
    online: 'Online',
    hybrid: 'Hybrid',
};

export const useEventForm = (eventData?: EventResponse | null) => {
    const {startDate, endDate, startTime, endTime, setStartDate, setEndDate, setStartTime, setEndTime} = useDateTime();

    const [title, setTitle] = useState('');
    const [format, setFormat] = useState('Очно');
    const [location, setLocation] = useState('');
    const [auditorium, setAuditorium] = useState('');
    const [avatarColor, setAvatarColor] = useState('#C2185B');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showCategorySelect, setShowCategorySelect] = useState(false);
    const [participants, setParticipants] = useState('');
    const [isParticipantsUnlimited, setIsParticipantsUnlimited] = useState(true);
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
            setLocation(eventData.location);
            setAuditorium(eventData.auditorium || '');

            const rawVenueFormat = eventData.venueFormat || eventData.format || 'InPerson';
            setFormat(FORMAT_REVERSE_MAP[rawVenueFormat] || 'Очно');

            if (eventData.maxParticipants && eventData.maxParticipants < 999999) {
                setParticipants(eventData.maxParticipants.toString());
                setIsParticipantsUnlimited(false);
            } else {
                setParticipants('');
                setIsParticipantsUnlimited(true);
            }

            setCategories(eventData.categories ?? []);
            setSelectedTypes(eventData.types ?? []);

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

            isInitialized.current = true;
            initializedEventId.current = eventData.id;
            previousEventDataId.current = currentEventId;
        } else if (!eventData && eventIdChanged) {
            setTitle('');
            setDescription('');
            setLocation('');
            setAuditorium('');
            setFormat('Очно');
            setParticipants('');
            setIsParticipantsUnlimited(true);
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

    const toggleEventType = (type: EventTypeKind) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
    };

    const validate = (): string | null => {
        if (!title.trim()) return 'Необходимо указать название';
        if (!location.trim()) return 'Необходимо указать место';
        if (!startDate || !startTime) return 'Необходимо указать дату и время начала';
        if (!endDate || !endTime) return 'Необходимо указать дату и время окончания';
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

        const venueFormat = VENUE_FORMAT_MAP[EVENT_FORMAT_MAP[format] || format] || 'InPerson';

        const basePayload = {
            name: title,
            description,
            startDate: startDateTime,
            endDate: endDateTime,
            location,
            auditorium: auditorium.trim() || null,
            venueFormat,
            categories,
            types: selectedTypes,
            maxParticipants: isParticipantsUnlimited ? 0 : Number(participants),
            color: avatarColor,
        };

        if (!eventData) {
            return {
                ...basePayload,
                avatar: avatarFile,
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
        isParticipantsUnlimited,
        setIsParticipantsUnlimited,
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
        isEditMode: !!eventData,
    };
};
