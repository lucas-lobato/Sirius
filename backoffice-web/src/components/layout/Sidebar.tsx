'use client';
import { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Divider,
  Collapse,
  Box,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  AccountBalance,
  Inventory,
  Settings,
  RestaurantMenu,
  DataThresholding,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

const drawerWidth = 250;

const sections = [
  {
    title: 'Compras',
    icon: <ShoppingCart />,
    items: [
      { label: 'Cotação de Preços', path: '/cotacao' },
      { label: 'Fornecedores', path: '/fornecedores' },
    ],
  },
  {
    title: 'Financeiro',
    icon: <AccountBalance />,
    items: [
      { label: 'Contas a Pagar', path: '/contas-pagar' },
      { label: 'Contas a Receber', path: '/contas-receber' },
      { label: 'Balancete', path: '/balancete' },
      { label: 'Movimentação Bancária', path: '/mov-bancaria' },
      { label: 'Plano de Contas', path: '/plano-contas' },
      { label: 'Notas Fiscais', path: '/notas-fiscais' },
      { label: 'DRE', path: '/dre' },
      { label: 'Livro Caixa', path: '/livro-caixa' },
      { label: 'Conciliação Bancária', path: '/conciliacao' },
    ],
  },
  {
    title: 'Estoque',
    icon: <Inventory />,
    items: [
      { label: 'Estoque', path: '/estoque' },
      { label: 'Transferência de Estoque', path: '/transferencia' },
    ],
  },
  {
    title: 'Configurações',
    icon: <Settings />,
    items: [
      { label: 'Configurações Gerais', path: '/configuracoes' },
      { label: 'Integrações', path: '/configuracoes/integracoes' },
      { label: 'Cadastro de Usuários', path: '/configuracoes/usuarios' },
    ],
  },
  {
    title: 'Cardápio',
    icon: <RestaurantMenu />,
    items: [
      { label: 'Produtos', path: '/cardapio/produtos' },
      { label: 'Insumos', path: '/cardapio/insumos' },
      { label: 'Ficha Técnica', path: '/cardapio/ficha-tecnica' },
    ],
  },
  {
    title: 'Relatórios',
    icon: <DataThresholding />,
    items: [
      { label: 'Pedidos', path: '/relatorios/relatorioPedidos' },
      { label: 'Itens Vendidos', path: '/relatorios/relatorioItensVendidos' },
      { label: 'Fast Report', path: '/relatorios/relatorioFastReport' },
      { label: 'Forecast', path: '/relatorios/relatorioForecast' },
    ],
  },
];

export default function Sidebar({ open, toggleDrawer }: { open: boolean; toggleDrawer: () => void }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleCategory = (title: string) =>
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );

  useEffect(() => {
    if (!open) setExpanded([]);
  }, [open]);

  return (
    open && (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: 'linear-gradient(180deg, #0D1117 0%, #141A23 100%)',
            color: '#FFFFFF',
            borderRight: '1px solid #B68743',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
          },
        }}
      >
        {/* 🔹 Cabeçalho com logo */}
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '1px solid #B68743',
            height: 64,
          }}
        >
          <Image
            src="/logo.png"
            alt="Sirius Logo"
            width={120}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </Toolbar>

        {/* 🔹 Botão de fechar menu */}
        <Box sx={{ px: 1, py: 1 }}>
          <ListItemButton
            onClick={toggleDrawer}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': { backgroundColor: '#B68743' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: '#cfcfcf' }}>
              <MenuIcon />
            </ListItemIcon>
            <ListItemText
              primary="Fechar Menu"
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </ListItemButton>
        </Box>

        <Divider sx={{ borderColor: '#B68743' }} />

        {/* 🔹 Seções */}
        <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
          {sections.map((section) => {
            const isExpanded = expanded.includes(section.title);
            return (
              <Box key={section.title}>
                <ListItemButton
                  onClick={() => toggleCategory(section.title)}
                  sx={{
                    pl: 2,
                    borderRadius: 1,
                    mb: 0.3,
                    '&:hover': { backgroundColor: '#B68743' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#cfcfcf' }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.title}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.items.map((item) => (
                      <ListItemButton
                        key={item.label}
                        component={Link}
                        href={item.path}
                        sx={{
                          pl: 6,
                          py: 0.7,
                          borderLeft: '2px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: '#B68743',
                            borderLeft: '2px solid #90CAF9',
                          },
                        }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 13,
                            color: 'rgba(255,255,255,0.85)',
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>

        {/* 🔹 Rodapé */}
        <Box
          sx={{
            py: 1,
            textAlign: 'center',
            borderTop: '1px solid #B68743',
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          Sirius Backoffice © {new Date().getFullYear()}
        </Box>
      </Drawer>
    )
  );
}
