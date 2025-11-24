import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import AuthPage from "@/pages/auth/AuthPage.tsx";
import EventEditorPage from "@/pages/event-editor/EventEditorPage.tsx";
import EventPage from "@/pages/event/EventPage.tsx";

function App() {


    return (
        // <div style={{
        //     display: 'flex',
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     minHeight: '100vh',
        // }}>
        //     <Header/>
        // </div>
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage/>}/>
                <Route path="/main" element={<MainPage/>}/>
                <Route path="/editor" element={<EventEditorPage/>}/>
                <Route path="/event" element={<EventPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
