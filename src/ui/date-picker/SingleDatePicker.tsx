import {useState} from 'react';
import {DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './DatePicker.module.scss';
import {ru} from 'date-fns/locale';

interface SingleDatePickerProps {
    initialDate?: Date;
    onDateChange?: (date: Date | undefined) => void;
}

export function SingleDatePicker({initialDate, onDateChange}: SingleDatePickerProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);

    const handleSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        onDateChange?.(date);
    };

    return (
        <div>
            <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                locale={ru}
                weekStartsOn={1}
            />
        </div>
    );
}

