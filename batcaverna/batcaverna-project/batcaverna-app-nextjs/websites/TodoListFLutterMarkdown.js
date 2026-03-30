import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox, 
  Container, 
  Divider, 
  List, 
  ListItem, 
  Paper, 
  Stack, 
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { 
  LayoutList, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  FileEdit, 
  FileText, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileCode,
  ListChecks
} from 'lucide-react';

/**
 * CONFIGURAÇÃO DE TEMA
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2196f3' },    // Cor 1 (Info)
    secondary: { main: '#9c27b0' },  // Cor 2 (Style)
    error: { main: '#f44336' },      // Cor 3 (Danger)
    warning: { main: '#ff9800' },    // Cor 4 (Alert)
    success: { main: '#4caf50' },    // Cor 5 (Success)
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: 'Inter, sans-serif' }
});

/**
 * MODELO (POO)
 */
class MarkdownFile {
  constructor(id, title, content = "") {
    this.id = id;
    this.title = title;
    this.content = content || "## Nova Categoria\n- [ ] Minha primeira tarefa\n- [x] Tarefa concluída";
    this.updatedAt = new Date().toISOString();
  }
}

/**
 * CONTROLLER (Estilo GetX / MVC)
 */
const useMarkdownController = () => {
  const [files, setFiles] = useState([
    new MarkdownFile(1, "Projeto Alpha", "## Desenvolvimento\n- [x] Setup do Node\n- [ ] Configurar Docker\n## Design\n- [ ] Criar Protótipo MUI"),
    new MarkdownFile(2, "Estudos UFF", "## Eletromagnetismo\n- [ ] Lista 1\n- [ ] Revisar Maxwell")
  ]);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentFile = useMemo(() => 
    files.find(f => f.id === currentFileId), [files, currentFileId]
  );

  // CRUD
  const createFile = (title) => {
    const newFile = new MarkdownFile(Date.now(), title);
    setFiles([...files, newFile]);
  };

  const updateFileContent = (newContent) => {
    setFiles(prev => prev.map(f => 
      f.id === currentFileId ? { ...f, content: newContent, updatedAt: new Date().toISOString() } : f
    ));
  };

  const deleteFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (currentFileId === id) setCurrentFileId(null);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(files));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "meus_projetos_md.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const json = JSON.parse(e.target.result);
        setFiles(json);
      } catch (err) {
        console.error("Erro ao importar", err);
      }
    };
  };

  return { 
    files, 
    currentFile, 
    setCurrentFileId, 
    isEditing, 
    setIsEditing,
    createFile, 
    updateFileContent, 
    deleteFile,
    exportData,
    importData
  };
};

/**
 * COMPONENTES ESTRUTURAIS (Widgets)
 */
const Column = ({ children, spacing = 2, align = "stretch", sx = {} }) => (
  <Stack direction="column" spacing={spacing} alignItems={align} sx={{ width: '100%', ...sx }}>{children}</Stack>
);

const Row = ({ children, spacing = 2, align = "center", justify = "flex-start", sx = {} }) => (
  <Stack direction="row" spacing={spacing} alignItems={align} justifyContent={justify} sx={{ ...sx }}>{children}</Stack>
);

const MyButton = ({ label, icon: Icon, colorIndex = 1, onClick, variant = "contained" }) => {
  const colorMap = ["primary", "secondary", "error", "warning", "success"];
  return (
    <Button 
      variant={variant}
      color={colorMap[colorIndex - 1]} 
      fullWidth 
      startIcon={Icon && <Icon size={18} />}
      onClick={onClick}
      sx={{ textTransform: 'none', fontWeight: 'bold', py: 1.2 }}
    >
      {label}
    </Button>
  );
};

/**
 * PARSER DE MARKDOWN PARA UI
 */
