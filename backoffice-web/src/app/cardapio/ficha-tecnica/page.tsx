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

export default function FichaTecnicaPage() {
  const [fichas, setFichas] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');

  // === Carrega fichas técnicas ===
  const carregarFichas = async (p = pagina): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ficha-tecnica?pagina=${p}&limite=10`);
      const data = await res.json();
      setFichas(data.fichas || []);
      setPagina(data.pagina);
      setTotalPaginas(data.total_paginas);
    } catch (error) {
      console.error('Erro ao carregar ficha técnica:', error);
    }
  };

  useEffect(() => {
    carregarFichas();
  }, []);

  // === Exporta todas as fichas para Excel ===
  const exportarParaExcel = async (): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ficha-tecnica/exportar`);
      const dados = await res.json();

      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ficha Técnica');
      XLSX.writeFile(workbook, 'ficha_tecnica.xlsx');
    } catch (error) {
      console.error('Erro ao exportar ficha técnica:', error);
    }
  };

  // === Filtro de busca ===
  const filtrados = fichas.filter((f) =>
    f.nome_produto?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="white" gutterBottom>
        Ficha Técnica
      </Typography>

      {/* Campo de pesquisa */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TextField
          placeholder="Pesquisar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{
            width: 400,
            backgroundColor: '#1E1E1E',
            input: { color: 'white' },
          }}
        />
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Produto</TableCell>
              <TableCell sx={{ color: 'white' }}>Insumo</TableCell>
              <TableCell sx={{ color: 'white' }}>Tipo</TableCell>
              <TableCell sx={{ color: 'white' }}>Qtd (kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.map((f) => (
              <TableRow key={`${f.codigo_produto}-${f.codigo_insumo}`}>
                <TableCell sx={{ color: 'white' }}>{f.nome_produto}</TableCell>
                <TableCell sx={{ color: 'white' }}>{f.nome_insumo}</TableCell>
                <TableCell sx={{ color: 'white' }}>{f.tipo_insumo}</TableCell>
                <TableCell sx={{ color: 'white' }}>{f.quantidade_insumo_kg}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          disabled={pagina === 1}
          onClick={() => carregarFichas(pagina - 1)}
        >
          Anterior
        </Button>
        <Typography color="white">
          Página {pagina} de {totalPaginas}
        </Typography>
        <Button
          variant="outlined"
          disabled={pagina === totalPaginas}
          onClick={() => carregarFichas(pagina + 1)}
        >
          Próxima
        </Button>
      </Stack>

      {/* Botões inferiores */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
        <Button variant="contained" color="warning" onClick={() => carregarFichas()}>
          Atualizar
        </Button>
        <Button variant="contained" color="info" onClick={() => exportarParaExcel()}>
          Exportar para Excel
        </Button>
      </Stack>
    </Box>
  );
}
