import {MemoryRouter, Routes, Route, useLocation, Navigate, useNavigate} from "react-router-dom";
import MainPage from "@/pages/main/MainPage.tsx";
import AuthPage from "@/pages/auth/AuthPage.tsx";
import EventEditorPage from "@/pages/event-editor/EventEditorPage.tsx";
import EventPage from "@/pages/event/EventPage.tsx";
import ProfilePage from "@/pages/profile/ProfilePage.tsx";
import TasksPage from "@/pages/tasks/TasksPage.tsx";
import ArchivePage from "@/pages/archive/ArchivePage.tsx";
import {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import type {RootState} from '@/store/store.ts';

function getInitialPath(): string {
    const saved = sessionStorage.getItem('currentPath');
    return saved || '/';
}

function AppRoutes() {
    const location = useLocation();
    const navigate = useNavigate();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        const path = location.pathname + location.search;
        const saved = sessionStorage.getItem('currentPath');
        if (saved !== path) {
            sessionStorage.setItem('currentPath', path);
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        if (!accessToken && location.pathname !== '/') {
            sessionStorage.removeItem('currentPath');
            navigate('/', {replace: true});
            return;
        }

        if (accessToken && location.pathname === '/') {
            navigate('/main', {replace: true});
        }
    }, [accessToken, location.pathname, navigate]);

    return (
        <Routes>
            <Route path="/" element={<AuthPage/>}/>
            <Route path="/main" element={<MainPage/>}/>
            <Route path="/editor" element={<EventEditorPage/>}/>
            <Route path="/event" element={<EventPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
            <Route path="/tasks" element={<TasksPage/>}/>
            <Route path="/archive" element={<ArchivePage/>}/>
            <Route path="/notifications" element={<Navigate to="/main" replace/>}/>
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
