// tailwinds_components.js

import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export function Checklist({ tasks, onToggleItem }) {
    if (!tasks || tasks.length === 0) {
        return html`<div class="flex items-center justify-center h-full text-gray-400">Nenhuma tarefa encontrada.</div>`;
    }

    return html`
        <div class="w-full h-full p-2 md:p-6 overflow-y-auto">
            <div class="space-y-6 max-w-4xl mx-auto">
                ${tasks.map(category => ChecklistCategory({ category, onToggleItem }))}
            </div>
        </div>
    `;
}

export function ChecklistCategory({ category, onToggleItem }) {
    return html`
        <div class="glass-panel p-4 bg-black/20 rounded-lg">
            <h3 class="text-lg font-semibold text-cyan-300 border-b-2 border-cyan-500/20 pb-2 mb-3">${category.label}</h3>
            <ul class="space-y-2">
                ${category.items.map((item, index) =>
                    ChecklistItem({ item, index, onToggle: () => onToggleItem(category.label, index) })
                )}
            </ul>
        </div>
    `;
}

export function ChecklistItem({ item, index, onToggle }) {
    return html`
        <li class="flex items-center bg-black/30 p-3 rounded-md transition-all hover:bg-black/50">
            <input 
                type="checkbox" 
                checked=${item.completed} 
                class="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                onClick=${onToggle}
            />
            <label class=${`ml-3 text-gray-300 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                ${item.text}
            </label>
        </li>
    `;
}

function PageContainer({ title, children }) { return (<Box className="space-y-6"><Typography variant="h4" component="h1" gutterBottom>{title}</Typography>{children}</Box>); }

export function ChecklistPage({ markdownText, tasks, updateMarkdown, toggleTask, inputMode, setInputMode, githubUrl, setGithubUrl, handleFetch, loading, error }) {
            const [isEditing, setIsEditing] = useState(false);
            const groupedTasks = tasks.reduce((acc, task) => { (acc[task.category] = acc[task.category] || []).push(task); return acc; }, {});

            return (
                <PageContainer title="📖 Checklist de Tarefas">
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6">Fonte de Tarefas</Typography>
                            <Button variant="outlined" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Ver Checklist' : 'Editar Markdown'}</Button>
                        </Box>

                        <FormControl component="fieldset" sx={{ mb: 2 }}>
                            <RadioGroup row value={inputMode} onChange={(e) => setInputMode(e.target.value)}>
                                <FormControlLabel value="text" control={<Radio />} label="Digitar" />
                                <FormControlLabel value="url" control={<Radio />} label="Buscar de URL" />
                            </RadioGroup>
                        </FormControl>

                        {inputMode === 'url' && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField fullWidth size="small" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="Cole a URL RAW do arquivo .md do GitHub" />
                                <Button variant="contained" onClick={handleFetch} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
                            </Box>
                        )}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {isEditing ? (
                            <TextField multiline fullWidth rows={15} value={markdownText} onChange={(e) => updateMarkdown(e.target.value)} variant="outlined" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover' }} />
                        ) : (
                            <Box className="space-y-4">
                                {Object.entries(groupedTasks).map(([category, items]) => (
                                    <div key={category}>
                                        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>{category}</Typography>
                                        <Paper variant="outlined">
                                            <List disablePadding>
                                                {items.map((task, index) => (
                                                    <ListItem key={task.id} divider={index < items.length - 1} secondaryAction={<Checkbox edge="end" checked={task.done} onChange={() => toggleTask(task.id)} />}>
                                                        <ListItemText primary={task.item} sx={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'text.disabled' : 'text.primary' }} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </div>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </PageContainer>
            );
        }