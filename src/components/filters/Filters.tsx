import {useState, useRef, useEffect} from 'react';
import styles from './Filters.module.scss';
import Checkbox from '@/ui/checkbox/Checkbox';
import CloseIcon from '@/assets/img/icon-m/x.svg';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import Organizers from "@/components/filters/organizers/Organizers";
import Tags from "@/components/filters/сategory/Category";
import Switch from "@/ui/switch/Switch.tsx";
import Button from "@/ui/button/Button";
import {DatePicker} from "@/ui/date-picker/DatePicker.tsx";
import type {DateRange} from 'react-day-picker';
import {useClickOutside} from "@/hooks/ui/useClickOutside.ts";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import type {Organizer} from "@/types/api/User.ts";
import type {EventTypeKind, GetEventsPayload} from "@/types/api/Event.ts";
import {useGetOrganizersQuery} from "@/services/api/userApi.ts";
import Divider from "@/ui/divider/Divider";
import Chip from "@/ui/chip/Chip";

interface FiltersProps {
    onClose?: () => void;
    onApply?: (filters: GetEventsPayload) => void;
    appliedFilters?: GetEventsPayload;
}

export default function Filters({onClose, onApply, appliedFilters}: FiltersProps) {
    const [formats, setFormats] = useState({
        inPerson: false,
        hybrid: false,
        online: false,
    });

    const [myEvents, setMyEvents] = useState(false);
    const [openSelect, setOpenSelect] = useState<'organizers' | 'tags' | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedOrganizers, setSelectedOrganizers] = useState<Organizer[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<EventTypeKind[]>([]);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const {data: organizersData} = useGetOrganizersQuery();

    const typeChips: Array<{ label: string; value: EventTypeKind }> = [
        {label: 'Хакатон', value: 'Hackathon'},
        {label: 'Лекция', value: 'Lecture'},
        {label: 'ПП', value: 'PP'},
        {label: 'Спецкурс', value: 'SpecialCourse'},
        {label: 'Практика', value: 'Practice'},
        {label: 'Карьерные мероприятия', value: 'CereerEvent'},
    ];

    const toggleType = (value: EventTypeKind) => {
        setSelectedTypes(prev => prev.includes(value)
            ? prev.filter(type => type !== value)
            : [...prev, value],
        );
    };

    const toggleFormat = (key: keyof typeof formats) => {
        setFormats(prev => ({...prev, [key]: !prev[key]}));
    };

    const formatDateRange = (range: DateRange | undefined): string => {
        if (!range?.from) return '';
        if (!range.to) {
            return format(range.from, 'd MMM yyyy', {locale: ru});
        }
        return `${format(range.from, 'd MMM', {locale: ru})} – ${format(range.to, 'd MMM yyyy', {locale: ru})}`;
    };

    useClickOutside(datePickerRef, () => setShowDatePicker(false), showDatePicker);

    useEffect(() => {
        if (appliedFilters) {
            if (appliedFilters.Start && appliedFilters.End) {
                setDateRange({
                    from: new Date(appliedFilters.Start),
                    to: new Date(appliedFilters.End),
                });
            }

            if (appliedFilters.VenueFormat || appliedFilters.Format) {
                const formatMap: Record<string, keyof typeof formats> = {
                    'InPerson': 'inPerson',
                    'Online': 'online',
                    'Hybrid': 'hybrid',
                    'offline': 'inPerson',
                    'hybrid': 'hybrid',
                    'online': 'online',
                };
                const rawFormat = appliedFilters.VenueFormat ?? appliedFilters.Format;
                const formatKey = rawFormat ? formatMap[rawFormat] : undefined;
                if (formatKey) {
                    setFormats(prev => ({...prev, [formatKey]: true}));
                }
            }

            if (appliedFilters.Categories) {
                setSelectedTags(appliedFilters.Categories);
            }

            if (appliedFilters.Types) {
                setSelectedTypes(appliedFilters.Types);
            }

            if (appliedFilters.MyEvents) {
                setMyEvents(true);
            }

            if (appliedFilters.Organizators && organizersData) {
                const organizers = organizersData.filter(org =>
                    appliedFilters.Organizators!.includes(org.id)
                );
                setSelectedOrganizers(organizers);
            }
        }
    }, [appliedFilters, organizersData]);

    const handleApply = () => {
        const filters: GetEventsPayload = {
            Count: 50,
        };

        if (dateRange?.from) {
            filters.Start = dateRange.from.toISOString();
        }
        if (dateRange?.to) {
            filters.End = dateRange.to.toISOString();
        }

        if (formats.inPerson) {
            filters.VenueFormat = 'InPerson';
        } else if (formats.hybrid) {
            filters.VenueFormat = 'Hybrid';
        } else if (formats.online) {
            filters.VenueFormat = 'Online';
        }

        if (selectedOrganizers.length > 0) {
            filters.Organizators = selectedOrganizers.map(org => org.id);
        }

        if (selectedTags.length > 0) {
            filters.Categories = selectedTags;
        }

        if (selectedTypes.length > 0) {
            filters.Types = selectedTypes;
        }

        if (myEvents) {
            filters.MyEvents = true;
        }

        onApply?.(filters);
        onClose?.();
    };

    const handleClear = () => {
        setFormats({
            inPerson: false,
            hybrid: false,
            online: false,
        });
        setMyEvents(false);
        setDateRange(undefined);
        setSelectedOrganizers([]);
        setSelectedTags([]);
        setSelectedTypes([]);
        onApply?.({Count: 50});
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.filters} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <span className={styles.title}>Фильтры</span>
                    <img src={CloseIcon} alt="Закрыть" onClick={onClose} className={styles.closeIcon}/>
                </div>

                <div className={styles.dateSection}>
                    <label className={styles.dateLabel}>Дата</label>
                    <div className={styles.dateWrapper} ref={datePickerRef}>
                        <CalendarIcon
                            className={styles.calendarIcon}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        />
                        <input
                            type="text"
                            placeholder="Выберите период"
                            className={styles.dateInput}
                            value={formatDateRange(dateRange)}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            readOnly
                        />
                        {showDatePicker && (
                            <div className={styles.datePicker}>
                                <DatePicker
                                    initialRange={dateRange}
                                    onRangeChange={(range) => {
                                        setDateRange(range);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formatSection}>
                    <span className={styles.formatTitle}>Формат</span>
                    <div className={styles.formatList}>
                        {Object.keys(formats).map(key => (
                            <label key={key} className={styles.formatItem}>
                                <Checkbox
                                    checked={formats[key as keyof typeof formats]}
                                    onChange={() => toggleFormat(key as keyof typeof formats)}
                                />
                                <span>
                                {key === 'inPerson'
                                    ? 'Очный'
                                    : key === 'hybrid'
                                        ? 'Гибридный'
                                        : 'Онлайн'}
                            </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.typeSection}>
                    <span className={styles.typeTitle}>Тип</span>
                    <div className={styles.typeChips}>
                        {typeChips.map((type) => (
                            selectedTypes.includes(type.value) ? (
                                <Chip
                                    key={type.value}
                                    text={type.label}
                                    size="S"
                                    closable
                                    onClose={() => toggleType(type.value)}
                                />
                            ) : (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={styles.typeChipButton}
                                    onClick={() => toggleType(type.value)}
                                >
                                    <Chip text={type.label} size="S"/>
                                </button>
                            )
                        ))}
                    </div>
                </div>

                <div className={styles.selectSection}>
                    <Tags
                        isOpen={openSelect === 'tags'}
                        onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'tags' : null)}
                        onSelectedChange={setSelectedTags}
                        initialCategories={selectedTags}
                    />
                </div>

                <div className={styles.selectSection}>
                    <Organizers
                        isOpen={openSelect === 'organizers'}
                        onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'organizers' : null)}
                        onSelectedChange={setSelectedOrganizers}
                        initialOrganizers={selectedOrganizers}
                    />
                </div>

                <Divider/>

                <div className={styles.switchRow}>
                    <Switch
                        checked={myEvents}
                        onCheckedChange={setMyEvents}
                        label="Мои мероприятия"
                        labelPosition="left"
                    />
                </div>

                <div className={styles.actions}>
                    <Button
                        size="M"
                        variant="Filled"
                        onClick={handleApply}
                    >
                        Применить
                    </Button>

                    <Button
                        size="M"
                        variant="Text"
                        onClick={handleClear}
                    >
                        Очистить
                    </Button>
                </div>
            </div>
        </div>
    );
}
