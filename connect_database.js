

// faça uma classe que conectada Excel e Sqlite separados
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ExcelJS = require('exceljs');



class Database {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }
    
    connect() {
        return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
            reject(err);
            } else {
            resolve();
            }
        });
        });
    }
    
    close() {
        return new Promise((resolve, reject) => {
        if (this.db) {
            this.db.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
            });
        } else {
            resolve();
        }
        });
    }
    }
class ExcelHandler {
    constructor(filePath) {
        this.filePath = filePath;
        this.workbook = new ExcelJS.Workbook();
    }

    async readExcel() {
        await this.workbook.xlsx.readFile(this.filePath);
        const worksheet = this.workbook.worksheets[0];
        const data = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Ignora o cabeçalho
                data.push(row.values.slice(1)); // Remove o índice da linha
            }
        });
        return data;
    }
}
async function main() {
    const dbPath = path.join(__dirname, 'database.db');
    const excelPath = path.join(__dirname, 'data.xlsx');

    const db = new Database(dbPath);
    const excelHandler = new ExcelHandler(excelPath);

    try {
        await db.connect();
        console.log('Conectado ao banco de dados SQLite.');

        const data = await excelHandler.readExcel();
        console.log('Dados lidos do Excel:', data);

        // Aqui você pode inserir os dados no banco de dados SQLite
        // Exemplo: db.db.run('INSERT INTO tabela (coluna1, coluna2) VALUES (?, ?)', [valor1, valor2]);

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await db.close();
        console.log('Conexão com o banco de dados fechada.');
    }
}
main().catch(console.error);
module.exports = { Database, ExcelHandler };