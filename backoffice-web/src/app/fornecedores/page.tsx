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
} from '@mui/material';
import * as XLSX from 'xlsx';

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    contato: '',
    telefone: '',
    email: '',
    cidade: '',
    uf: '',
    cnpj_cpf: '',
  });

  // === Carrega fornecedores com paginação ===
  const carregarFornecedores = async (p = pagina): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fornecedores?pagina=${p}&limite=10`);
      const data = await res.json();

      setFornecedores(data.fornecedores || []);
      setPagina(data.pagina);
      setTotalPaginas(data.total_paginas);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  // === Exportar todos os fornecedores para Excel ===
  const exportarParaExcel = async (): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fornecedores/exportar`);
      const dados = await res.json();

      if (!dados || !dados.length) {
        alert('Nenhum fornecedor encontrado para exportar.');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Fornecedores');
      XLSX.writeFile(workbook, 'fornecedores.xlsx');
    } catch (error) {
      console.error('Erro ao exportar fornecedores:', error);
    }
  };

  // === Cadastro de fornecedor ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const camposVazios = Object.entries(form)
        .filter(([, valor]) => !valor)
        .map(([campo]) => campo);

      if (camposVazios.length > 0) {
        alert(`Preencha todos os campos:\n${camposVazios.join(', ')}`);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fornecedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar fornecedor.');

      alert('✅ Fornecedor cadastrado com sucesso!');
      setOpen(false);
      setForm({
        nome: '',
        contato: '',
        telefone: '',
        email: '',
        cidade: '',
        uf: '',
        cnpj_cpf: '',
      });
      carregarFornecedores();
    } catch (error: any) {
      console.error('Erro ao cadastrar fornecedor:', error);
      alert(`❌ ${error.message}`);
    }
  };

  // === Filtro de pesquisa ===
  const filtrados = fornecedores.filter((f) =>
    f.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="white" gutterBottom>
        Fornecedores
      </Typography>

      {/* Campo de pesquisa */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TextField
          placeholder="Pesquisar fornecedor..."
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
              <TableCell sx={{ color: 'white' }}>Nome</TableCell>
              <TableCell sx={{ color: 'white' }}>Contato</TableCell>
              <TableCell sx={{ color: 'white' }}>Telefone</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Cidade</TableCell>
              <TableCell sx={{ color: 'white' }}>UF</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.map((f) => (
              <TableRow key={f.id}>
                <TableCell sx={{ color: 'white' }}>{f.nome}</TableCell>
                <TableCell sx={{ color: 'white' }}>{f.contato || '-'}</TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {f.ddd ? `(${f.ddd}) ${f.telefone}` : f.telefone || '-'}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>{f.email || '-'}</TableCell>
                <TableCell sx={{ color: 'white' }}>{f.cidade || '-'}</TableCell>
                <TableCell sx={{ color: 'white' }}>{f.uf || '-'}</TableCell>
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
          onClick={() => carregarFornecedores(pagina - 1)}
        >
          Anterior
        </Button>
        <Typography color="white">
          Página {pagina} de {totalPaginas}
        </Typography>
        <Button
          variant="outlined"
          disabled={pagina === totalPaginas}
          onClick={() => carregarFornecedores(pagina + 1)}
        >
          Próxima
        </Button>
      </Stack>

      {/* Botões inferiores */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
        <Button variant="contained" color="success" onClick={() => setOpen(true)}>
          Incluir Fornecedor
        </Button>
        <Button variant="contained" color="warning" onClick={() => carregarFornecedores()}>
          Atualizar
        </Button>
        <Button variant="contained" color="info" onClick={exportarParaExcel}>
          Exportar para Excel
        </Button>
      </Stack>

      {/* Modal de cadastro */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} fullWidth required />
            <TextField label="Contato" name="contato" value={form.contato} onChange={handleChange} fullWidth />
            <TextField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} fullWidth />
              <TextField label="UF" name="uf" value={form.uf} onChange={handleChange} fullWidth />
            </Stack>
            <TextField label="CNPJ/CPF" name="cnpj_cpf" value={form.cnpj_cpf} onChange={handleChange} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
