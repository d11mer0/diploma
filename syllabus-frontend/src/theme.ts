import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC6',
    },
    error: {
      main: '#CF6679',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#757575',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#A0A0A0',
    },
  },
  typography: {
    fontSize: 14,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0 4px 12px 0 rgba(187, 134, 252, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px 0 rgba(187, 134, 252, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
            '-webkit-box-shadow': '0 0 0 30px #1E1E1E inset !important',
            '-webkit-text-fill-color': '#E0E0E0 !important',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& .MuiInputBase-input': {
              padding: '14px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#BB86FC',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#BB86FC',
            },
          },
        },
      },
    },
    // ОНОВЛЕНО: Додаємо стилі для OutlinedInput
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
            '-webkit-box-shadow': '0 0 0 30px #1E1E1E inset !important',
            '-webkit-text-fill-color': '#E0E0E0 !important',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.severity === 'error' && {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            '& .MuiAlert-icon': {
              color: theme.palette.error.contrastText,
            },
          }),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          fontSize: '1rem',
          padding: '8px 4px',
        },
      },
    },
  },
});

export default theme;
