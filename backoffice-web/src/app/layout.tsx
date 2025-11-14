'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { ThemeModeProvider } from '../theme/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/login';

  // controla abertura/fechamento da sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // controle de login
  useEffect(() => {
    const usuario = localStorage.getItem('usuarioLogado');

    if (!usuario && !isLogin) {
      router.replace('/login');
    }

    if (usuario && isLogin) {
      router.replace('/home');
    }
  }, [pathname, isLogin, router]);

  // layout da tela de login
  if (isLogin) {
    return (
      <html lang="pt-br">
        <body>
          <ThemeModeProvider>
            <Box
              sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000',
              }}
            >
              {children}
            </Box>
          </ThemeModeProvider>
        </body>
      </html>
    );
  }

  // layout principal
  return (
    <html lang="pt-br">
      <body>
        <ThemeModeProvider>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar controlada */}
            <Sidebar open={sidebarOpen} toggleDrawer={toggleSidebar} />

            {/* Conteúdo principal */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s ease',
                ml: sidebarOpen ? '250px' : 0, // anima o espaço ocupado
              }}
            >
              <Topbar onToggleSidebar={toggleSidebar} />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  mt: '48px', // altura da AppBar
                  p: 3,
                  backgroundColor: '#0D1117',
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
