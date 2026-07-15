import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#172033', secondary: '#748096' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    h1: { fontFamily: 'Manrope, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Manrope, sans-serif', fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true, size: 'small' }, styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
  },
})

export default theme
