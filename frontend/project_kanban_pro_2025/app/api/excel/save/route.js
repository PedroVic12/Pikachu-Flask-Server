import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const sanitizeFilename = (title) => {
  return title.replace(/[^a-zA-Z0-9À-ÿ\s-_]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') + '.md';
};

const parseBrazilianDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal;
  }
  const dateStr = String(dateVal).trim();
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed month
    const year = parseInt(match[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date();
};

export async function POST(request) {
  try {
    const projects = await request.json();
    
    const filePath = '/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/planilhas/kanban.xlsx';
    const notesDir = '/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/notas';
    
    // Ensure notes directory exists
    await fs.mkdir(notesDir, { recursive: true });
    
    // 1. Save markdown files
    for (const project of projects) {
      if (project.title) {
        const filename = sanitizeFilename(project.title);
        const notePath = path.join(notesDir, filename);
        await fs.writeFile(notePath, project.content || "", 'utf-8');
      }
    }
    
    // 2. Prepare export data for Excel sheet
    const exportData = projects.map((item) => {
      const filename = sanitizeFilename(item.title);
      
      const createdAt = parseBrazilianDate(item.createdAt);
      const updatedAt = parseBrazilianDate(item.updatedAt);
      
      return {
        Título: item.title,
        Status: item.status,
        ID: item.id,
        Categoria: item.category || "",
        "Criado em": !isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString("pt-BR") : "",
        "Atualizado em": !isNaN(updatedAt.getTime()) ? updatedAt.toLocaleDateString("pt-BR") : "",
        // Reference file name in Conteúdo to keep cell lightweight and clean
        Conteúdo: filename
      };
    });
    
    // 3. Write Excel file
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projetos");
    
    // Get buffer and write it safely
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(filePath, buf);
    
    return new Response(JSON.stringify({ success: true, message: 'Excel and Markdown files saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving Excel/Markdown files:', error);
    return new Response(JSON.stringify({ error: 'Failed to save files: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
