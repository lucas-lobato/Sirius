'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Electrolize } from 'next/font/google';

// 🎨 Fonte Google otimizada
const electrolize = Electrolize({
  weight: '400',
  subsets: ['latin'],
});

// 🎨 Tema global com Electrolize
const theme = createTheme({
  typography: {
    fontFamily: electrolize.style.fontFamily,
  },
});

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    const usuario = localStorage.getItem('usuarioLogado');
    if (usuario) {
      router.replace('/home');
    }
  }, [router]);

  const handleLogin = () => {
    if (!user || !pass) {
      alert('Preencha usuário e senha.');
      return;
    }

    if (user === 'lucaslobato@grupovaca.com.br' && pass === 'teste') {
      localStorage.setItem('usuarioLogado', JSON.stringify({ email: user }));
      router.replace('/home');
    } else {
      alert('Usuário ou senha inválidos.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }}
      >
        {/* 🟦 Lado esquerdo - logo como background */}
        <Box
          sx={{
            flex: 2, // 2/3 da largura
            backgroundColor: '#0A1A2F',
            backgroundImage: 'url("/logo.png")',
            backgroundSize: 'cover', // preenche toda a área
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />

        {/* 🟨 Lado direito - Login */}
        <Box
          sx={{
            flex: 1, // 1/3 da largura
            backgroundColor: '#F5E6C5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              width: 320,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: '#1E1E1E',
                mb: 3,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              BACKOFFICE
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Login"
                type="email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ccc',
                    },
                    '&:hover fieldset': {
                      borderColor: '#888',
                    },
                  },
                }}
              />

              <TextField
                label="Senha"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ccc',
                    },
                    '&:hover fieldset': {
                      borderColor: '#888',
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                sx={{
                  mt: 1,
                  backgroundColor: '#2ecc40',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '6px',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: '#28b93b',
                  },
                }}
              >
                LOGIN
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
