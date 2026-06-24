import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Target the latest June 2026 spreadsheet in your ONS Kanban folder
    const filePath = '/home/pedrov12/Documentos/GitHub/ONS-PLC-PV-CONTROLE-E-AUTOMACAO/ONS/Planilhas/Planilhas Kanban/06 - Junho/kanban-12-06-2026.xlsx';

    // Read the Excel file
    const file = await fs.readFile(filePath);
    const workbook = XLSX.read(file, { type: 'buffer', cellDates: true });

    // Read the "Projetos" sheet
    const worksheet = workbook.Sheets['Projetos'] || workbook.Sheets[workbook.SheetNames[0]];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Map column headers from Portuguese to English keys for React frontend compatibility
    const mappedData = jsonData.map((row) => ({
      id: row["ID"]?.toString() || Math.random().toString(36).substr(2, 9),
      title: row["Título"] || "Sem título",
      status: row["Status"] || "to do",
      category: row["Categoria"] || "ons",
      content: row["Conteúdo"] || "",
      createdAt: row["Criado em"] ? new Date(row["Criado em"]).toISOString() : new Date().toISOString(),
      updatedAt: row["Atualizado em"] ? new Date(row["Atualizado em"]).toISOString() : new Date().toISOString()
    }));

    return new Response(JSON.stringify(mappedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn("Backend: kanban-12-06-2026.xlsx not found. Returning empty array.");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Error loading Excel file:', error);
    return new Response(JSON.stringify({ error: 'Failed to load Excel file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

