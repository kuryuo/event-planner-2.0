import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import TextField from "@/components/ui/form-controls/TextField.tsx";
import Button from "@/components/ui/button/Button.tsx";
import TextArea from "@/components/ui/form-controls/TextArea.tsx";
import Select from "@/components/ui/form-controls/Select.tsx";
import {Checkbox} from "@/components/ui/checkbox/Checkbox.tsx";
import Switch from "@/components/ui/switch/Switch.tsx";
import {useState} from "react";
import Persona from "@/components/ui/persona/Persona.tsx";


function App() {
    const [checked, setChecked] = useState(false);
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
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
