import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import TextField from "@/ui/form-controls/TextField.tsx";
import Button from "@/ui/button/Button.tsx";
import TextArea from "@/ui/form-controls/TextArea.tsx";
import Select from "@/ui/form-controls/Select.tsx";
import {Checkbox} from "@/ui/checkbox/Checkbox.tsx";
import Switch from "@/ui/switch/Switch.tsx";
import {useState} from "react";
import Persona from "@/ui/persona/Persona.tsx";
import SegmentedControl from "@/ui/segmented-control/SegmentedControl.tsx";
import Chip from "@/ui/chip/Chip.tsx";
import Badge from "@/ui/badge/Badge.tsx";
import Tabs from "@/ui/tabs/Tabs.tsx";
import ColorPicker from "@/ui/color-picker/ColorPicker.tsx";
import Avatar from "@/ui/avatar/Avatar.tsx";
import ButtonCircle from "@/ui/button-circle/ButtonCircle.tsx";


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
            <Avatar/>


            <ButtonCircle number={7}/>
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
