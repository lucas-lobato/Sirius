'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Checkbox,
  Modal,
} from '@mui/material';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    login: '',
    senha: '',
    permissao: '',
    cpf: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ==========================
  // CARREGAR USUÁRIOS
  // ==========================
  async function carregarUsuarios() {
    try {
      setApiError(null);
      setLoadingList(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`);
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();

      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError('Não foi possível carregar os usuários.');
      setUsuarios([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // ==========================
  // ABRIR CADASTRO
  // ==========================
  function abrirCadastro() {
    setIsEditing(false);
    setForm({ login: '', senha: '', permissao: '', cpf: '' });
    setOpenModal(true);
  }

  // ==========================
  // ABRIR EDIÇÃO
  // ==========================
  function abrirEdicao() {
    if (!selectedUserId) {
      alert('Selecione um usuário para editar.');
      return;
    }

    const user = usuarios.find((u) => u.id === selectedUserId);
    if (!user) return;

    setIsEditing(true);
    setForm({
      login: user.login,
      senha: '',
      permissao: user.permissao,
      cpf: user.cpf,
    });

    setOpenModal(true);
  }

  // ==========================
  // SALVAR (CADASTRAR / EDITAR)
  // ==========================
  async function salvarUsuario() {
    if (!form.login || !form.permissao || !form.cpf) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      setLoading(true);

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${selectedUserId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/usuarios`;

      const method = isEditing ? 'PUT' : 'POST';

      const body = JSON.stringify(form);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error();

      alert(isEditing ? 'Usuário atualizado!' : 'Usuário cadastrado!');
      setOpenModal(false);
      carregarUsuarios();
    } catch (err) {
      alert('Erro ao salvar usuário!');
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // EXCLUIR
  // ==========================
  async function excluirUsuario() {
    if (!selectedUserId) return alert('Selecione um usuário!');

    if (!confirm('Deseja realmente excluir este usuário?')) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${selectedUserId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error();

      alert('Usuário excluído!');
      setSelectedUserId(null);
      carregarUsuarios();
    } catch (err) {
      alert('Erro ao excluir usuário!');
    }
  }

  // ==========================
  // EXPORTAR EXCEL
  // ==========================
  function exportarExcel() {
    const csv =
      'ID,Login,CPF,Permissao\n' +
      usuarios
        .map((u) => `${u.id},${u.login},${u.cpf},${u.permissao}`)
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
  }

  // ==========================
  // RENDER
  // ==========================
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="white" gutterBottom>
        Usuários
      </Typography>

      {/* LISTA */}
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
        {loadingList ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress color="success" />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white', width: 40 }}></TableCell>
                  <TableCell sx={{ color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Login</TableCell>
                  <TableCell sx={{ color: 'white' }}>CPF</TableCell>
                  <TableCell sx={{ color: 'white' }}>Permissão</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell sx={{ width: 40 }}>
                      <Checkbox
                        checked={selectedUserId === u.id}
                        onChange={() =>
                          setSelectedUserId(
                            selectedUserId === u.id ? null : u.id
                          )
                        }
                        sx={{ color: 'white', p: 0 }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: 'white' }}>{u.id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{u.login}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{u.cpf}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{u.permissao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* BOTÕES NA PARTE DE BAIXO — CENTRALIZADOS */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3, justifyContent: 'center' }}
      >
        <Button variant="contained" color="success" onClick={abrirCadastro}>
          Cadastrar Usuário
        </Button>

        <Button variant="contained" color="warning" onClick={abrirEdicao}>
          Editar Usuário
        </Button>

        <Button variant="contained" color="error" onClick={excluirUsuario}>
          Excluir Usuário
        </Button>

        <Button variant="contained" onClick={exportarExcel}>
          Exportar
        </Button>
      </Stack>

      {/* ===========================================
          MODAL (POP-UP)
      ============================================ */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: 400,
            p: 4,
            backgroundColor: '#1E1E1E',
            color: 'white',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            {isEditing ? 'Editar Usuário' : 'Cadastrar Usuário'}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Login"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              fullWidth
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'gray' } }}
            />

            {!isEditing && (
              <TextField
                label="Senha"
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                fullWidth
                InputProps={{ style: { color: 'white' } }}
                InputLabelProps={{ style: { color: 'gray' } }}
              />
            )}

            <TextField
              label="CPF"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              fullWidth
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'gray' } }}
            />

            <TextField
              select
              label="Permissão"
              value={form.permissao}
              onChange={(e) => setForm({ ...form, permissao: e.target.value })}
              fullWidth
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'gray' } }}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
              <MenuItem value="caixa">Caixa</MenuItem>
            </TextField>

            <Button
              variant="contained"
              color="success"
              onClick={salvarUsuario}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
