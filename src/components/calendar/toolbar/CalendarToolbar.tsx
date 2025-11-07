import styles from './CalendarToolbar.module.scss';
import clsx from 'clsx';
import ChevronLeft from '@/assets/img/icon-m/chevron-left.svg';
import ChevronRight from '@/assets/img/icon-m/chevron-right.svg';
import ViewStacked from '@/assets/img/icon-m/view-stacked.svg';
import Filter from '@/assets/img/icon-m/filter.svg';

type CalendarView = 'dayGridMonth' | 'timeGridWeek';

interface CalendarToolbarProps {
    currentView: CalendarView;
    currentDate: Date;
    onViewChange: (view: CalendarView) => void;
    onPrev: () => void;
    onNext: () => void;
    onViewStackedClick?: () => void;
    onFilterClick?: () => void;
}

export default function CalendarToolbar({
                                    currentView,
                                    currentDate,
                                    onViewChange,
                                    onPrev,
                                    onNext,
                                    onViewStackedClick,
                                    onFilterClick,
                                }: CalendarToolbarProps) {
    const formatLabel = () => {
        if (currentView === 'dayGridMonth') {
            return currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
                .replace(/^./, str => str.toUpperCase());
        }

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();
        const monthName = endOfWeek.toLocaleString('ru-RU', { month: 'long' })
            .replace(/^./, str => str.toUpperCase());

        return `${startDay} – ${endDay} ${monthName}`;
    };

    return (
        <div className={styles.customToolbar}>
            <div className={styles.leftPart}>
                <span className={styles.navLabel}>{formatLabel()}</span>
                <button className={styles.navBtn} onClick={onPrev}>
                    <img src={ChevronLeft} alt="Предыдущая" />
                </button>
                <button className={styles.navBtn} onClick={onNext}>
                    <img src={ChevronRight} alt="Следующая" />
                </button>
            </div>

            <div className={styles.rightPart}>
                <div
                    className={clsx(
                        styles.buttonsWrapper,
                        currentView === 'timeGridWeek' && styles.weekActive
                    )}
                >
                    <div className={styles.slider} />
                    <div
                        className={clsx(styles.toolbarBtn, currentView === 'dayGridMonth' && styles.active)}
                        onClick={() => onViewChange('dayGridMonth')}
                    >
                        Месяц
                    </div>
                    <div
                        className={clsx(styles.toolbarBtn, currentView === 'timeGridWeek' && styles.active)}
                        onClick={() => onViewChange('timeGridWeek')}
                    >
                        Неделя
                    </div>
                </div>

                <div className={styles.iconButtons}>
                    <button className={styles.iconBtn} onClick={onViewStackedClick}>
                        <img src={ViewStacked} alt="Вид" />
                    </button>
                    <button className={styles.iconBtn} onClick={onFilterClick}>
                        <img src={Filter} alt="Фильтр" />
                    </button>
                </div>
            </div>
        </div>
    );
}
