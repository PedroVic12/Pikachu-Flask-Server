// Fallback seguro para ícones do Material-UI
const MuiIcons = window.MaterialUI?.Icons || {};
function safeIcon(name, props = {}) {
    const IconComp = MuiIcons[name];
    return IconComp ? React.createElement(IconComp, props) : React.createElement('span', props, name);
}

const { useState, useEffect, useRef, useCallback } = React;
const MUI = window.MaterialUI;
const {
    AppBar, Toolbar, Typography, Box, Container, Grid, Paper, Card, CardContent,
    Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Chip, CircularProgress, Alert, Snackbar, Divider, Stack, Tabs, Tab,
    InputAdornment, Tooltip, Menu, Avatar, Badge, createTheme, ThemeProvider
} = MUI;

const { BarChart, Bar, XAxis, YAxis, Tooltip: RechartsTooltip, ResponsiveContainer, Cell } = Recharts;

// Tema escuro "Batcaverna/Tech"
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

// ---------- Componentes ----------
const StatCard = ({ label, value, iconName, color }) => React.createElement(Card, { elevation: 0, sx: { border: '1px solid #27272a', bgcolor: 'background.paper', height: '100%' } },
    React.createElement(CardContent, { sx: { display: 'flex', alignItems: 'flex-start', gap: 2 } },
        React.createElement(Avatar, { sx: { bgcolor: `${color}.800`, color: `${color}.400`, width: 44, height: 44 } }, safeIcon(iconName, { fontSize: 'small' })),
        React.createElement(Box, null,
            React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, label),
            React.createElement(Typography, { variant: 'h6', fontWeight: 700, color: 'text.primary' }, value)
        )
    )
);

const StatusChipMenu = ({ nota, onStatusChange }) => {
    const [anchor, setAnchor] = useState(null);
    const cfg = STATUS_CONFIG[nota.status] || STATUS_CONFIG.Pendente;
    return React.createElement(React.Fragment, null,
        React.createElement(Chip, { label: nota.status, color: cfg.color, size: "small", icon: safeIcon(cfg.icon, { fontSize: 'small' }), onClick: e => setAnchor(e.currentTarget), sx: { cursor: 'pointer', fontWeight: 500 } }),
        React.createElement(Menu, { anchorEl: anchor, open: Boolean(anchor), onClose: () => setAnchor(null) },
            STATUSES.map(s => React.createElement(MenuItem, { key: s, onClick: () => { onStatusChange(nota.id, s); setAnchor(null); }, selected: s === nota.status }, s))
        )
    );
};

