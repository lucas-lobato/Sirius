'use client';
import { Box, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Typography variant="h4" color="text.primary">
        Bem-vindo ao Backoffice Sirius 🚀
      </Typography>
    </Box>
  );
}
