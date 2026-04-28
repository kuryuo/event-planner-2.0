import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import {applyThemeFromStorage} from '@/hooks/ui/useTheme.ts';
import './index.css';
import './antd-typography-overrides.scss';
import App from './App.tsx';
import {store} from './store/store';
import {ToastProvider} from '@/components/toast/ToastProvider.tsx';
import {AntdAppProvider} from '@/providers/AntdAppProvider.tsx';

applyThemeFromStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <AntdAppProvider>
                <ToastProvider>
                    <App/>
                </ToastProvider>
            </AntdAppProvider>
        </Provider>
    </React.StrictMode>,
);