const MarkdownPreview = ({ content, onToggleTask }) => {
  const lines = content.split('\n');
  const elements = [];

  lines.forEach((line, index) => {
    if (line.startsWith('## ')) {
      elements.push(
        <Typography key={`h-${index}`} variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
          {line.replace('## ', '')}
        </Typography>
      );
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
      const isCompleted = line.startsWith('- [x] ');
      const text = line.replace('- [ ] ', '').replace('- [x] ', '');
      elements.push(
        <Paper key={`t-${index}`} elevation={0} sx={{ p: 1, mb: 0.5, bgcolor: isCompleted ? 'success.light' : 'grey.100', opacity: isCompleted ? 0.7 : 1 }}>
          <Row justify="space-between">
            <Row spacing={1}>
              <Checkbox 
                size="small" 
                checked={isCompleted} 
                onChange={() => onToggleTask(index, isCompleted)}
                icon={<Circle size={18} />}
                checkedIcon={<CheckCircle2 size={18} />}
              />
              <Typography variant="body2" sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                {text}
              </Typography>
            </Row>
          </Row>
        </Paper>
      );
    }
  });

  return <Box sx={{ pb: 4 }}>{elements}</Box>;
};

/**
 * TEMPLATE: FLUTTER TODO LIST PAGE (POO + MVC + GETX STYLE)
 */
const FlutterTodoListPageTemplate = () => {
  // Simulação de Controller Reativo (GetX Style)
  const [todoState, setTodoState] = useState({
    tasks: [
      { id: 1, text: "Tarefa 1", completed: false, colorType: 1 },
      { id: 2, text: "Tarefa 2", completed: true, colorType: 5 }
    ],
    maxTasks: 10
  });

  const updateTask = (id) => {
    setTodoState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { 
        ...t, 
        completed: !t.completed,
        colorType: !t.completed ? 5 : 4 // 5 = Success (Verde), 4 = Warning (Laranja)
      } : t)
    }));
  };

  const addTask = () => {
    if (todoState.tasks.length < todoState.maxTasks) {
      const newId = Date.now();
      setTodoState(prev => ({
        ...prev,
        tasks: [...prev.tasks, { id: newId, text: `Tarefa ${prev.tasks.length + 1}`, completed: false, colorType: 1 }]
      }));
    }
  };

  const completedCount = todoState.tasks.filter(t => t.completed).length;

  return (
    <Box sx={{ mt: 10, p: 2, bgcolor: '#f5f5f5', borderRadius: 4, border: '2px dashed #ccc' }}>
      <Typography variant="h6" align="center" gutterBottom color="textSecondary">
        Template: FlutterTodoListPage
      </Typography>
      
      <Container maxWidth="xs">
        <Column spacing={2}>
          {/* Card de Status */}
          <Card sx={{ borderRadius: 4, bgcolor: completedCount > 5 ? 'success.main' : 'primary.main', color: 'white' }}>
            <CardContent>
              <Column align="center">
                <ListChecks size={32} />
                <Typography variant="h5">Contador: {completedCount} / 10</Typography>
              </Column>
            </CardContent>
          </Card>

          {/* ListView Reutilizável */}
          <Box sx={{ minHeight: 200 }}>
            {todoState.tasks.map(task => (
              <Paper key={task.id} sx={{ p: 1, mb: 1, borderLeft: '5px solid', borderColor: `palette.${['primary','secondary','error','warning','success'][task.colorType-1]}.main` }}>
                <Row justify="space-between">
                  <Row spacing={1}>
                    <Checkbox checked={task.completed} onChange={() => updateTask(task.id)} />
                    <Typography sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.text}
                    </Typography>
                  </Row>
                  <Typography variant="caption" color="textSecondary">Cor: {task.colorType}</Typography>
                </Row>
              </Paper>
            ))}
          </Box>

          {/* Botoes de 5 tipos de cores */}
          <Column spacing={1}>
            <Row spacing={1}>
              <MyButton label="Add" colorIndex={5} onClick={addTask} />
              <MyButton label="Secondary" colorIndex={2} />
            </Row>
            <Row spacing={1}>
              <MyButton label="Error" colorIndex={3} />
              <MyButton label="Warning" colorIndex={4} />
              <MyButton label="Info" colorIndex={1} />
            </Row>
          </Column>
        </Column>
      </Container>
    </Box>
  );
};

/**
 * VIEW PRINCIPAL
 */
