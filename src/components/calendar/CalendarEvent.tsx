import './CalendarEvent.module.scss';

interface CalendarEventProps {
    arg: any;
    viewType: 'dayGridMonth' | 'timeGridWeek';
}

export default function CalendarEvent({ arg, viewType }: CalendarEventProps) {
    const { event, timeText } = arg;

    const start = event.start;
    const end = event.end;
    const timeRange =
        start && end
            ? `${start.getHours().toString().padStart(2,'0')}:${start.getMinutes().toString().padStart(2,'0')} - ${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`
            : '';

    const displayTime = viewType === 'dayGridMonth' ? timeRange : timeText;

    return (
        <div className="fc-event-main">
            <div className="fc-event-title">{event.title}</div>
            <div className="fc-event-time">{displayTime}</div>
        </div>
    );
}
