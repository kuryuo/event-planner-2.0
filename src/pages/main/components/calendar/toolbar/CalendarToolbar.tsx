import styles from './CalendarToolbar.module.scss';
import clsx from 'clsx';
import ChevronLeft from '@/assets/img/icon-m/chevron-left.svg?react';
import ChevronRight from '@/assets/img/icon-m/chevron-right.svg?react';
import ViewStacked from '@/assets/img/icon-m/view-stacked.svg?react';
import Calendar from '@/assets/img/icon-m/calendar.svg?react'
import Filter from '@/assets/img/icon-m/filter.svg?react';
import {formatCalendarLabel} from '@/utils/date';
import {useI18n} from '@/i18n/I18nProvider';

type CalendarView = 'dayGridMonth' | 'timeGridWeek';

interface CalendarToolbarProps {
    currentView: CalendarView;
    currentDate: Date;
    onViewChange: (view: CalendarView) => void;
    onPrev: () => void;
    onNext: () => void;
    onViewStackedClick?: () => void;
    onFilterClick?: () => void;
    showingList?: boolean;
}

export default function CalendarToolbar({
                                            currentView,
                                            currentDate,
                                            onViewChange,
                                            onPrev,
                                            onNext,
                                            onViewStackedClick,
                                            onFilterClick,
                                            showingList
                                        }: CalendarToolbarProps) {
    const {language, t} = useI18n();

    return (
        <div className={styles.customToolbar}>
            <div className={styles.leftPart}>
                <span className={styles.navLabel}>
                    {showingList 
                        ? currentDate.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', {month: 'long', year: 'numeric'}).replace(/^./, str => str.toUpperCase())
                        : formatCalendarLabel(currentDate, currentView, language)
                    }
                </span>
                <button className={styles.navBtn} onClick={onPrev}>
                    <ChevronLeft/>
                </button>
                <button className={styles.navBtn} onClick={onNext}>
                    <ChevronRight/>
                </button>
            </div>

            <div className={styles.rightPart}>
                {!showingList && (
                    <div
                        className={clsx(
                            styles.buttonsWrapper,
                            currentView === 'timeGridWeek' && styles.weekActive
                        )}
                    >
                        <div className={styles.slider}/>
                        <div className={clsx(styles.toolbarBtn, currentView === 'dayGridMonth' && styles.active)}
                             onClick={() => onViewChange('dayGridMonth')}>
                            {t('calendar.month')}
                        </div>
                        <div className={clsx(styles.toolbarBtn, currentView === 'timeGridWeek' && styles.active)}
                             onClick={() => onViewChange('timeGridWeek')}>
                            {t('calendar.week')}
                        </div>
                    </div>
                )}

                <div className={styles.iconButtons}>
                    {onViewStackedClick && (
                        <button className={styles.iconBtn} onClick={onViewStackedClick}>
                            {showingList ? <Calendar/> : <ViewStacked/>}
                        </button>
                    )}
                    {onFilterClick && (
                        <button className={styles.iconBtn} onClick={onFilterClick}>
                            <Filter/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
