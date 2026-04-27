import type {ReactNode} from 'react';
import {App, ConfigProvider} from 'antd';
import ruRU from 'antd/locale/ru_RU';
import {antdTheme} from '@/theme/antd-theme.ts';

interface AntdAppProviderProps {
    children: ReactNode;
}

export const AntdAppProvider = ({children}: AntdAppProviderProps) => (
    <ConfigProvider theme={antdTheme} locale={ruRU}>
        <App>{children}</App>
    </ConfigProvider>
);
