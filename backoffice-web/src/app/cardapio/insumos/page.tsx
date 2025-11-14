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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from '@mui/material';
import * as XLSX from 'xlsx';

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');

  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openExcluir, setOpenExcluir] = useState(false);

  const [form, setForm] = useState({
    codigo_insumo: '',
    nome_insumo: '',
    grupo_insumo: '',
    subgrupo_insumo: '',
  });

  // === Carregar lista ===
  const carregarInsumos = async (p = pagina, termo = busca): Promise<void> => {
    try {
      const query = new URLSearchParams({
        pagina: String(p),
        limite: '10',
        busca: termo,
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insumos?${query}`);
      const data = await res.json();

      setInsumos(data.insumos || []);
      setPagina(data.pagina);
      setTotalPaginas(data.total_paginas);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
    }
  };

  useEffect(() => {
    carregarInsumos();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => carregarInsumos(1, busca), 400);
    return () => clearTimeout(timeout);
  }, [busca]);

  // === Atualiza form ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // === Exportar Excel ===
  const exportarParaExcel = async (): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insumos/exportar`);
      const dados = await res.json();

      const ws = XLSX.utils.json_to_sheet(dados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Insumos');
      XLSX.writeFile(wb, 'insumos.xlsx');
    } catch (error) {
      console.error('Erro ao exportar insumos:', error);
    }
  };

  // === Criar insumo ===
  const handleCriar = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      alert('Insumo cadastrado!');
      setOpenCriar(false);
      carregarInsumos(pagina);
    } catch {
      alert('Erro ao cadastrar insumo.');
    }
  };

  // === Preparar edição ===
  const abrirEditar = () => {
    const item = insumos.find((i) => i.codigo_insumo === selecionado);
    if (!item) return;

    setForm(item);
    setOpenEditar(true);
  };

  // === Enviar edição ===
  const handleEditar = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/insumos/${selecionado}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      alert('Insumo atualizado!');
      setOpenEditar(false);
      carregarInsumos(pagina);
    } catch {
      alert('Erro ao editar insumo.');
    }
  };

  // === Excluir ===
  const handleExcluir = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/insumos/${selecionado}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error();

      alert('Insumo excluído!');
      setOpenExcluir(false);
      setSelecionado(null);
      carregarInsumos(pagina);
    } catch {
      alert('Erro ao excluir insumo.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="white" gutterBottom>
        Insumos
      </Typography>

      {/* Pesquisa */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TextField
          placeholder="Pesquisar insumo..."
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
              <TableCell sx={{ width: 40 }}></TableCell>
              <TableCell sx={{ color: 'white' }}>Código</TableCell>
              <TableCell sx={{ color: 'white' }}>Nome</TableCell>
              <TableCell sx={{ color: 'white' }}>Grupo</TableCell>
              <TableCell sx={{ color: 'white' }}>Subgrupo</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {insumos.map((i) => (
              <TableRow
                key={i.codigo_insumo}
                sx={{
                  backgroundColor:
                    selecionado === i.codigo_insumo ? '#333333' : 'inherit',
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selecionado === i.codigo_insumo}
                    onChange={() =>
                      setSelecionado(
                        selecionado === i.codigo_insumo ? null : i.codigo_insumo
                      )
                    }
                  />
                </TableCell>

                <TableCell sx={{ color: 'white' }}>{i.codigo_insumo}</TableCell>
                <TableCell sx={{ color: 'white' }}>{i.nome_insumo}</TableCell>
                <TableCell sx={{ color: 'white' }}>{i.grupo_insumo}</TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {i.subgrupo_insumo || '-'}
                </TableCell>
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
          onClick={() => carregarInsumos(pagina - 1)}
        >
          Anterior
        </Button>
        <Typography color="white">
          Página {pagina} de {totalPaginas}
        </Typography>
        <Button
          variant="outlined"
          disabled={pagina === totalPaginas}
          onClick={() => carregarInsumos(pagina + 1)}
        >
          Próxima
        </Button>
      </Stack>

      {/* Botões inferiores */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="error"
          disabled={!selecionado}
          onClick={() => setOpenExcluir(true)}
        >
          Excluir Insumo
        </Button>

        <Button variant="contained" color="success" onClick={() => setOpenCriar(true)}>
          Incluir Insumo
        </Button>

        <Button
          variant="contained"
          color="warning"
          disabled={!selecionado}
          onClick={abrirEditar}
        >
          Editar Insumo
        </Button>

        <Button variant="contained" color="info" onClick={exportarParaExcel}>
          Exportar Excel
        </Button>
      </Stack>

      {/* Modal Criar */}
      <Dialog open={openCriar} onClose={() => setOpenCriar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cadastrar Insumo</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.keys(form).map((campo) => (
              <TextField
                key={campo}
                label={campo.replaceAll('_', ' ').toUpperCase()}
                name={campo}
                value={(form as any)[campo]}
                onChange={handleChange}
                fullWidth
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCriar(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleCriar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Insumo</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.keys(form).map((campo) => (
              <TextField
                key={campo}
                label={campo.replaceAll('_', ' ').toUpperCase()}
                name={campo}
                value={(form as any)[campo]}
                onChange={handleChange}
                fullWidth
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={handleEditar}>
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Excluir */}
      <Dialog open={openExcluir} onClose={() => setOpenExcluir(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir Insumo</DialogTitle>
        <DialogContent dividers>
          Tem certeza que deseja excluir o insumo <b>{selecionado}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExcluir(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleExcluir}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
