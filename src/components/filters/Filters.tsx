import {useState, useRef, useEffect} from 'react';
import styles from './Filters.module.scss';
import Checkbox from '@/ui/checkbox/Checkbox';
import CloseIcon from '@/assets/img/icon-m/x.svg';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import Organizers from "@/components/filters/organizers/Organizers";
import Category from "@/components/filters/сategory/Category";
import Switch from "@/ui/switch/Switch.tsx";
import Button from "@/ui/button/Button";
import {DatePicker} from "@/ui/date-picker/DatePicker.tsx";
import type {DateRange} from 'react-day-picker';
import {useClickOutside} from "@/hooks/ui/useClickOutside.ts";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import type {Organizer} from "@/types/api/User.ts";
import type {GetEventsPayload} from "@/types/api/Event.ts";
import {useGetOrganizersQuery} from "@/services/api/userApi.ts";

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

    const [mySubscriptions, setMySubscriptions] = useState(false);
    const [availableSeats, setAvailableSeats] = useState(false);
    const [openSelect, setOpenSelect] = useState<'organizers' | 'category' | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedOrganizers, setSelectedOrganizers] = useState<Organizer[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const {data: organizersData} = useGetOrganizersQuery();

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

            if (appliedFilters.Format) {
                const formatMap: Record<string, keyof typeof formats> = {
                    'offline': 'inPerson',
                    'hybrid': 'hybrid',
                    'online': 'online',
                };
                const formatKey = formatMap[appliedFilters.Format];
                if (formatKey) {
                    setFormats(prev => ({...prev, [formatKey]: true}));
                }
            }

            if (appliedFilters.HasFreePlaces) {
                setAvailableSeats(true);
            }

            if (appliedFilters.Categories) {
                setSelectedCategories(appliedFilters.Categories);
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

        const selectedFormats: string[] = [];
        if (formats.inPerson) selectedFormats.push('offline');
        if (formats.hybrid) selectedFormats.push('hybrid');
        if (formats.online) selectedFormats.push('online');
        if (selectedFormats.length > 0) {
            filters.Format = selectedFormats[0];
        }

        if (selectedOrganizers.length > 0) {
            filters.Organizators = selectedOrganizers.map(org => org.id);
        }

        if (selectedCategories.length > 0) {
            filters.Categories = selectedCategories;
        }

        if (availableSeats) {
            filters.HasFreePlaces = true;
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
        setMySubscriptions(false);
        setAvailableSeats(false);
        setDateRange(undefined);
        setSelectedOrganizers([]);
        setSelectedCategories([]);
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

            <div className={styles.selectSection}>
                <Organizers
                    isOpen={openSelect === 'organizers'}
                    onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'organizers' : null)}
                    onSelectedChange={setSelectedOrganizers}
                    initialOrganizers={selectedOrganizers}
                />
            </div>

            <div className={styles.selectSection}>
                <Category
                    isOpen={openSelect === 'category'}
                    onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'category' : null)}
                    onSelectedChange={setSelectedCategories}
                    initialCategories={selectedCategories}
                />
            </div>


            <div className={styles.subscriptionList}>
                <span className={styles.sectionTitle}>Другое</span>

                <div className={styles.switchGroup}>
                    <div className={styles.subscriptionItem}>
                        <Switch
                            checked={mySubscriptions}
                            onCheckedChange={setMySubscriptions}
                            label="Мои подписки"
                            labelPosition="left"
                        />
                    </div>

                    <div className={styles.subscriptionItem}>
                        <Switch
                            checked={availableSeats}
                            onCheckedChange={setAvailableSeats}
                            label="Есть места"
                            labelPosition="left"
                        />
                    </div>
                </div>
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
