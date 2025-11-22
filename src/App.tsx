import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import AuthPage from "@/pages/auth/AuthPage.tsx";
import EventEditorPage from "@/pages/event-editor/EventEditorPage.tsx";

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
                <Route path="/" element={<AuthPage/>}/>
                <Route path="/main" element={<MainPage/>}/>
                <Route path="/editor" element={<EventEditorPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