// Dialog de formulário (com OCR)
const InvoiceFormDialog = ({ open, onClose, onSaved, editingNota }) => {
    const EMPTY = { numero: '', fornecedor: '', valor: '', data_emissao: '', data_vencimento: '', categoria: '', status: 'Pendente', descricao: '' };
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [pdfDone, setPdfDone] = useState(false);
    const fileRef = useRef(null);
    useEffect(() => {
        if (editingNota) setForm({ ...EMPTY, ...editingNota });
        else { setForm(EMPTY); setPdfDone(false); }
    }, [editingNota, open]);
    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        const data = { ...form, valor: parseFloat(form.valor) || 0 };
        const url = editingNota ? `/api/notas/${editingNota.id}` : '/api/notas';
        await fetch(url, { method: editingNota ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        setSaving(false); onSaved(); onClose();
    };
    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setExtracting(true);
        const fd = new FormData(); fd.append('pdf', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) { setForm(f => ({ ...f, ...data })); setPdfDone(true); }
        setExtracting(false);
    };
    return React.createElement(Dialog, { open, onClose, maxWidth: "sm", fullWidth: true, PaperProps: { sx: { bgcolor: 'background.paper' } } },
        React.createElement(DialogTitle, { sx: { fontWeight: 700 } }, editingNota ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'),
        React.createElement("form", { onSubmit: handleSubmit },
            React.createElement(DialogContent, { dividers: true },
                React.createElement(Stack, { spacing: 2 },
                    !editingNota && React.createElement(Paper, { variant: "outlined", onClick: () => !extracting && fileRef.current?.click(), sx: { p: 2.5, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' } },
                        React.createElement("input", { ref: fileRef, type: "file", accept: ".pdf", style: { display: 'none' }, onChange: handlePdfUpload }),
                        extracting ? React.createElement(Stack, { alignItems: "center", gap: 1 }, React.createElement(CircularProgress, { size: 28 }), React.createElement(Typography, { variant: "body2", color: "primary" }, "Processando OCR..."))
                            : pdfDone ? React.createElement(Stack, { alignItems: "center", gap: 0.5 }, safeIcon('InsertDriveFile', { color: "success" }), React.createElement(Typography, { variant: "body2", color: "success.main" }, "PDF processado"))
                                : React.createElement(Stack, { alignItems: "center", gap: 0.5 }, safeIcon('CloudUpload', { fontSize: "small", color: "primary" }), React.createElement(Typography, { variant: "body2" }, "Clique para enviar PDF"))
                    ),
                    React.createElement(Grid, { container: true, spacing: 2 },
                        React.createElement(Grid, { size: 6 }, React.createElement(TextField, { label: "Número", value: form.numero, onChange: e => setField('numero', e.target.value), required: true, fullWidth: true, size: "small" })),
                        React.createElement(Grid, { size: 6 }, React.createElement(TextField, { label: "Valor (R$)", type: "number", value: form.valor, onChange: e => setField('valor', e.target.value), required: true, fullWidth: true, size: "small", InputProps: { startAdornment: React.createElement(InputAdornment, { position: "start" }, "R$") } }))
                    ),
                    React.createElement(TextField, { label: "Fornecedor", value: form.fornecedor, onChange: e => setField('fornecedor', e.target.value), required: true, fullWidth: true, size: "small" }),
                    React.createElement(Grid, { container: true, spacing: 2 },
                        React.createElement(Grid, { size: 6 }, React.createElement(FormControl, { fullWidth: true, size: "small" }, React.createElement(InputLabel, null, "Categoria"), React.createElement(Select, { value: form.categoria, label: "Categoria", onChange: e => setField('categoria', e.target.value) }, CATEGORIAS.map(c => React.createElement(MenuItem, { key: c, value: c }, c))))),
                        React.createElement(Grid, { size: 6 }, React.createElement(FormControl, { fullWidth: true, size: "small" }, React.createElement(InputLabel, null, "Status"), React.createElement(Select, { value: form.status, label: "Status", onChange: e => setField('status', e.target.value) }, STATUSES.map(s => React.createElement(MenuItem, { key: s, value: s }, s)))))
                    ),
                    React.createElement(Grid, { container: true, spacing: 2 },
                        React.createElement(Grid, { size: 6 }, React.createElement(TextField, { label: "Data Emissão", type: "date", value: form.data_emissao, onChange: e => setField('data_emissao', e.target.value), required: true, fullWidth: true, size: "small", slotProps: { inputLabel: { shrink: true } } })),
                        React.createElement(Grid, { size: 6 }, React.createElement(TextField, { label: "Data Vencimento", type: "date", value: form.data_vencimento, onChange: e => setField('data_vencimento', e.target.value), fullWidth: true, size: "small", slotProps: { inputLabel: { shrink: true } } }))
                    ),
                    React.createElement(TextField, { label: "Descrição", value: form.descricao, onChange: e => setField('descricao', e.target.value), fullWidth: true, size: "small", multiline: true, rows: 2 })
                )
            ),
            React.createElement(DialogActions, { sx: { px: 3, py: 2 } },
                React.createElement(Button, { onClick: onClose, variant: "outlined" }, "Cancelar"),
                React.createElement(Button, { type: "submit", variant: "contained", disabled: saving }, saving ? 'Salvando...' : editingNota ? 'Salvar' : 'Adicionar')
            )
        )
    );
};

const BulkUploadDialog = ({ open, onClose, onSaved }) => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef(null);
    const handleFiles = (e) => setFiles(Array.from(e.target.files || []).filter(f => f.type === 'application/pdf').map(f => ({ file: f, name: f.name, status: 'pending' })));
    const processAll = async () => {
        if (!files.length) return;
        setProcessing(true);
        const fd = new FormData();
        files.forEach(f => fd.append('pdfs', f.file));
        const res = await fetch('/api/bulk-upload', { method: 'POST', body: fd });
        if (res.ok) setFiles(prev => prev.map(f => ({ ...f, status: 'done' })));
        else setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
        setProcessing(false);
        onSaved();
    };
    const handleClose = () => { if (!processing) { setFiles([]); onClose(); } };
    const done = files.filter(f => f.status === 'done').length;
    const allFinished = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error');
    return React.createElement(Dialog, { open, onClose: handleClose, maxWidth: "sm", fullWidth: true, PaperProps: { sx: { bgcolor: 'background.paper' } } },
        React.createElement(DialogTitle, { sx: { fontWeight: 700 } }, "Upload em Lote"),
        React.createElement(DialogContent, { dividers: true },
            React.createElement(Stack, { spacing: 2 },
                files.length === 0 ? React.createElement(Paper, { variant: "outlined", onClick: () => fileRef.current?.click(), sx: { p: 4, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' } },
                    React.createElement("input", { ref: fileRef, type: "file", accept: ".pdf", multiple: true, style: { display: 'none' }, onChange: handleFiles }),
                    safeIcon('FolderOpen', { sx: { fontSize: 40, color: 'text.secondary', mb: 1 } }),
                    React.createElement(Typography, { variant: "body2", fontWeight: 600 }, "Selecionar PDFs")
                ) : React.createElement(Stack, { spacing: 1, sx: { maxHeight: 280, overflowY: 'auto' } },
                    files.map((f, i) => React.createElement(Paper, { key: i, variant: "outlined", sx: { p: 1.5 } },
                        React.createElement(Stack, { direction: "row", alignItems: "center", gap: 1.5 },
                            safeIcon('InsertDriveFile', { fontSize: "small" }),
                            React.createElement(Typography, { variant: "body2", flex: 1, noWrap: true }, f.name),
                            f.status === 'pending' && React.createElement(Typography, { variant: "caption", color: "text.secondary" }, "Aguardando"),
                            f.status === 'processing' && React.createElement(CircularProgress, { size: 18 }),
                            f.status === 'done' && safeIcon('CheckCircle', { color: "success", fontSize: "small" }),
                            f.status === 'error' && safeIcon('ErrorOutline', { color: "error", fontSize: "small" })
                        )
                    ))
                ),
                allFinished && React.createElement(Alert, { severity: done === files.length ? 'success' : 'warning' }, `${done} nota(s) importada(s)`),
                React.createElement(Typography, { variant: "caption", color: "text.secondary" }, files.length > 0 && `${files.length} arquivo(s) selecionado(s)`)
            )
        ),
        React.createElement(DialogActions, { sx: { px: 3, py: 2 } },
            React.createElement(Button, { onClick: handleClose, variant: "outlined", disabled: processing }, allFinished ? 'Fechar' : 'Cancelar'),
            files.length > 0 && !allFinished && React.createElement(Button, { onClick: processAll, variant: "contained", disabled: processing, startIcon: processing ? React.createElement(CircularProgress, { size: 16 }) : safeIcon('Upload') }, processing ? 'Processando...' : 'Importar Tudo')
        )
    );
};

const DeleteDialog = ({ open, onClose, onConfirm, nota }) => React.createElement(Dialog, { open, onClose, maxWidth: "xs", fullWidth: true, PaperProps: { sx: { bgcolor: 'background.paper' } } },
    React.createElement(DialogTitle, null, "Excluir nota fiscal?"),
    React.createElement(DialogContent, null, React.createElement(DialogContentText, { sx: { color: 'text.secondary' } }, "A nota ", React.createElement("strong", null, `NF ${nota?.numero}`), " de ", React.createElement("strong", null, nota?.fornecedor), " será excluída.")),
    React.createElement(DialogActions, { sx: { px: 3, py: 2 } },
        React.createElement(Button, { onClick: onClose, variant: "outlined" }, "Cancelar"),
        React.createElement(Button, { onClick: onConfirm, variant: "contained", color: "error" }, "Excluir")
    )
);

// ---------- Abas ----------
const DashboardTab = ({ notas }) => {
    const total = notas.reduce((s, n) => s + (n.valor || 0), 0);
    const pendentes = notas.filter(n => n.status === 'Pendente').length;
    const pagas = notas.filter(n => n.status === 'Paga').length;
    const vencidas = notas.filter(n => n.status === 'Vencida').length;
    const byCat = {};
    notas.forEach(n => { const cat = n.categoria || 'Outros'; byCat[cat] = (byCat[cat] || 0) + (n.valor || 0); });
    const chartData = Object.entries(byCat).map(([name, valor]) => ({ name, valor })).sort((a, b) => b.valor - a.valor);
    const recentes = notas.slice(0, 5);
    return React.createElement(Stack, { spacing: 3 },
        React.createElement(Grid, { container: true, spacing: 2 },
            [
                { label: "Total em NFs", value: `R$ ${formatBRL(total)}`, iconName: 'AttachMoney', color: 'success' },
                { label: "Total de Notas", value: notas.length, iconName: 'Description', color: 'info' },
                { label: "Pendentes", value: pendentes, iconName: 'Pending', color: 'warning' },
                { label: "Pagas", value: pagas, iconName: 'CheckCircle', color: 'success' }
            ].map(s => React.createElement(Grid, { key: s.label, size: { xs: 6, md: 3 } }, React.createElement(StatCard, s)))
        ),
        React.createElement(Grid, { container: true, spacing: 2 },
            React.createElement(Grid, { size: { xs: 12, md: 6 } },
                React.createElement(Card, { sx: { border: '1px solid #27272a', bgcolor: 'background.paper' } },
                    React.createElement(CardContent, null,
                        React.createElement(Typography, { variant: "subtitle2", fontWeight: 700, mb: 2 }, "Gastos por Categoria"),
                        chartData.length ? React.createElement(ResponsiveContainer, { width: "100%", height: 220 },
                            React.createElement(BarChart, { data: chartData, layout: "vertical", margin: { left: 10, right: 20 } },
                                React.createElement(XAxis, { type: "number", tickFormatter: v => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` }),
                                React.createElement(YAxis, { type: "category", dataKey: "name", width: 115 }),
                                React.createElement(RechartsTooltip, { formatter: v => [`R$ ${formatBRL(v)}`, 'Valor'] }),
                                React.createElement(Bar, { dataKey: "valor", radius: [0, 6, 6, 0], barSize: 18 }, chartData.map((_, i) => React.createElement(Cell, { key: i, fill: CHART_COLORS[i % CHART_COLORS.length] })))
                            )
                        ) : React.createElement(Box, { height: 220, display: "flex", alignItems: "center", justifyContent: "center" }, React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "Sem dados"))
                    )
                )
            ),
            React.createElement(Grid, { size: { xs: 12, md: 6 } },
                React.createElement(Card, { sx: { border: '1px solid #27272a', bgcolor: 'background.paper' } },
                    React.createElement(CardContent, null,
                        React.createElement(Typography, { variant: "subtitle2", fontWeight: 700, mb: 2 }, "Notas Recentes"),
                        recentes.length ? React.createElement(Stack, { divider: React.createElement(Divider, null), spacing: 0 },
                            recentes.map(nf => React.createElement(Box, { key: nf.id, sx: { py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                React.createElement(Box, null,
                                    React.createElement(Typography, { variant: "body2", fontWeight: 600 }, nf.fornecedor),
                                    React.createElement(Typography, { variant: "caption", color: "text.secondary" }, `NF ${nf.numero} · ${nf.categoria}`)
                                ),
                                React.createElement(Box, { textAlign: "right" },
                                    React.createElement(Typography, { variant: "body2", fontWeight: 700, fontFamily: "monospace" }, `R$ ${formatBRL(nf.valor)}`),
                                    React.createElement(Chip, { label: nf.status, color: STATUS_CONFIG[nf.status]?.color || 'default', size: "small", sx: { mt: 0.5, height: 20, fontSize: 10 } })
                                )
                            ))
                        ) : React.createElement(Box, { height: 180, display: "flex", alignItems: "center", justifyContent: "center" }, React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "Nenhuma nota"))
                    )
                )
            )
        ),
        vencidas > 0 && React.createElement(Alert, { severity: "warning", icon: safeIcon('Warning') }, `Você tem ${vencidas} nota(s) vencida(s).`)
    );
};

const NotasTab = ({ notas, onRefresh, onEdit, onDelete }) => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategoria, setFilterCategoria] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const filtered = notas.filter(nf =>
        (!search || nf.fornecedor?.toLowerCase().includes(search.toLowerCase()) || nf.numero?.toLowerCase().includes(search.toLowerCase())) &&
        (filterStatus === 'all' || nf.status === filterStatus) &&
        (filterCategoria === 'all' || nf.categoria === filterCategoria)
    );
    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        await fetch(`/api/notas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
        onRefresh();
        setUpdatingId(null);
    };
    return React.createElement(Stack, { spacing: 2 },
        React.createElement(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5 },
            React.createElement(TextField, { placeholder: "Buscar...", size: "small", value: search, onChange: e => setSearch(e.target.value), sx: { flex: 1 }, InputProps: { startAdornment: React.createElement(InputAdornment, { position: "start" }, safeIcon('Search', { fontSize: "small" })) } }),
            React.createElement(FormControl, { size: "small", sx: { minWidth: 150 } }, React.createElement(InputLabel, null, "Status"), React.createElement(Select, { value: filterStatus, label: "Status", onChange: e => setFilterStatus(e.target.value) }, React.createElement(MenuItem, { value: "all" }, "Todos"), STATUSES.map(s => React.createElement(MenuItem, { key: s, value: s }, s)))),
            React.createElement(FormControl, { size: "small", sx: { minWidth: 180 } }, React.createElement(InputLabel, null, "Categoria"), React.createElement(Select, { value: filterCategoria, label: "Categoria", onChange: e => setFilterCategoria(e.target.value) }, React.createElement(MenuItem, { value: "all" }, "Todas"), CATEGORIAS.map(c => React.createElement(MenuItem, { key: c, value: c }, c))))
        ),
        React.createElement(Card, { sx: { border: '1px solid #27272a', bgcolor: 'background.paper' } },
            filtered.length === 0 ? React.createElement(Box, { py: 8, textAlign: "center" }, safeIcon('ReceiptLong', { sx: { fontSize: 48, color: 'text.disabled' } }), React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "Nenhuma nota encontrada"))
                : React.createElement(TableContainer, null,
                    React.createElement(Table, { size: "small" },
                        React.createElement(TableHead, null,
                            React.createElement(TableRow, { sx: { '& th': { fontWeight: 700, bgcolor: 'action.hover' } } },
                                React.createElement(TableCell, null, "Nº"), React.createElement(TableCell, null, "Fornecedor"),
                                React.createElement(TableCell, { sx: { display: { xs: 'none', sm: 'table-cell' } } }, "Categoria"),
                                React.createElement(TableCell, { align: "right" }, "Valor"),
                                React.createElement(TableCell, { sx: { display: { xs: 'none', md: 'table-cell' } } }, "Emissão"),
                                React.createElement(TableCell, null, "Status"), React.createElement(TableCell, { align: "right" }, "Ações")
                            )
                        ),
                        React.createElement(TableBody, null,
                            filtered.map(nf => React.createElement(TableRow, { key: nf.id, hover: true },
                                React.createElement(TableCell, null, React.createElement(Typography, { variant: "caption", fontFamily: "monospace", fontWeight: 600 }, nf.numero)),
                                React.createElement(TableCell, null, React.createElement(Typography, { variant: "body2", fontWeight: 600 }, nf.fornecedor)),
                                React.createElement(TableCell, { sx: { display: { xs: 'none', sm: 'table-cell' } } }, React.createElement(Typography, { variant: "body2", color: "text.secondary" }, nf.categoria)),
                                React.createElement(TableCell, { align: "right" }, React.createElement(Typography, { variant: "body2", fontWeight: 700, fontFamily: "monospace" }, `R$ ${formatBRL(nf.valor)}`)),
                                React.createElement(TableCell, { sx: { display: { xs: 'none', md: 'table-cell' } } }, React.createElement(Typography, { variant: "body2", color: "text.secondary" }, formatDate(nf.data_emissao))),
                                React.createElement(TableCell, null, updatingId === nf.id ? React.createElement(CircularProgress, { size: 18 }) : React.createElement(StatusChipMenu, { nota: nf, onStatusChange: handleStatusChange })),
                                React.createElement(TableCell, { align: "right" },
                                    React.createElement(Stack, { direction: "row", justifyContent: "flex-end", gap: 0.5 },
                                        React.createElement(Tooltip, { title: "Editar" }, React.createElement(IconButton, { size: "small", onClick: () => onEdit(nf) }, safeIcon('Edit', { fontSize: "small" }))),
                                        React.createElement(Tooltip, { title: "Excluir" }, React.createElement(IconButton, { size: "small", color: "error", onClick: () => onDelete(nf) }, safeIcon('Delete', { fontSize: "small" })))
                                    )
                                )
                            ))
                        )
                    )
                )
        ),
        React.createElement(Typography, { variant: "caption", color: "text.secondary" }, `${filtered.length} de ${notas.length} nota(s)`)
    );
};

// ---------- App principal ----------
const App = () => {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editingNota, setEditingNota] = useState(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [snack, setSnack] = useState(null);

    const load = useCallback(async () => { setLoading(true); const res = await fetch('/api/notas'); const data = await res.json(); setNotas(data); setLoading(false); }, []);
    useEffect(() => { load(); }, [load]);

    const handleEdit = (nf) => { setEditingNota(nf); setFormOpen(true); };
    const handleNew = () => { setEditingNota(null); setFormOpen(true); };
    const handleSaved = () => { load(); setSnack({ message: editingNota ? 'Nota atualizada!' : 'Nota adicionada!', severity: 'success' }); };
    const handleDelete = async () => { if (!deleteTarget) return; await fetch(`/api/notas/${deleteTarget.id}`, { method: 'DELETE' }); setDeleteTarget(null); load(); setSnack({ message: 'Nota excluída.', severity: 'info' }); };
    const handleClearDB = async () => { if (confirm('Limpar TODAS as notas?')) { await fetch('/api/limpar_banco', { method: 'DELETE' }); load(); setSnack({ message: 'Banco limpo.', severity: 'warning' }); } };
    const handleExport = () => window.open('/api/exportar-excel', '_blank');

    return React.createElement(ThemeProvider, { theme: darkTheme },
        React.createElement(Box, { sx: { minHeight: '100vh', bgcolor: 'background.default' } },
            React.createElement(AppBar, { position: "sticky", elevation: 0, sx: { borderBottom: '1px solid #27272a' } },
                React.createElement(Toolbar, { sx: { gap: 2 } },
                    React.createElement(Avatar, { sx: { bgcolor: 'primary.main', width: 36, height: 36 } }, safeIcon('ReceiptLong', { fontSize: "small" })),
                    React.createElement(Typography, { variant: "h6", fontWeight: 700, sx: { flexGrow: 1 } }, "NF Control"),
                    React.createElement(Badge, { badgeContent: notas.filter(n => n.status === 'Vencida').length || null, color: "error" }, React.createElement(Tooltip, { title: "Vencidas" }, safeIcon('Warning', { fontSize: "small" }))),
                    React.createElement(Tooltip, { title: "Exportar Excel" }, React.createElement(IconButton, { onClick: handleExport }, safeIcon('TableChart'))),
                    React.createElement(Tooltip, { title: "Limpar Banco" }, React.createElement(IconButton, { onClick: handleClearDB, sx: { color: 'error.main' } }, safeIcon('DeleteSweep'))),
                    React.createElement(Tooltip, { title: "Atualizar" }, React.createElement(IconButton, { onClick: load }, safeIcon('Refresh')))
                )
            ),
            React.createElement(Container, { maxWidth: "lg", sx: { py: 4 } },
                React.createElement(Stack, { direction: { xs: 'column', sm: 'row' }, justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 },
                    React.createElement(Box, null,
                        React.createElement(Typography, { variant: "h5", fontWeight: 700 }, tab === 0 ? 'Painel' : 'Notas Fiscais'),
                        React.createElement(Typography, { variant: "body2", color: "text.secondary" }, tab === 0 ? 'Resumo das notas' : `${notas.length} nota(s) cadastrada(s)`)
                    ),
                    tab === 1 && React.createElement(Stack, { direction: "row", gap: 1 },
                        React.createElement(Button, { variant: "outlined", startIcon: safeIcon('FolderOpen'), onClick: () => setBulkOpen(true), size: "small" }, "Upload em Lote"),
                        React.createElement(Button, { variant: "contained", startIcon: safeIcon('Add'), onClick: handleNew, size: "small" }, "Nova Nota")
                    )
                ),
                React.createElement(Tabs, { value: tab, onChange: (_, v) => setTab(v), sx: { mb: 3, borderBottom: 1, borderColor: 'divider' } },
                    React.createElement(Tab, { icon: safeIcon('Dashboard', { fontSize: "small" }), iconPosition: "start", label: "Painel", sx: { fontWeight: 600 } }),
                    React.createElement(Tab, { icon: safeIcon('ReceiptLong', { fontSize: "small" }), iconPosition: "start", label: "Notas Fiscais", sx: { fontWeight: 600 } })
                ),
                loading ? React.createElement(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: 300 }, React.createElement(CircularProgress, null))
                    : React.createElement(React.Fragment, null,
                        tab === 0 && React.createElement(DashboardTab, { notas }),
                        tab === 1 && React.createElement(NotasTab, { notas, onRefresh: load, onEdit: handleEdit, onDelete: setDeleteTarget })
                    )
            ),
            React.createElement(InvoiceFormDialog, { open: formOpen, onClose: () => setFormOpen(false), onSaved: handleSaved, editingNota }),
            React.createElement(BulkUploadDialog, { open: bulkOpen, onClose: () => setBulkOpen(false), onSaved: () => { load(); setSnack({ message: 'Importação concluída!', severity: 'success' }); } }),
            React.createElement(DeleteDialog, { open: Boolean(deleteTarget), onClose: () => setDeleteTarget(null), onConfirm: handleDelete, nota: deleteTarget }),
            React.createElement(Snackbar, { open: Boolean(snack), autoHideDuration: 3000, onClose: () => setSnack(null), anchorOrigin: { vertical: 'bottom', horizontal: 'center' } },
                React.createElement(Alert, { onClose: () => setSnack(null), severity: snack?.severity || 'info', variant: "filled" }, snack?.message)
            )
        )
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));