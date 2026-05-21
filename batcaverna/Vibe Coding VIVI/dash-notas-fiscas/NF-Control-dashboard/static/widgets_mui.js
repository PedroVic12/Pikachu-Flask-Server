// Verificar se as dependências globais existem
if (typeof React === 'undefined') throw new Error('React não carregado');
if (typeof MaterialUI === 'undefined') throw new Error('MaterialUI não carregado');
if (typeof Recharts === 'undefined') throw new Error('Recharts não carregado');

const { useState, useEffect, useRef, useCallback } = React;
const MUI = MaterialUI;
const {
    AppBar, Toolbar, Typography, Box, Container, Grid, Paper, Card, CardContent,
    Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Chip, CircularProgress, Alert, Snackbar, Divider, Stack, Tabs, Tab,
    InputAdornment, Tooltip, Menu, Avatar, Badge, createTheme, ThemeProvider
} = MUI;

const { BarChart, Bar, XAxis, YAxis, Tooltip: RechartsTooltip, ResponsiveContainer, Cell } = Recharts;

// Tema escuro
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        secondary: { main: '#0ea5e9' },
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        background: { default: '#09090b', paper: '#18181b' },
        text: { primary: '#fafafa', secondary: '#a1a1aa' }
    },
    typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
    shape: { borderRadius: 10 },
    components: {
        MuiCard: { styleOverrides: { root: { border: '1px solid #27272a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' } } },
        MuiAppBar: { styleOverrides: { root: { backgroundColor: '#0f0f12', backgroundImage: 'none' } } }
    }
});

const CATEGORIAS = ['Material de Escritório', 'Alimentação', 'Transporte', 'Serviços', 'Manutenção', 'Outros'];
const STATUSES = ['Pendente', 'Paga', 'Vencida', 'Cancelada'];
const STATUS_CONFIG = {
    Pendente: { color: 'warning', icon: 'Pending' },
    Paga: { color: 'success', icon: 'CheckCircle' },
    Vencida: { color: 'error', icon: 'Warning' },
    Cancelada: { color: 'default', icon: 'Cancel' }
};
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ef4444'];

function formatBRL(v) { return (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
function formatDate(d) { if (!d) return '—'; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; }

// Função segura para ícones
function safeIcon(iconName, props = {}) {
    const IconComp = MUI.Icons?.[iconName];
    return IconComp ? React.createElement(IconComp, props) : React.createElement('span', props, iconName);
}

// Componentes (mesmos do código anterior, mas usando safeIcon)
const StatCard = ({ label, value, iconName, color }) => React.createElement(Card, { elevation: 0, sx: { border: '1px solid #27272a', bgcolor: 'background.paper', height: '100%' } },
    React.createElement(CardContent, { sx: { display: 'flex', alignItems: 'flex-start', gap: 2 } },
        React.createElement(Avatar, { sx: { bgcolor: `${color}.800`, color: `${color}.400`, width: 44, height: 44 } }, safeIcon(iconName, { fontSize: 'small' })),
        React.createElement(Box, null,
            React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, label),
            React.createElement(Typography, { variant: 'h6', fontWeight: 700, color: 'text.primary' }, value)
        )
    )
);

// Incluir o restante dos componentes (StatusChipMenu, InvoiceFormDialog, BulkUploadDialog, DeleteDialog, DashboardTab, NotasTab)
// ... (copie exatamente os componentes do código anterior, pois eles já usam safeIcon e estão corretos)

// App principal (idêntico ao último código funcional)
const App = () => {
    // ... (igual ao último App.js que funcionou, apenas garanta que safeIcon seja usado)
};

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ThemeProvider, { theme: darkTheme }, React.createElement(App)));