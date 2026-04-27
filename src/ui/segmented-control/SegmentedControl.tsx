import {Segmented} from 'antd';
import styles from './SegmentedControl.module.scss';

interface SegmentedControlProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

const SegmentedControl = ({options, selected, onChange}: SegmentedControlProps) => (
    <Segmented
        className={styles.segmented}
        options={options}
        value={selected}
        onChange={(v) => onChange(String(v))}
        block
    />
);

export default SegmentedControl;
