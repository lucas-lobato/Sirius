'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';

export default function IntegracoesPage() {
  const [filaDeEspera, setFilaDeEspera] = useState<any[]>([]);
  const [enviados, setEnviados] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFila, setStatusFila] = useState<'ativa' | 'vazia' | 'processando'>('vazia');

  // === Carrega dados do backend ===
  const carregarDados = async () => {
    try {
      setLoading(true);

      const pedidosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ifood/pedidos`);
      const pedidosData = await pedidosRes.json();
      setFilaDeEspera(pedidosData.pendentes || []);
      setEnviados(pedidosData.enviados || []);

      const configRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ifood/config`);
      const configData = await configRes.json();
      setConfig(configData);

      if ((pedidosData.pendentes || []).length > 0) {
        setStatusFila('processando');
      } else if ((pedidosData.enviados || []).length > 0) {
        setStatusFila('ativa');
      } else {
        setStatusFila('vazia');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do iFood:', error);
      setStatusFila('vazia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 10000); // atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  const getChipColor = () => {
    switch (statusFila) {
      case 'ativa':
        return { label: '🟢 Fila Ativa', color: 'success' };
      case 'processando':
        return { label: '🟡 Processando Pedidos', color: 'warning' };
      case 'vazia':
      default:
        return { label: '🔴 Fila Vazia', color: 'error' };
    }
  };

  const statusChip = getChipColor();

  return (
    <Box sx={{ p: 3 }}>
      {/* === Header === */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Image
          src="/ifood.png"
          alt="iFood Logo"
          width={45}
          height={45}
          style={{ borderRadius: 8 }}
        />
        <Typography variant="h5" color="white" fontWeight="bold">
          Integração iFood
        </Typography>

        <Chip
          label={statusChip.label}
          color={statusChip.color as any}
          sx={{ ml: 2, fontWeight: 600 }}
        />
      </Stack>

      {/* === Informações de configuração (somente leitura) === */}
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" color="white" gutterBottom>
          ⚙️ Configurações Atuais da API
        </Typography>

        {config?.client_id ? (
          <>
            <Typography variant="body2" color="gray">
              Ambiente: <strong style={{ color: '#fff' }}>{config.ambiente}</strong>
            </Typography>
            <Typography variant="body2" color="gray">
              Client ID: <strong style={{ color: '#fff' }}>{config.client_id}</strong>
            </Typography>
            <Typography variant="body2" color="gray">
              Merchant ID: <strong style={{ color: '#fff' }}>{config.merchant_id}</strong>
            </Typography>
            <Typography variant="body2" color="gray">
              Merchant UUID: <strong style={{ color: '#fff' }}>{config.merchant_uuid}</strong>
            </Typography>
            <Typography variant="body2" color="gray">
              Redirect URI: <strong style={{ color: '#fff' }}>{config.redirect_uri}</strong>
            </Typography>

            <Divider sx={{ my: 2, borderColor: '#333' }} />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="warning"
                onClick={() => window.open('https://developer.ifood.com.br/', '_blank')}
              >
                Documentação iFood
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={async () => {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ifood/sync`, { method: 'POST' });
                  alert('🔄 Simulação de pedidos enviada para a fila.');
                  carregarDados();
                }}
              >
                Simular Pedidos
              </Button>
            </Stack>
          </>
        ) : (
          <Typography variant="body2" color="gray">
            Nenhuma configuração encontrada no sistema.
          </Typography>
        )}
      </Paper>

      {/* === FILA DE ESPERA === */}
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" color="white" gutterBottom>
            🕐 Fila de Espera (Pedidos aguardando envio)
          </Typography>
          {loading && <CircularProgress size={18} sx={{ color: 'gray' }} />}
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>ID</TableCell>
                <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white' }}>Loja</TableCell>
                <TableCell sx={{ color: 'white' }}>Valor (R$)</TableCell>
                <TableCell sx={{ color: 'white' }}>Criado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filaDeEspera.length > 0 ? (
                filaDeEspera.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell sx={{ color: 'white' }}>{p.id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{p.cliente_nome}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{p.loja_nome}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{p.valor_total}</TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {new Date(p.criado_em).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell sx={{ color: 'gray' }} colSpan={5} align="center">
                    Nenhum pedido aguardando envio.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* === ENVIADOS === */}
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" color="white" gutterBottom>
            ✅ Pedidos Enviados com Sucesso
          </Typography>
          {loading && <CircularProgress size={18} sx={{ color: 'gray' }} />}
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>ID</TableCell>
                <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white' }}>Loja</TableCell>
                <TableCell sx={{ color: 'white' }}>Valor (R$)</TableCell>
                <TableCell sx={{ color: 'white' }}>Enviado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enviados.length > 0 ? (
                enviados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell sx={{ color: 'white' }}>{p.id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{p.cliente_nome}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{p.loja_nome}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{p.valor_total}</TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {new Date(p.enviado_em).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell sx={{ color: 'gray' }} colSpan={5} align="center">
                    Nenhum pedido enviado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
