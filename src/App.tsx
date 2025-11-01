import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import TextField from "@/components/ui/form-controls/TextField.tsx";
import Button from "@/components/ui/button/Button.tsx";
import TextArea from "@/components/ui/form-controls/TextArea.tsx";
import Select from "@/components/ui/form-controls/Select.tsx";
import {Checkbox} from "@/components/ui/checkbox/Checkbox.tsx";
import Switch from "@/components/ui/switch/Switch.tsx";
import {useState} from "react";
import Persona from "@/components/ui/persona/Persona.tsx";
import SegmentedControl from "@/components/ui/segmented-control/SegmentedControl.tsx";
import Chip from "@/components/ui/chip/Chip.tsx";
import Badge from "@/components/ui/badge/Badge.tsx";
import Tabs from "@/components/ui/tabs/Tabs.tsx";
import ColorPicker from "@/components/ui/color-picker/ColorPicker.tsx";


function App() {
    const [checked, setChecked] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Option 1');
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5rem',
                paddingTop: '5rem',
                paddingBottom: '5rem',
            }}>
            <ColorPicker onChange={(color) => console.log("Selected color:", color)}/>
            <Tabs
                items={[
                    {label: "Tab Item", badgeCount: 3},
                    {label: "Profile"},
                    {label: "Messages", badgeCount: 12},
                ]}
            />
            <Chip text={'Label'} closable={true}/>
            <Badge count={3}/>
            <SegmentedControl
                options={['Label1', 'Label2', 'Label3']}
                selected={selectedOption}
                onChange={setSelectedOption}
            />
            <Persona name={'Имя Фамилия'} comment={'создатель'} hasButton={true}/>
            <Switch
                checked={checked}
                onCheckedChange={setChecked}
                label="Пример"
                labelPosition="right"
                size="M"
            />
            <Checkbox/>
            <Select label='Поле' helperText='ddd'/>
            <TextArea label='Поле' helperText='ddd'/>
            <TextField label='пример' helperText='ddd' error={true}/>
            <Button size="M">Нажми</Button>
        </div>
        // <Router>
        //     <Routes>
        //         <Route
        //             path="/s"
        //             element={
        //                 <Button >
        //                     Button
        //                 </Button>
        //             }
        //         />
        //         <Route path="/d" element={<TextField label='пример' helperText = 'ddd' error={true}/>}/>
        //         <Route path="/as" element={<TextArea label='Поле' helperText = 'ddd' />}/>
        //         <Route path="/" element={<Select label='Поле' helperText = 'ddd' />}/>
        //     </Routes>
        // </Router>
    );
}

export default App;
