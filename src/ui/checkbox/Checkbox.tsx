import {Checkbox as AntCheckbox} from 'antd';

interface CheckboxProps {
    checked?: boolean;
    onChange?: () => void;
}

export default function Checkbox({checked = false, onChange}: CheckboxProps) {
    return (
        <AntCheckbox
            checked={checked}
            onChange={() => {
                onChange?.();
            }}
        />
    );
}
