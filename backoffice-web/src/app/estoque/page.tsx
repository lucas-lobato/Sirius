'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  TextField,
} from '@mui/material';
import * as XLSX from 'xlsx';

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');
  const [unidade, setUnidade] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  async function carregarEstoque(p = pagina) {
    try {
      const query = new URLSearchParams({
        pagina: String(p),
        limite: '10',
        busca,
        unidade,
        dataInicio,
        dataFim,
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estoque?${query}`);
      const data = await res.json();

      setEstoque(data.estoque || []);
      setPagina(data.pagina || 1);
      setTotalPaginas(data.total_paginas || 1);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    }
  }

  useEffect(() => {
    carregarEstoque(1);
  }, []);

  // Atualiza quando filtros mudam
  useEffect(() => {
    const timeout = setTimeout(() => carregarEstoque(1), 400);
    return () => clearTimeout(timeout);
  }, [busca, unidade, dataInicio, dataFim]);

  const exportarParaExcel = async () => {
    try {
      const query = new URLSearchParams({
        busca,
        unidade,
        dataInicio,
        dataFim,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estoque/exportar?${query}`);
      if (!res.ok) throw new Error('Erro ao exportar estoque');
      const dados = await res.json();

      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque');
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      XLSX.writeFile(workbook, `estoque_${dataAtual}.xlsx`);
    } catch (error) {
      console.error('Erro ao exportar estoque:', error);
      alert('❌ Erro ao exportar estoque.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="white" gutterBottom>
        Estoque – Registro de Entradas
      </Typography>

      {/* Filtros */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Insumo"
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ width: 250, backgroundColor: '#1E1E1E', input: { color: 'white' }, label: { color: 'gray' } }}
        />
        <TextField
          label="Unidade"
          variant="outlined"
          size="small"
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          sx={{ width: 180, backgroundColor: '#1E1E1E', input: { color: 'white' }, label: { color: 'gray' } }}
        />
        <TextField
          label="Data início"
          type="date"
          size="small"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ backgroundColor: '#1E1E1E', input: { color: 'white' }, label: { color: 'gray' } }}
        />
        <TextField
          label="Data fim"
          type="date"
          size="small"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ backgroundColor: '#1E1E1E', input: { color: 'white' }, label: { color: 'gray' } }}
        />
      </Stack>

      {/* Tabela */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Data</TableCell>
              <TableCell sx={{ color: 'white' }}>Unidade</TableCell>
              <TableCell sx={{ color: 'white' }}>Insumo</TableCell>
              <TableCell sx={{ color: 'white' }}>Quantidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estoque.map((e, i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: 'white' }}>{e.data_formatada}</TableCell>
                <TableCell sx={{ color: 'white' }}>{e.unidade}</TableCell>
                <TableCell sx={{ color: 'white' }}>{e.nome_insumo}</TableCell>
                <TableCell sx={{ color: 'white' }}>{e.quantidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" disabled={pagina === 1} onClick={() => carregarEstoque(pagina - 1)}>
          Anterior
        </Button>
        <Typography color="white">
          Página {pagina} de {totalPaginas}
        </Typography>
        <Button variant="outlined" disabled={pagina >= totalPaginas} onClick={() => carregarEstoque(pagina + 1)}>
          Próxima
        </Button>
      </Stack>

      {/* Botões */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
        <Button variant="contained" color="info" onClick={exportarParaExcel}>
          Exportar para Excel
        </Button>
        <Button variant="contained" color="warning" onClick={() => carregarEstoque(pagina)}>
          Atualizar
        </Button>
      </Stack>
    </Box>
  );
}
