import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";

function App() {


    return (
        // <div style={{
        //     display: 'flex',
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     minHeight: '100vh',
        //     backgroundColor: 'red'
        // }}>
        //     <Filters/>
        // </div>
        <Router>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
