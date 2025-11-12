import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import {DatePicker} from "@/components/date-picker/DatePicker.tsx";

function App() {
    return (
        <div>
            <DatePicker/>
        </div>
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<MainPage/>}/>
        //     </Routes>
        // </Router>
    );
}

export default App;
