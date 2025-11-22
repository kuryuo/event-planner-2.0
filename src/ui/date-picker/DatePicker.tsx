import {useState} from 'react';
import {DayPicker, type DateRange} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './DatePicker.module.scss';
import {ru} from 'date-fns/locale';

interface DateRangePickerProps {
    initialRange?: DateRange;
    onRangeChange?: (range: DateRange | undefined) => void;
}

export function DatePicker({initialRange, onRangeChange}: DateRangePickerProps) {
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialRange);

    const handleSelect = (range: DateRange | undefined) => {
        setSelectedRange(range);
        onRangeChange?.(range);
    };

    return (
        <div>
            <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={handleSelect}
                locale={ru}
                weekStartsOn={1}
            />
        </div>
    );
}
