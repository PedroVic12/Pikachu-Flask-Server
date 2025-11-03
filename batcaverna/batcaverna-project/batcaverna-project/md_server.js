
//server.js
const express = require('express');
const { renderMarkdown } = require('./RenderMarkdown.js');

const app = express();

app.get('/docs', async (req, res) => {
    try {
        const htmlContent = await renderMarkdown();
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Documentação</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                    code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Erro ao carregar documentação');
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});