export const colors = {
  primary: {
    main: '#7F7FD5',
    light: '#86A8E7',
    dark: '#6B6BB8',
  },
  text: {
    primary: '#343A40',
    secondary: '#6C757D',
  },
  background: '#F8F9FA',
  white: '#FFFFFF',
  border: '#E9ECEF',
  shadow: '#000000',
  gray: {
    100: '#F8F9FA',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
} as const;

export const typography = {
  title: `
    font-size: 20px;
    font-weight: bold;
    color: ${colors.text.primary};
  `,
  subtitle: `
    font-size: 16px;
    font-weight: bold;
    color: ${colors.text.primary};
  `,
  body: `
    font-size: 14px;
    color: ${colors.text.secondary};
  `,
  caption: `
    font-size: 12px;
    color: ${colors.text.secondary};
  `,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: '50%',
} as const;

export const shadows = {
  sm: `
    shadow-color: ${colors.shadow};
    shadow-offset: 0px 1px;
    shadow-opacity: 0.1;
    shadow-radius: 2px;
    elevation: 1;
  `,
  md: `
    shadow-color: ${colors.shadow};
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    elevation: 2;
  `,
  lg: `
    shadow-color: ${colors.shadow};
    shadow-offset: 0px 4px;
    shadow-opacity: 0.1;
    shadow-radius: 8px;
    elevation: 4;
  `,
} as const; 