import {useState} from 'react';
import styles from './Filters.module.scss';
import TextField from '@/ui/text-field/TextField.tsx';
import Checkbox from '@/ui/checkbox/Checkbox';
import CloseIcon from '@/assets/img/icon-m/x.svg';
import TextFieldAdornmentIcon from '@/assets/img/icon-m/calendar.svg';
import Organizers from "@/components/organizers/Organizers";
import Category from "@/components/сategory/Category";
import Switch from "@/ui/switch/Switch.tsx";
import Button from "@/ui/button/Button";

interface FiltersProps {
    onClose?: () => void;
}

export default function Filters({onClose}: FiltersProps) {
    const [formats, setFormats] = useState({
        inPerson: false,
        hybrid: false,
        online: false,
    });

    const [mySubscriptions, setMySubscriptions] = useState(false);
    const [availableSeats, setAvailableSeats] = useState(false);

    const toggleFormat = (key: keyof typeof formats) => {
        setFormats(prev => ({...prev, [key]: !prev[key]}));
    };

    return (
        <div className={styles.filters}>
            <div className={styles.header}>
                <span className={styles.title}>Фильтры</span>
                <img src={CloseIcon} alt="Закрыть" onClick={onClose} className={styles.closeIcon}/>
            </div>

            <TextField
                label="Дата"
                placeholder="Выберите дату"
                leftIcon={<img src={TextFieldAdornmentIcon} alt="Иконка"/>}
            />

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
                <Organizers/>
            </div>

            <div className={styles.selectSection}>
                <Category/>
            </div>

            <span className={styles.sectionTitle}>Другое</span>

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

            <div className={styles.actions}>
                <Button
                    size="M"
                    variant="Filled"
                >
                    Применить
                </Button>

                <Button
                    size="M"
                    variant="Text"
                >
                    Очистить
                </Button>
            </div>
        </div>
    );
}
