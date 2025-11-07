import './CalendarEvent.module.scss';

interface CalendarEventProps {
    arg: any;
    viewType: 'dayGridMonth' | 'timeGridWeek';
}

const colors = [
    { bg: 'var(--bg-pink)', color: 'var(--content-pink)' },
    { bg: 'var(--bg-blue)', color: 'var(--content-blue)' },
    { bg: 'var(--bg-orange)', color: 'var(--content-orange)' },
    { bg: 'var(--bg-purple)', color: 'var(--content-purple)' },
    { bg: 'var(--bg-cyan)', color: 'var(--content-cyan)' },
    { bg: 'var(--bg-deep-orange)', color: 'var(--content-deep-orange)' },
    { bg: 'var(--bg-deep-purple)', color: 'var(--content-deep-purple)' },
    { bg: 'var(--bg-teal)', color: 'var(--content-teal)' },
    { bg: 'var(--bg-brown)', color: 'var(--content-brown)' },
    { bg: 'var(--bg-indigo)', color: 'var(--content-indigo)' },
    { bg: 'var(--bg-green)', color: 'var(--content-green)' },
    { bg: 'var(--bg-plum)', color: 'var(--content-plum)' },
];

export default function CalendarEvent({ arg, viewType }: CalendarEventProps) {
    const { event, timeText } = arg;
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (viewType === 'dayGridMonth') {
        const start = event.start;
        const end = event.end;
        const timeRange =
            start && end
                ? `${start.getHours().toString().padStart(2, '0')}:${start
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`
                : '';

        return (
            <div
                className="fc-daygrid-event"
                style={{
                    '--event-bg': color.bg,
                    '--event-color': color.color,
                } as React.CSSProperties}
            >
                <div className="fc-daygrid-event-dot" />
                <div className="event-content">
                    <div className="fc-event-title">{event.title}</div>
                    <div className="fc-event-time">{timeRange}</div>
                </div>
            </div>
        );
    }


    return (
        <div
            className="fc-event-main"
            style={{
                '--event-bg': color.bg,
                '--event-color': color.color,
            } as React.CSSProperties}
        >
            <div className="fc-event-title">{event.title}</div>
            <div className="fc-event-time">{timeText}</div>
        </div>
    );
}
