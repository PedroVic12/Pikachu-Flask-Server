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

export async function GET() {
  try {
    const filePath = '/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/planilhas/kanban.xlsx';
    const notesDir = '/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/notas';

    // Ensure notes directory exists
    await fs.mkdir(notesDir, { recursive: true });

    // Read the Excel file
    const file = await fs.readFile(filePath);
    const workbook = XLSX.read(file, { type: 'buffer', cellDates: true });

    // Read the "Projetos" sheet
    const worksheet = workbook.Sheets['Projetos'] || workbook.Sheets[workbook.SheetNames[0]];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Map column headers and load external markdown files if available
    const mappedData = [];
    for (const row of jsonData) {
      const id = row["ID"]?.toString() || Math.random().toString(36).substr(2, 9);
      const title = row["Título"] || "Sem título";
      const status = row["Status"] || "to do";
      const category = row["Categoria"] || "ons";
      
      const createdAt = parseBrazilianDate(row["Criado em"]).toISOString();
      const updatedAt = parseBrazilianDate(row["Atualizado em"]).toISOString();
      
      const filename = sanitizeFilename(title);
      const notePath = path.join(notesDir, filename);
      
      let content = "";
      try {
        content = await fs.readFile(notePath, 'utf-8');
      } catch (err) {
        // File does not exist yet, import content from Excel cell and create the file
        content = row["Conteúdo"] || "";
        await fs.writeFile(notePath, content, 'utf-8');
      }

      mappedData.push({
        id,
        title,
        status,
        category,
        content,
        createdAt,
        updatedAt
      });
    }

    return new Response(JSON.stringify(mappedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn("Backend: kanban.xlsx not found. Returning empty array.");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Error loading Excel file:', error);
    return new Response(JSON.stringify({ error: 'Failed to load Excel file: ' + error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