export default function TodoListFlutterTrackerMarkdown() {
  const ctrl = useMarkdownController();
  const [openDialog, setOpenDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);

  const handleToggleTask = (lineIndex, currentStatus) => {
    const lines = ctrl.currentFile.content.split('\n');
    const oldPrefix = currentStatus ? '- [x] ' : '- [ ] ';
    const newPrefix = currentStatus ? '- [ ] ' : '- [x] ';
    lines[lineIndex] = lines[lineIndex].replace(oldPrefix, newPrefix);
    ctrl.updateFileContent(lines.join('\n'));
  };

  // Se estiver visualizando um arquivo
  if (ctrl.currentFile) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Column spacing={2}>
            <Row justify="space-between">
              <IconButton onClick={() => { ctrl.setCurrentFileId(null); ctrl.setIsEditing(false); }}>
                <ArrowLeft />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ maxWidth: '200px' }}>{ctrl.currentFile.title}</Typography>
              <MyButton 
                label={ctrl.isEditing ? "Salvar" : "Editar"} 
                colorIndex={ctrl.isEditing ? 5 : 2}
                icon={ctrl.isEditing ? Save : FileEdit}
                onClick={() => ctrl.setIsEditing(!ctrl.isEditing)}
                variant="outlined"
                sx={{ width: 'auto' }}
              />
            </Row>

            <Divider />

            {ctrl.isEditing ? (
              <TextField
                multiline
                fullWidth
                minRows={15}
                variant="filled"
                value={ctrl.currentFile.content}
                onChange={(e) => ctrl.updateFileContent(e.target.value)}
                placeholder="## Categoria\n- [ ] Tarefa"
                sx={{ bgcolor: '#fdfdfd' }}
              />
            ) : (
              <MarkdownPreview 
                content={ctrl.currentFile.content} 
                onToggleTask={handleToggleTask}
              />
            )}
          </Column>
        </Container>
      </ThemeProvider>
    );
  }

  // Lista de Arquivos (CRUD Principal)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ py: 4 }}>
        <Column spacing={3}>
          <Card sx={{ bgcolor: 'primary.dark', color: 'white', p: 1 }}>
            <CardContent>
              <Column align="center">
                <FileCode size={40} />
                <Typography variant="h5" fontWeight="bold">MD Manager</Typography>
                <Typography variant="caption">Editor Mobile First com CRUD</Typography>
              </Column>
            </CardContent>
          </Card>

          <Row justify="space-between" sx={{ px: 1 }}>
            <Typography variant="overline" fontWeight="bold">Arquivos ({ctrl.files.length})</Typography>
            <Row spacing={1}>
              <input type="file" id="import-json" style={{ display: 'none' }} onChange={ctrl.importData} />
              <label htmlFor="import-json">
                <IconButton component="span" color="primary" size="small"><Upload size={18} /></IconButton>
              </label>
              <IconButton onClick={ctrl.exportData} color="primary" size="small"><Download size={18} /></IconButton>
            </Row>
          </Row>

          <List sx={{ minHeight: '300px' }}>
            {ctrl.files.map(file => (
              <ListItem key={file.id} disablePadding sx={{ mb: 1.5 }}>
                <Paper 
                  elevation={2} 
                  sx={{ width: '100%', p: 2, borderLeft: '6px solid #2196f3', cursor: 'pointer' }}
                  onClick={() => ctrl.setCurrentFileId(file.id)}
                >
                  <Row justify="space-between">
                    <Row spacing={2}>
                      <FileText color="#2196f3" />
                      <Column spacing={0}>
                        <Typography variant="subtitle1" fontWeight="bold">{file.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Modificado em: {new Date(file.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Column>
                    </Row>
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={(e) => { e.stopPropagation(); ctrl.deleteFile(file.id); }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Row>
                </Paper>
              </ListItem>
            ))}
          </List>

          <MyButton 
            label="Novo Arquivo .md" 
            icon={Plus} 
            colorIndex={5} 
            onClick={() => setOpenDialog(true)} 
          />
          
          <Row spacing={1}>
            <MyButton label="Ver Template" colorIndex={2} variant="text" onClick={() => setShowTemplate(!showTemplate)} />
            <MyButton label="Export" colorIndex={4} variant="text" onClick={ctrl.exportData} />
          </Row>

          {/* Adição do Template solicitado ao final */}
          {showTemplate && <FlutterTodoListPageTemplate />}
        </Column>

        {/* Modal de Criação */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Novo Arquivo</DialogTitle>
          <DialogContent>
            <TextField 
              autoFocus 
              fullWidth 
              label="Título do Projeto" 
              variant="standard" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={() => { ctrl.createFile(newTitle); setOpenDialog(false); setNewTitle(""); }} variant="contained">Criar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}