import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the Excel file in your backend directory
    const filePath = path.join(
      process.cwd(), 
      '../../../../../pikachu-API/database/kanban-data.xlsx'
    );
    
    // Read the Excel file
    const file = await fs.readFile(filePath);
    const workbook = XLSX.read(file, { type: 'buffer' });
    
    // Assuming the first sheet contains your data
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error loading Excel file:', error);
    return new Response(JSON.stringify({ error: 'Failed to load Excel file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
