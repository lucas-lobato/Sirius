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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
} from '@mui/material';
import * as XLSX from 'xlsx';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openExcluir, setOpenExcluir] = useState(false);

  const [selecionado, setSelecionado] = useState<string | null>(null);

  const [form, setForm] = useState({
    codigo_produto: '',
    nome_produto: '',
    produto_base: '',
    grupo_produto: '',
    subgrupo_produto: '',
    classificacao_boravaca: '',
    ecombo: '',
    classificacao_1: '',
    classificacao_2: '',
    promocao: '',
    preco_venda: '',
  });

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');

  // === Carrega produtos do backend ===
  async function carregarProdutos(p = pagina, termo = busca) {
    try {
      const query = new URLSearchParams({
        pagina: String(p),
        limite: '10',
        busca: termo,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos?${query}`);
      const data = await res.json();

      setProdutos(data.produtos || []);
      setPagina(data.pagina || 1);
      setTotalPaginas(data.total_paginas || 1);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      carregarProdutos(1, busca);
    }, 400);
    return () => clearTimeout(timeout);
  }, [busca]);

  // === Atualiza form ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // === Exportar todos ===
  const exportarParaExcel = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/exportar`);
      if (!res.ok) throw new Error('Erro ao exportar produtos');

      const todosProdutos = await res.json();
      if (!todosProdutos.length) {
        alert('Nenhum produto encontrado.');
        return;
      }

      const dados = todosProdutos.map((p: any) => ({
        Código: p.codigo_produto,
        Nome: p.nome_produto,
        Grupo: p.grupo_produto,
        Subgrupo: p.subgrupo_produto,
        Preço: p.preco_venda,
      }));

      const ws = XLSX.utils.json_to_sheet(dados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produtos');

      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      XLSX.writeFile(wb, `produtos_${dataAtual}.xlsx`);
    } catch (error) {
      alert('Erro ao exportar.');
    }
  };

  // === Criar produto ===
  const handleSubmit = async () => {
    try {
      const camposVazios = Object.entries(form)
        .filter(([, valor]) => !valor)
        .map(([campo]) => campo);

      if (camposVazios.length) {
        alert(`Preencha todos os campos:\n${camposVazios.join(', ')}`);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar.');

      alert('Produto cadastrado!');
      setOpen(false);
      setForm({
        codigo_produto: '',
        nome_produto: '',
        produto_base: '',
        grupo_produto: '',
        subgrupo_produto: '',
        classificacao_boravaca: '',
        ecombo: '',
        classificacao_1: '',
        classificacao_2: '',
        promocao: '',
        preco_venda: '',
      });

      carregarProdutos(pagina);
    } catch (error) {
      alert('Erro ao cadastrar.');
    }
  };

  // === Editar produto ===
  const handleEditarProduto = () => {
    const produto = produtos.find((p) => p.codigo_produto === selecionado);
    if (!produto) return;

    setForm(produto);
    setOpenEditar(true);
  };

  const handleSalvarEdicao = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${selecionado}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Erro ao editar.');

      alert('Produto atualizado!');
      setOpenEditar(false);
      carregarProdutos(pagina);
    } catch {
      alert('Erro ao editar.');
    }
  };

  // === Excluir produto ===
  const handleExcluirProduto = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${selecionado}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir.');

      alert('Produto excluído!');
      setOpenExcluir(false);
      setSelecionado(null);
      carregarProdutos(pagina);
    } catch {
      alert('Erro ao excluir.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* === TÍTULO === */}
      <Typography variant="h5" color="white" gutterBottom>
        Produtos
      </Typography>

      {/* === BUSCA === */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TextField
          label="Pesquisar produto..."
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{
            width: 400,
            backgroundColor: '#1E1E1E',
            input: { color: 'white' },
            label: { color: 'gray' },
          }}
        />
      </Box>

      {/* === TABELA === */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40 }}></TableCell>
              <TableCell sx={{ color: 'white' }}>Código</TableCell>
              <TableCell sx={{ color: 'white' }}>Nome</TableCell>
              <TableCell sx={{ color: 'white' }}>Grupo</TableCell>
              <TableCell sx={{ color: 'white' }}>Subgrupo</TableCell>
              <TableCell sx={{ color: 'white' }}>Preço</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {produtos.map((p) => (
              <TableRow
                key={p.codigo_produto}
                sx={{
                  backgroundColor:
                    selecionado === p.codigo_produto ? '#333333' : 'inherit',
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selecionado === p.codigo_produto}
                    onChange={() =>
                      setSelecionado(
                        selecionado === p.codigo_produto ? null : p.codigo_produto
                      )
                    }
                  />
                </TableCell>

                <TableCell sx={{ color: 'white' }}>{p.codigo_produto}</TableCell>
                <TableCell sx={{ color: 'white' }}>{p.nome_produto}</TableCell>
                <TableCell sx={{ color: 'white' }}>{p.grupo_produto}</TableCell>
                <TableCell sx={{ color: 'white' }}>{p.subgrupo_produto}</TableCell>
                <TableCell sx={{ color: 'white' }}>R$ {p.preco_venda}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* === PAGINAÇÃO === */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          disabled={pagina === 1}
          onClick={() => carregarProdutos(pagina - 1)}
        >
          Anterior
        </Button>

        <Typography color="white">
          Página {pagina} de {totalPaginas}
        </Typography>

        <Button
          variant="outlined"
          disabled={pagina === totalPaginas}
          onClick={() => carregarProdutos(pagina + 1)}
        >
          Próxima
        </Button>
      </Stack>

      {/* === BOTÕES === */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="error"
          disabled={!selecionado}
          onClick={() => setOpenExcluir(true)}
        >
          Excluir Produto
        </Button>

        <Button variant="contained" color="success" onClick={() => setOpen(true)}>
          Incluir Produto
        </Button>

        <Button
          variant="contained"
          color="warning"
          disabled={!selecionado}
          onClick={handleEditarProduto}
        >
          Editar Produto
        </Button>

        <Button variant="contained" color="info" onClick={exportarParaExcel}>
          Exportar Excel
        </Button>
      </Stack>

      {/* === POPUP CADASTRAR === */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Cadastrar Produto</DialogTitle>
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
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* === POPUP EDITAR === */}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="md">
        <DialogTitle>Editar Produto</DialogTitle>
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
          <Button variant="contained" color="warning" onClick={handleSalvarEdicao}>
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* === POPUP EXCLUIR === */}
      <Dialog open={openExcluir} onClose={() => setOpenExcluir(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent dividers>
          Tem certeza que deseja excluir o produto <b>{selecionado}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExcluir(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleExcluirProduto}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
