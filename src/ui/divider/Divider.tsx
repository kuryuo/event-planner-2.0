import {Divider as AntDivider} from 'antd';

interface DividerProps {
    className?: string;
}

export default function Divider({className}: DividerProps) {
    return <AntDivider className={className} style={{margin: 0}}/>;
}
