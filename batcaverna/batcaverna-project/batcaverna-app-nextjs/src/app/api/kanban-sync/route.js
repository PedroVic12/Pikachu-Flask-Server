import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as XLSX from 'xlsx';

const EXCEL_PATH = '/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/planilhas/kanban.xlsx';
const NOTAS_DIR = path.join(process.cwd(), 'public', 'notas');

// Helper para calcular hash MD5 de uma string ou buffer
function computeHash(content) {
  return crypto.createHash('md5').update(content || '').digest('hex');
}

// ------------------------------------------------------------------------------
// GET /api/kanban-sync -> Carrega Kanban do Excel e arquivos .md do disco
// ------------------------------------------------------------------------------
export async function GET() {
  try {
    let excelHash = '';
    let cards = [];

    // 1. Ler o arquivo Excel kanban.xlsx no disco
    if (fs.existsSync(EXCEL_PATH)) {
      const fileBuffer = fs.readFileSync(EXCEL_PATH);
      excelHash = computeHash(fileBuffer);

      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet);

      cards = rawRows.map((row, idx) => {
        const id = String(row.ID || row.id || `card_${idx}_${Date.now()}`);
        const title = row['Título'] || row.title || row.Titulo || `Tarefa ${idx + 1}`;
        let status = String(row.Status || row.status || 'TODO').toUpperCase().trim();
        
        // Mapeamento flexível de status do Excel para o Kanban
        if (status.includes('BACKLOG')) status = 'BACKLOG';
        else if (status.includes('ANDAMENTO') || status.includes('PROGRESS')) status = 'IN_PROGRESS';
        else if (status.includes('CONCLU') || status.includes('DONE')) status = 'COMPLETED';
        else if (status.includes('FAZER') || status.includes('TODO')) status = 'TODO';
        else status = 'TODO';

        const category = row['Categoria'] || row.category || 'geral';
        const filename = row['Arquivo'] || row.filename || `${id}.md`;
        let content = row['Conteúdo'] || row.content || '';

        // Check se existe arquivo .md correspondente na pasta /public/notas
        let noteFilePath = path.join(NOTAS_DIR, filename);
        if (!fs.existsSync(noteFilePath)) {
          // Tenta procurar pelo id ou pelo título limpo
          const altName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
          const altPath = path.join(NOTAS_DIR, altName);
          if (fs.existsSync(altPath)) {
            noteFilePath = altPath;
          }
        }

        let fileHash = '';
        let fileLastModified = null;

        if (fs.existsSync(noteFilePath)) {
          const mdContent = fs.readFileSync(noteFilePath, 'utf-8');
          content = mdContent; // Atualiza com o texto real do arquivo (Obsidian/VSCode)
          fileHash = computeHash(mdContent);
          const stat = fs.statSync(noteFilePath);
          fileLastModified = stat.mtime.toISOString();
        }

        return {
          id,
          label: title,
          title,
          status,
          category,
          filename,
          content,
          fileHash,
          fileLastModified,
          progress: status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0,
          items: [
            { label: title, completed: status === 'COMPLETED' }
          ]
        };
      });
    }

    // 2. Procurar outros arquivos .md soltos em /public/notas que não estavam no Excel
    if (fs.existsSync(NOTAS_DIR)) {
      const files = fs.readdirSync(NOTAS_DIR);
      files.forEach((file) => {
        if (file.endsWith('.md')) {
          const filePath = path.join(NOTAS_DIR, file);
          const exists = cards.some(c => c.filename === file || c.title.toLowerCase() === file.replace('.md', '').toLowerCase());
          if (!exists) {
            const mdContent = fs.readFileSync(filePath, 'utf-8');
            const stat = fs.statSync(filePath);
            cards.push({
              id: `md_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              label: file.replace('.md', '').replace(/_/g, ' '),
              title: file.replace('.md', '').replace(/_/g, ' '),
              status: 'BACKLOG',
              category: 'notas',
              filename: file,
              content: mdContent,
              fileHash: computeHash(mdContent),
              fileLastModified: stat.mtime.toISOString(),
              progress: 0,
              items: [{ label: file, completed: false }]
            });
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      excelHash,
      cardsCount: cards.length,
      cards,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro no GET /api/kanban-sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ------------------------------------------------------------------------------
// POST /api/kanban-sync -> Atualiza arquivos .md no disco e regrava kanban.xlsx
// ------------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { cards = [] } = body;

    if (!fs.existsSync(NOTAS_DIR)) {
      fs.mkdirSync(NOTAS_DIR, { recursive: true });
    }

    // 1. Escreve / Atualiza cada arquivo Markdown no disco (/public/notas)
    cards.forEach((card) => {
      const safeFilename = card.filename || `${(card.title || card.label || 'nota').toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
      const filePath = path.join(NOTAS_DIR, safeFilename);
      if (card.content) {
        fs.writeFileSync(filePath, card.content, 'utf-8');
      }
    });

    // 2. Regrava o arquivo Excel kanban.xlsx no disco com todas as notas e colunas atualizadas
    const excelRows = cards.map((card, idx) => ({
      'ID': card.id || `card_${idx}`,
      'Título': card.title || card.label || 'Tarefa',
      'Status': card.status || 'TODO',
      'Categoria': card.category || 'geral',
      'Criado em': new Date().toLocaleDateString('pt-BR'),
      'Atualizado em': new Date().toLocaleDateString('pt-BR'),
      'Arquivo': card.filename || `${card.id}.md`,
      'Conteúdo': card.content || '',
      'Hash': computeHash(card.content || '')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha1');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(EXCEL_PATH, excelBuffer);

    const newExcelHash = computeHash(excelBuffer);

    return NextResponse.json({
      success: true,
      excelHash: newExcelHash,
      cardsCount: cards.length,
      message: "kanban.xlsx e arquivos Markdown atualizados com sucesso no disco!",
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro no POST /api/kanban-sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
