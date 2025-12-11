import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import AuthPage from "@/pages/auth/AuthPage.tsx";
import EventEditorPage from "@/pages/event-editor/EventEditorPage.tsx";
import EventPage from "@/pages/event/EventPage.tsx";
import ProfilePage from "@/pages/profile/ProfilePage.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage/>}/>
                <Route path="/main" element={<MainPage/>}/>
                <Route path="/editor" element={<EventEditorPage/>}/>
                <Route path="/event" element={<EventPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
