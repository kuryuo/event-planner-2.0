import {useState, useRef, useEffect} from "react";
import styles from "./ColorPicker.module.scss";
import ChevronDownImg from "../../../assets/img/icon-m/chevron-down.svg";
import ChevronUpImg from "../../../assets/img/icon-m/chevron-up.svg";

const PREDEFINED_COLORS = [
    "var(--pink-100)",
    "var(--plum-100)",
    "var(--purple-100)",
    "var(--deep-purple-100)",
    "var(--indigo-100)",
    "var(--blue-100)",
    "var(--cyan-100)",
    "var(--teal-100)",
    "var(--green-100)",
    "var(--orange-100)",
    "var(--deep-orange-100)",
    "var(--brown-100)"
];

interface ColorPickerProps {
    value?: string;
    onChange?: (color: string) => void;
}

const ColorPicker = ({value, onChange}: ColorPickerProps) => {
    const [open, setOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(value || PREDEFINED_COLORS[0]);
    const pickerRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setOpen(prev => !prev);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setOpen(false);
        if (onChange) onChange(color);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={styles.colorPicker} ref={pickerRef}>
            <div className={styles.selected} onClick={toggleOpen}>
                <div
                    className={styles.colorCircle}
                    style={{backgroundColor: selectedColor}}
                />
                <img
                    src={open ? ChevronUpImg : ChevronDownImg}
                    alt="Toggle"
                    className={styles.icon}
                />
            </div>

            {open && (
                <div className={styles.dropdown}>
                    {PREDEFINED_COLORS.map((color, index) => (
                        <div
                            key={index}
                            className={styles.colorOption}
                            style={{backgroundColor: color}}
                            onClick={() => handleColorSelect(color)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
