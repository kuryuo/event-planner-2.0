import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import {DatePicker} from "@/components/date-picker/DatePicker.tsx";
import Select from "@/ui/form-controls/Select";
import {useState} from "react";
import Category from "@/components/сategory/Category.tsx";
import TextField from "@/ui/form-controls/TextField.tsx";

function App() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const options = [
        {
            label: "Опция 1",
            description: "Описание опции 1",
            onClick: () => handleSelect("Опция 1"),
        },
        {
            label: "Опция 2",
            description: "Описание опции 2",
            onClick: () => handleSelect("Опция 2"),
        },
        {
            label: "Опция 3",
            description: "Описание опции 3",
            onClick: () => handleSelect("Опция 3"),
        },
    ];

    function handleSelect(value: string) {
        setSelected(value);
        setIsOpen(false);
    }

    return (
        <div>
            {/*<DatePicker/>*/}
            <Category/>

        </div>
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<MainPage/>}/>
        //     </Routes>
        // </Router>
    );
}

export default App;
