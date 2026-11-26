import { theme } from 'antd'

export const voltTokens = {
  primary: '#171717',
  primarySoft: '#383838',
  primaryDeep: '#0070f3',
  heroBlue: '#0B3B8C',
  onPrimary: '#ffffff',
  canvas: '#fafafa',
  canvasSoft: '#f5f5f5',
  surface: '#ffffff',
  hairline: '#ebebeb',
  hairlineStrong: '#a1a1a1',
  ink: '#171717',
  inkStrong: '#171717',
  body: '#4d4d4d',
  mute: '#888888',
  warning: '#f5a623',
  error: '#ee0000',
  info: '#0070f3',
  violet: '#7928ca',
  cyan: '#00dfd8',
  pink: '#ff0080',
  amber: '#f9cb28',
}

export const fontDisplay = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
export const fontMono = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace"

const voltTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: voltTokens.primary,
    colorPrimaryHover: voltTokens.primarySoft,
    colorPrimaryActive: '#0a0a0a',
    colorInfo: voltTokens.info,
    colorLink: voltTokens.info,
    colorLinkHover: '#0761d1',
    colorSuccess: voltTokens.info,
    colorWarning: voltTokens.warning,
    colorError: voltTokens.error,
    colorBgBase: voltTokens.surface,
    colorBgLayout: voltTokens.canvas,
    colorBgContainer: voltTokens.surface,
    colorBgElevated: voltTokens.surface,
    colorBorder: voltTokens.hairline,
    colorBorderSecondary: voltTokens.hairline,
    colorSplit: voltTokens.hairline,
    colorText: voltTokens.ink,
    colorTextHeading: voltTokens.ink,
    colorTextSecondary: voltTokens.body,
    colorTextTertiary: voltTokens.mute,
    colorTextQuaternary: voltTokens.hairlineStrong,
    colorTextPlaceholder: voltTokens.mute,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    fontFamily: fontDisplay,
    fontSize: 14,
    controlHeight: 36,
  },
  components: {
    Layout: {
      headerBg: voltTokens.surface,
      bodyBg: voltTokens.canvas,
      footerBg: voltTokens.surface,
      siderBg: voltTokens.surface,
    },
    Card: {
      colorBgContainer: voltTokens.surface,
      colorBorderSecondary: voltTokens.hairline,
      headerBg: 'transparent',
      headerFontSize: 18,
      borderRadiusLG: 8,
    },
    Table: {
      headerBg: voltTokens.canvas,
      headerColor: voltTokens.mute,
      headerSplitColor: voltTokens.hairline,
      borderColor: voltTokens.hairline,
      rowHoverBg: voltTokens.canvasSoft,
      colorBgContainer: voltTokens.surface,
      cellPaddingBlock: 12,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: voltTokens.body,
      itemHoverColor: voltTokens.ink,
      itemSelectedColor: voltTokens.ink,
      itemSelectedBg: 'transparent',
      itemHoverBg: voltTokens.canvasSoft,
    },
    Tag: {
      defaultBg: 'transparent',
      defaultColor: voltTokens.body,
    },
    Input: {
      colorBgContainer: voltTokens.surface,
      activeBorderColor: voltTokens.ink,
      hoverBorderColor: voltTokens.hairlineStrong,
      activeShadow: '0 0 0 3px rgba(0, 0, 0, 0.06)',
    },
    InputNumber: {
      colorBgContainer: voltTokens.surface,
    },
    Select: {
      colorBgContainer: voltTokens.surface,
      optionSelectedBg: voltTokens.canvasSoft,
    },
    Button: {
      primaryColor: voltTokens.onPrimary,
      colorPrimaryHover: voltTokens.primarySoft,
      colorPrimaryActive: '#0a0a0a',
      fontWeight: 500,
      defaultBg: voltTokens.surface,
      defaultBorderColor: voltTokens.hairline,
      defaultColor: voltTokens.ink,
    },
    Modal: {
      contentBg: voltTokens.surface,
      headerBg: voltTokens.surface,
      footerBg: 'transparent',
    },
    Drawer: {
      colorBgElevated: voltTokens.surface,
    },
    Tabs: {
      itemColor: voltTokens.body,
      itemSelectedColor: voltTokens.ink,
      itemHoverColor: voltTokens.ink,
      inkBarColor: voltTokens.ink,
    },
    Pagination: {
      itemActiveBg: voltTokens.canvasSoft,
    },
    Progress: {
      defaultColor: voltTokens.info,
      remainingColor: voltTokens.hairline,
    },
    Descriptions: {
      labelBg: voltTokens.canvas,
      colorSplit: voltTokens.hairline,
    },
    Alert: {
      colorBgContainer: voltTokens.surface,
    },
    Dropdown: {
      colorBgElevated: voltTokens.surface,
    },
    Segmented: {
      itemSelectedBg: voltTokens.surface,
      itemSelectedColor: voltTokens.ink,
    },
  },
}

export default voltTheme
