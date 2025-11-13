import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import {DatePicker} from "@/components/date-picker/DatePicker.tsx";
import Select from "@/ui/select/Select.tsx";
import {useState} from "react";
import Category from "@/components/сategory/Category.tsx";
import OrganizersSelect from "@/components/organizers/Organizers.tsx";
import {CardBase} from "@/ui/card/CardBase.tsx";
import Filters from "@/components/filters/Filters.tsx";

function App() {


    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'red'
        }}>
            <Filters/>
        </div>
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<MainPage/>}/>
        //     </Routes>
        // </Router>
    );
}

export default App;
