import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {Provider} from 'react-redux';
import {store} from './store/store';
import {ToastProvider} from '@/components/toast/ToastProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ToastProvider>
                <App/>
            </ToastProvider>
        </Provider>
    </React.StrictMode>,
);
