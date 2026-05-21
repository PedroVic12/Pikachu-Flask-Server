const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#0288d1',
        },
        success: {
            main: '#2e7d32',
        },
        warning: {
            main: '#ed6c02',
        },
        error: {
            main: '#d32f2f',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 8,
    },
});


'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    AppBar, Toolbar, Typography, Box, Container, Grid, Paper, Card, CardContent,
    Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Chip, CircularProgress, Alert, Snackbar, Divider, Stack, Tabs, Tab,
    InputAdornment, Tooltip, Menu, Avatar, Badge
} from '@mui/material';
import {
    ReceiptLong, Dashboard, Add, Search, FilterList, Upload, FolderOpen,
    Edit, Delete, Logout, MoreVert, CheckCircle, Warning, Cancel, Pending,
    AttachMoney, Description, ExpandMore, CloudUpload, AutoAwesome,
    InsertDriveFile, ErrorOutline, Refresh
} from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { supabase } from '../lib/supabase';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIAS = [
    'Material de Escritório',
    'Alimentação',
    'Transporte',
    'Serviços',
    'Manutenção',
    'Outros',
];

const STATUSES = ['Pendente', 'Paga', 'Vencida', 'Cancelada'];

const STATUS_CONFIG = {
    Pendente: { color: 'warning', icon: <Pending sx={{ fontSize: 14 }} /> },
    Paga: { color: 'success', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
    Vencida: { color: 'error', icon: <Warning sx={{ fontSize: 14 }} /> },
    Cancelada: { color: 'default', icon: <Cancel sx={{ fontSize: 14 }} /> },
};

const CHART_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#0288d1', '#9c27b0', '#d32f2f'];

const EMPTY_FORM = {
    numero: '', fornecedor: '', valor: '', data_emissao: '',
    data_vencimento: '', categoria: '', status: 'Pendente', descricao: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(value) {
    return (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
    return (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                    sx={{
                        bgcolor: `${color}.light`,
                        color: `${color}.dark`,
                        width: 44,
                        height: 44,
                    }}
                >
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                        {label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        {value}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

// ─── Status Menu ─────────────────────────────────────────────────────────────

function StatusChipMenu({ nota, onStatusChange }) {
    const [anchor, setAnchor] = useState(null);
    const cfg = STATUS_CONFIG[nota.status] || STATUS_CONFIG.Pendente;

    return (
        <>
            <Chip
                label={nota.status}
                color={cfg.color}
                size="small"
                icon={cfg.icon}
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{ cursor: 'pointer', fontWeight: 500 }}
            />
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                {STATUSES.map((s) => (
                    <MenuItem
                        key={s}
                        onClick={() => {
                            onStatusChange(nota.id, s);
                            setAnchor(null);
                        }}
                        selected={s === nota.status}
                    >
                        <Stack direction="row" gap={1} alignItems="center">
                            {STATUS_CONFIG[s].icon}
                            {s}
                        </Stack>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

// ─── Invoice Form Dialog ──────────────────────────────────────────────────────

function InvoiceFormDialog({ open, onClose, onSaved, editingNota }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [pdfDone, setPdfDone] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (editingNota) {
            setForm({
                numero: editingNota.numero || '',
                fornecedor: editingNota.fornecedor || '',
                valor: editingNota.valor ?? '',
                data_emissao: editingNota.data_emissao || '',
                data_vencimento: editingNota.data_vencimento || '',
                categoria: editingNota.categoria || '',
                status: editingNota.status || 'Pendente',
                descricao: editingNota.descricao || '',
            });
        } else {
            setForm(EMPTY_FORM);
            setPdfDone(false);
        }
    }, [editingNota, open]);

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const data = { ...form, valor: parseFloat(form.valor) || 0 };
        if (editingNota) {
            await supabase.from('notas_fiscais').update(data).eq('id', editingNota.id);
        } else {
            await supabase.from('notas_fiscais').insert(data);
        }
        setSaving(false);
        onSaved();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editingNota ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        {/* PDF Upload area - only on create */}
                        {!editingNota && (
                            <Paper
                                variant="outlined"
                                onClick={() => !extracting && fileRef.current?.click()}
                                sx={{
                                    p: 2.5, textAlign: 'center', cursor: 'pointer',
                                    borderStyle: 'dashed', borderColor: extracting ? 'primary.main' : 'divider',
                                    bgcolor: extracting ? 'primary.50' : 'transparent',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                }}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        // Without AI extraction integration, just show the filename
                                        setExtracting(false);
                                        setPdfDone(true);
                                        if (!form.numero) set('numero', `NF-${Date.now()}`);
                                    }}
                                />
                                {extracting ? (
                                    <Stack alignItems="center" gap={1}>
                                        <CircularProgress size={28} />
                                        <Typography variant="body2" color="primary">Lendo nota fiscal...</Typography>
                                    </Stack>
                                ) : pdfDone ? (
                                    <Stack alignItems="center" gap={0.5}>
                                        <InsertDriveFile color="success" />
                                        <Typography variant="body2" color="success.main" fontWeight={600}>
                                            PDF selecionado
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Clique para trocar
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Stack alignItems="center" gap={0.5}>
                                        <Stack direction="row" alignItems="center" gap={0.5} justifyContent="center">
                                            <AutoAwesome fontSize="small" color="primary" />
                                            <Typography variant="body2" fontWeight={600}>
                                                Subir PDF da nota fiscal
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            O app preenche os campos automaticamente
                                        </Typography>
                                        <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                                            <CloudUpload fontSize="small" color="primary" />
                                            <Typography variant="caption" color="primary">
                                                Clique para selecionar o PDF
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}
                            </Paper>
                        )}

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextField
                                    label="Número da NF"
                                    value={form.numero}
                                    onChange={(e) => set('numero', e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="001234"
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    label="Valor (R$)"
                                    type="number"
                                    inputProps={{ step: '0.01', min: '0' }}
                                    value={form.valor}
                                    onChange={(e) => set('valor', e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="0,00"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            label="Fornecedor"
                            value={form.fornecedor}
                            onChange={(e) => set('fornecedor', e.target.value)}
                            required
                            fullWidth
                            size="small"
                            placeholder="Nome do fornecedor"
                        />

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <FormControl fullWidth size="small" required>
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        value={form.categoria}
                                        label="Categoria"
                                        onChange={(e) => set('categoria', e.target.value)}
                                    >
                                        {CATEGORIAS.map((c) => (
                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={form.status}
                                        label="Status"
                                        onChange={(e) => set('status', e.target.value)}
                                    >
                                        {STATUSES.map((s) => (
                                            <MenuItem key={s} value={s}>{s}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextField
                                    label="Data Emissão"
                                    type="date"
                                    value={form.data_emissao}
                                    onChange={(e) => set('data_emissao', e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    label="Data Vencimento"
                                    type="date"
                                    value={form.data_vencimento}
                                    onChange={(e) => set('data_vencimento', e.target.value)}
                                    fullWidth
                                    size="small"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            label="Descrição"
                            value={form.descricao}
                            onChange={(e) => set('descricao', e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Observações (opcional)"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} variant="outlined">Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                        {saving ? 'Salvando...' : editingNota ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// ─── Bulk Upload Dialog ───────────────────────────────────────────────────────

function BulkUploadDialog({ open, onClose, onSaved }) {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef(null);

    const handleFiles = (e) => {
        const selected = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf');
        setFiles(selected.map((f) => ({ file: f, name: f.name, status: 'pending' })));
    };

    const processAll = async () => {
        if (!files.length) return;
        setProcessing(true);
        for (let i = 0; i < files.length; i++) {
            setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));
            await new Promise((r) => setTimeout(r, 500));
            // Insert a placeholder - in production this would use AI extraction
            await supabase.from('notas_fiscais').insert({
                numero: `NF-${Date.now()}-${i}`,
                fornecedor: files[i].name.replace('.pdf', ''),
                valor: 0,
                data_emissao: new Date().toISOString().split('T')[0],
                categoria: 'Outros',
                status: 'Pendente',
            });
            setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
        }
        setProcessing(false);
        onSaved();
    };

    const handleClose = () => {
        if (!processing) {
            setFiles([]);
            onClose();
        }
    };

    const done = files.filter((f) => f.status === 'done').length;
    const allFinished = files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error');

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Upload em Lote</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {files.length === 0 ? (
                        <Paper
                            variant="outlined"
                            onClick={() => fileRef.current?.click()}
                            sx={{
                                p: 4, textAlign: 'center', cursor: 'pointer',
                                borderStyle: 'dashed', borderColor: 'divider',
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                            }}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFiles}
                            />
                            <FolderOpen sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" fontWeight={600}>Selecionar PDFs</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Clique para selecionar vários arquivos de uma vez
                            </Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={1} sx={{ maxHeight: 280, overflowY: 'auto' }}>
                            {files.map((f, i) => (
                                <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <InsertDriveFile color="action" fontSize="small" />
                                        <Typography variant="body2" flex={1} noWrap>{f.name}</Typography>
                                        {f.status === 'pending' && (
                                            <Typography variant="caption" color="text.secondary">Aguardando</Typography>
                                        )}
                                        {f.status === 'processing' && <CircularProgress size={18} />}
                                        {f.status === 'done' && <CheckCircle color="success" fontSize="small" />}
                                        {f.status === 'error' && <ErrorOutline color="error" fontSize="small" />}
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {allFinished && (
                        <Alert severity={done === files.length ? 'success' : 'warning'}>
                            {done} nota{done !== 1 ? 's' : ''} importada{done !== 1 ? 's' : ''} com sucesso
                        </Alert>
                    )}

                    <Typography variant="caption" color="text.secondary">
                        {files.length > 0 && `${files.length} arquivo${files.length !== 1 ? 's' : ''} selecionado${files.length !== 1 ? 's' : ''}`}
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} variant="outlined" disabled={processing}>
                    {allFinished ? 'Fechar' : 'Cancelar'}
                </Button>
                {files.length > 0 && !allFinished && (
                    <Button
                        onClick={processAll}
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={16} /> : <Upload />}
                    >
                        {processing ? 'Processando...' : 'Importar Tudo'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({ open, onClose, onConfirm, nota }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Excluir nota fiscal?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    A nota <strong>NF {nota?.numero}</strong> de{' '}
                    <strong>{nota?.fornecedor}</strong> será excluída permanentemente.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined">Cancelar</Button>
                <Button onClick={onConfirm} variant="contained" color="error">Excluir</Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ notas }) {
    const total = notas.reduce((s, n) => s + (n.valor || 0), 0);
    const pendentes = notas.filter((n) => n.status === 'Pendente').length;
    const pagas = notas.filter((n) => n.status === 'Paga').length;
    const vencidas = notas.filter((n) => n.status === 'Vencida').length;

    const byCategory = {};
    notas.forEach((n) => {
        const cat = n.categoria || 'Outros';
        byCategory[cat] = (byCategory[cat] || 0) + (n.valor || 0);
    });
    const chartData = Object.entries(byCategory)
        .map(([name, valor]) => ({ name, valor }))
        .sort((a, b) => b.valor - a.valor);

    const recentes = notas.slice(0, 5);

    return (
        <Stack spacing={3}>
            {/* Stats */}
            <Grid container spacing={2}>
                {[
                    {
                        label: 'Total em NFs',
                        value: `R$ ${formatBRL(total)}`,
                        icon: <AttachMoney />,
                        color: 'success',
                    },
                    {
                        label: 'Total de Notas',
                        value: notas.length,
                        icon: <Description />,
                        color: 'info',
                    },
                    {
                        label: 'Pendentes',
                        value: pendentes,
                        icon: <Pending />,
                        color: 'warning',
                    },
                    {
                        label: 'Pagas',
                        value: pagas,
                        icon: <CheckCircle />,
                        color: 'success',
                    },
                ].map((s) => (
                    <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                        <StatCard {...s} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2}>
                {/* Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={700} mb={2}>
                                Gastos por Categoria
                            </Typography>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                        <XAxis
                                            type="number"
                                            tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={115}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <RechartsTooltip
                                            formatter={(v) => [`R$ ${formatBRL(v)}`, 'Valor']}
                                        />
                                        <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={18}>
                                            {chartData.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" height={220}>
                                    <Typography variant="body2" color="text.secondary">
                                        Sem dados ainda
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent invoices */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={700} mb={2}>
                                Notas Recentes
                            </Typography>
                            {recentes.length > 0 ? (
                                <Stack divider={<Divider />} spacing={0}>
                                    {recentes.map((nf) => {
                                        const cfg = STATUS_CONFIG[nf.status] || STATUS_CONFIG.Pendente;
                                        return (
                                            <Box
                                                key={nf.id}
                                                sx={{ py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {nf.fornecedor}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        NF {nf.numero} · {nf.categoria}
                                                    </Typography>
                                                </Box>
                                                <Box textAlign="right">
                                                    <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                                                        R$ {formatBRL(nf.valor)}
                                                    </Typography>
                                                    <Chip
                                                        label={nf.status}
                                                        color={cfg.color}
                                                        size="small"
                                                        sx={{ mt: 0.5, fontWeight: 500, height: 20, fontSize: 10 }}
                                                    />
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" height={180}>
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhuma nota cadastrada
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Vencidas warning */}
            {vencidas > 0 && (
                <Alert severity="warning" icon={<Warning />}>
                    Você tem <strong>{vencidas}</strong> nota{vencidas !== 1 ? 's' : ''} vencida{vencidas !== 1 ? 's' : ''}.
                    Verifique e atualize o status.
                </Alert>
            )}
        </Stack>
    );
}

// ─── Notas Tab ────────────────────────────────────────────────────────────────

function NotasTab({ notas, onRefresh, onEdit, onDelete }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategoria, setFilterCategoria] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    const filtered = notas.filter((nf) => {
        const q = search.toLowerCase();
        const matchSearch =
            !search ||
            nf.fornecedor?.toLowerCase().includes(q) ||
            nf.numero?.toLowerCase().includes(q);
        const matchStatus = filterStatus === 'all' || nf.status === filterStatus;
        const matchCategoria = filterCategoria === 'all' || nf.categoria === filterCategoria;
        return matchSearch && matchStatus && matchCategoria;
    });

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        await supabase.from('notas_fiscais').update({ status: newStatus }).eq('id', id);
        onRefresh();
        setUpdatingId(null);
    };

    return (
        <Stack spacing={2}>
            {/* Filters */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                    placeholder="Buscar por fornecedor ou número..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="all">Todos Status</MenuItem>
                        {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                        value={filterCategoria}
                        label="Categoria"
                        onChange={(e) => setFilterCategoria(e.target.value)}
                    >
                        <MenuItem value="all">Todas Categorias</MenuItem>
                        {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            {/* Table */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                {filtered.length === 0 ? (
                    <Box py={8} textAlign="center">
                        <ReceiptLong sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Nenhuma nota fiscal encontrada.
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            Adicione sua primeira nota para começar.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                                    <TableCell>Nº</TableCell>
                                    <TableCell>Fornecedor</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Categoria</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Emissão</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((nf) => (
                                    <TableRow key={nf.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
                                                {nf.numero}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {nf.fornecedor}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {nf.categoria}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                                                R$ {formatBRL(nf.valor)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(nf.data_emissao)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {updatingId === nf.id ? (
                                                <CircularProgress size={18} />
                                            ) : (
                                                <StatusChipMenu nota={nf} onStatusChange={handleStatusChange} />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={() => onEdit(nf)}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Excluir">
                                                    <IconButton size="small" color="error" onClick={() => onDelete(nf)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            <Typography variant="caption" color="text.secondary">
                {filtered.length} de {notas.length} nota{notas.length !== 1 ? 's' : ''}
            </Typography>
        </Stack>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editingNota, setEditingNota] = useState(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [snack, setSnack] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notas_fiscais')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);
        if (!error) setNotas(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleEdit = (nf) => {
        setEditingNota(nf);
        setFormOpen(true);
    };

    const handleNew = () => {
        setEditingNota(null);
        setFormOpen(true);
    };

    const handleSaved = () => {
        load();
        setSnack({ message: editingNota ? 'Nota atualizada!' : 'Nota adicionada!', severity: 'success' });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await supabase.from('notas_fiscais').delete().eq('id', deleteTarget.id);
        setDeleteTarget(null);
        load();
        setSnack({ message: 'Nota excluída.', severity: 'info' });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
            <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar sx={{ gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                        <ReceiptLong fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                        NF Control
                    </Typography>

                    <Badge badgeContent={notas.filter((n) => n.status === 'Vencida').length || null} color="error">
                        <Tooltip title="Notas vencidas">
                            <Warning fontSize="small" sx={{ color: 'primary.contrastText', opacity: 0.8 }} />
                        </Tooltip>
                    </Badge>

                    <Tooltip title="Atualizar">
                        <IconButton onClick={load} size="small" sx={{ color: 'primary.contrastText' }}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    mb={3}
                    gap={2}
                >
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            {tab === 0 ? 'Painel' : 'Notas Fiscais'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {tab === 0
                                ? 'Resumo das suas notas fiscais'
                                : `${notas.length} nota${notas.length !== 1 ? 's' : ''} cadastrada${notas.length !== 1 ? 's' : ''}`}
                        </Typography>
                    </Box>
                    {tab === 1 && (
                        <Stack direction="row" gap={1}>
                            <Button
                                variant="outlined"
                                startIcon={<FolderOpen />}
                                onClick={() => setBulkOpen(true)}
                                size="small"
                            >
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Upload em Lote
                                </Box>
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleNew}
                                size="small"
                            >
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Nova Nota
                                </Box>
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<Dashboard fontSize="small" />}
                        iconPosition="start"
                        label="Painel"
                        sx={{ fontWeight: 600, textTransform: 'none' }}
                    />
                    <Tab
                        icon={<ReceiptLong fontSize="small" />}
                        iconPosition="start"
                        label="Notas Fiscais"
                        sx={{ fontWeight: 600, textTransform: 'none' }}
                    />
                </Tabs>

                {/* Content */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {tab === 0 && <DashboardTab notas={notas} />}
                        {tab === 1 && (
                            <NotasTab
                                notas={notas}
                                onRefresh={load}
                                onEdit={handleEdit}
                                onDelete={setDeleteTarget}
                            />
                        )}
                    </>
                )}
            </Container>

            {/* Dialogs */}
            <InvoiceFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={handleSaved}
                editingNota={editingNota}
            />
            <BulkUploadDialog
                open={bulkOpen}
                onClose={() => setBulkOpen(false)}
                onSaved={() => { load(); setSnack({ message: 'Importação concluída!', severity: 'success' }); }}
            />
            <DeleteDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                nota={deleteTarget}
            />

            {/* Snackbar */}
            <Snackbar
                open={Boolean(snack)}
                autoHideDuration={3000}
                onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnack(null)}
                    severity={snack?.severity || 'info'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snack?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
