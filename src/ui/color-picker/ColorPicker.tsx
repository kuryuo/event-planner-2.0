import {useState, useRef, useEffect} from "react";
import styles from "./ColorPicker.module.scss";
import ChevronDownImg from "../../assets/img/icon-m/chevron-down.svg";
import ChevronUpImg from "../../assets/img/icon-m/chevron-up.svg";
import {useClickOutside} from "@/hooks/ui/useClickOutside.ts";

const PREDEFINED_COLORS = [
    "#C2298A",
    "#A1309D",
    "#7A0CA8",
    "#512DA8",
    "#303F9F",
    "#1976D2",
    "#0097A7",
    "#00796B",
    "#388E3C",
    "#F57C00",
    "#E64A19",
    "#5D4037",
];

interface ColorPickerProps {
    value?: string;
    onChange?: (color: string) => void;
}

const ColorPicker = ({value, onChange}: ColorPickerProps) => {
    const [open, setOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(value || PREDEFINED_COLORS[0]);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            setSelectedColor(value);
        }
    }, [value]);

    const toggleOpen = () => setOpen((prev) => !prev);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setOpen(false);
        onChange?.(color);
    };

    useClickOutside(pickerRef, () => setOpen(false), open);

    return (
        <div className={styles.colorPicker} ref={pickerRef}>
            <div className={styles.selected} onClick={toggleOpen}>
                <div className={styles.color} style={{backgroundColor: selectedColor}}/>
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
                            className={styles.wrapper}
                            onClick={() => handleColorSelect(color)}
                        >
                            <div
                                className={styles.option}
                                style={{backgroundColor: color}}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColorPicker;