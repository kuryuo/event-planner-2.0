import {MemoryRouter, Routes, Route, useLocation} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import AuthPage from "@/pages/auth/AuthPage.tsx";
import EventEditorPage from "@/pages/event-editor/EventEditorPage.tsx";
import EventPage from "@/pages/event/EventPage.tsx";
import ProfilePage from "@/pages/profile/ProfilePage.tsx";
import {useEffect, useState} from "react";

function getInitialPath(): string {
    const saved = sessionStorage.getItem('currentPath');
    return saved || '/';
}

function AppRoutes() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname + location.search;
        const saved = sessionStorage.getItem('currentPath');
        if (saved !== path) {
            sessionStorage.setItem('currentPath', path);
        }
    }, [location.pathname, location.search]);

    return (
        <Routes>
            <Route path="/" element={<AuthPage/>}/>
            <Route path="/main" element={<MainPage/>}/>
            <Route path="/editor" element={<EventEditorPage/>}/>
            <Route path="/event" element={<EventPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
        </Routes>
    );
}

function App() {
    const [initialPath] = useState(() => getInitialPath());

    return (
        <MemoryRouter initialEntries={[initialPath]}>
            <AppRoutes />
        </MemoryRouter>
    );
}

export default App;
