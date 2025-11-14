'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // ou 'light'
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#121212', paper: '#1d1d1d' },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: 'Inter, Roboto, sans-serif' },
});
