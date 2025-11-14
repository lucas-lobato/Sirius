'use client';
import { Box, Typography, Paper } from '@mui/material';

export default function RelatorioFastReport() {
  const embedUrl =
    'https://app.powerbi.com/reportEmbed?reportId=d3aa26d8-c775-4f41-b3c6-7d5b5fb9ac6a&autoAuth=true&ctid=7cf2b2e5-b511-4114-934e-d694ae9dea2e';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // ocupa a tela toda, menos a topbar
        p: 2,
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
        📊 Relatório FastReport (Power BI)
      </Typography>

      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          border: '1px solid #B68743',
          borderRadius: 2,
          backgroundColor: '#0D1117',
        }}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{
            border: 'none',
          }}
          allowFullScreen
        />
      </Paper>
    </Box>
  );
}
