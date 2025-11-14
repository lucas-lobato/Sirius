'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Avatar,
  Button,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeMode } from '../../theme/ThemeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TopbarProps {
  onToggleSidebar?: () => void; // recebe função do Sidebar
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { mode, toggleMode } = useThemeMode();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('usuarioLogado');
    if (user) {
      const data = JSON.parse(user);
      setEmail(data.email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    router.push('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 48,
        justifyContent: 'center',
        backgroundColor: '#B68743',
        color: '#0D1117',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          minHeight: '48px !important',
          px: 2,
        }}
      >
        {/* 🔹 Lado esquerdo (botão de menu + logo) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              color: '#0D1117',
              p: 0.5,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Image src="/logo.png" alt="logo" width={22} height={22} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Sirius Backoffice
          </Typography>
        </Box>

        {/* 🔹 Lado direito */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {email && <Typography variant="body2">{email}</Typography>}
          <Tooltip title="Alternar tema">
            <IconButton onClick={toggleMode} color="inherit" size="small">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button color="inherit" size="small" onClick={handleLogout}>
            SAIR
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
