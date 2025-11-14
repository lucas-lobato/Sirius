'use client';

import { Typography, Box } from '@mui/material';

export default function HomePage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography variant="h4" color="white">
        👋 Bem-vindo ao Sirius Backoffice
      </Typography>
    </Box>
  );
}
