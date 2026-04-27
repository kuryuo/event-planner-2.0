import type {ThemeConfig} from 'antd';

/** Токены Ant Design под палитру и типографику из `index.css` */
export const antdTheme: ThemeConfig = {
    token: {
        fontFamily: `'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        colorPrimary: '#88498f',
        colorSuccess: '#00d29d',
        colorWarning: '#ff6a00',
        colorError: '#d80000',
        colorInfo: '#6d797d',
        borderRadius: 8,
        colorText: '#0b2027',
        colorTextSecondary: '#6d797d',
        colorBorder: '#e7e9ea',
        colorBgContainer: '#ffffff',
        lineWidth: 1,
        wireframe: false,
    },
    components: {
        Button: {
            primaryShadow: 'none',
            defaultShadow: 'none',
            dangerShadow: 'none',
            controlHeight: 44,
            controlHeightSM: 32,
            paddingInline: 16,
            paddingInlineSM: 12,
            fontWeight: 600,
        },
        Input: {
            controlHeight: 44,
            controlHeightLG: 52,
            activeShadow: 'none',
        },
        Checkbox: {
            borderRadiusSM: 4,
        },
        Switch: {
            trackHeight: 22,
            trackHeightSM: 16,
        },
        Tabs: {
            titleFontSize: 14,
            horizontalMargin: '0 0 0 0',
        },
        Segmented: {
            trackBg: 'var(--bg-secondary-subtle)',
        },
        Tag: {
            defaultBg: 'var(--bg-secondary-subtle)',
        },
    },
};
