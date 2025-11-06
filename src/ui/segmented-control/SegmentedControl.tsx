import styles from './SegmentedControl.module.scss';
import clsx from "clsx";

interface SegmentedControlProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

const SegmentedControl = ({ options, selected, onChange }: SegmentedControlProps) => {
    const index = options.indexOf(selected);

    const sliderWidthPercent = 100 / options.length * 0.9;
    const sliderLeftPercent = (100 / options.length) * index + (100 / options.length * 0.05);

    return (
        <div className={styles.segmentedControl}>
            <div
                className={styles.slider}
                style={{ width: `${sliderWidthPercent}%`, left: `${sliderLeftPercent}%` }}
            />
            {options.map(option => (
                <div
                    key={option}
                    className={clsx(styles.segment, { [styles.active]: selected === option })}
                    onClick={() => onChange(option)}
                >
                    {option}
                </div>
            ))}
        </div>
    );
};

export default SegmentedControl;
