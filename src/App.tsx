import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import {DatePicker} from "@/components/date-picker/DatePicker.tsx";
import Select from "@/ui/select/Select.tsx";
import {useState} from "react";
import Category from "@/components/сategory/Category.tsx";

function App() {


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
