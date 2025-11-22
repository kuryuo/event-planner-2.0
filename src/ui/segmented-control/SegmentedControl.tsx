import styles from './SegmentedControl.module.scss';
import clsx from "clsx";

interface SegmentedControlProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

const SegmentedControl = ({options, selected, onChange}: SegmentedControlProps) => {
    const index = options.indexOf(selected);
    const segmentCount = options.length;

    const sliderWidthPercent = 100 / segmentCount;

    const sliderLeftPercent = (100 / segmentCount) * index;

    return (
        <div className={styles.segmentedControl}>
            <div
                className={styles.slider}
                style={{width: `${sliderWidthPercent}%`, left: `${sliderLeftPercent}%`}}
            />
            {options.map(option => (
                <div
                    key={option}
                    className={clsx(styles.segment, {[styles.active]: selected === option})}
                    onClick={() => onChange(option)}
                >
                    {option}
                </div>
            ))}
        </div>
    );
};

export default SegmentedControl;