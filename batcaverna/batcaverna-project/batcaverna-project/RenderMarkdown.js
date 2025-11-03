// RenderMarkdown.js
const https = require('https');

class GitHubMarkdownRenderer {
    constructor() {
        this.baseUrl = 'https://raw.githubusercontent.com';
    }

    // Busca conteúdo raw do GitHub
    fetchMarkdownContent(url) {
        return new Promise((resolve, reject) => {
            // Remove parâmetros de query se existirem
            const cleanUrl = url.split('?')[0];
            
            console.log('📡 Buscando conteúdo de:', cleanUrl);
            
            https.get(cleanUrl, (response) => {
                let data = '';

                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP Error: ${response.statusCode}`));
                    return;
                }

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    console.log('✅ Conteúdo recebido:', data.length, 'caracteres');
                    resolve(data);
                });

            }).on('error', (error) => {
                console.error('❌ Erro na requisição:', error.message);
                reject(error);
            });
        });
    }

    // Converte Markdown para HTML (parser básico)
    renderMarkdownToHTML(markdownText) {
        let html = markdownText;
        
        // Headers
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        
        // Bold e Italic
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
        html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
        
        // Code blocks
        html = html.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Listas não ordenadas
        html = html.replace(/^\s*[-*] (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Listas ordenadas
        html = html.replace(/^\s*\d+\. (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
        
        // Blockquotes
        html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
        
        // Linhas horizontais
        html = html.replace(/^---$/gim, '<hr>');
        
        // Quebras de linha
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        // Parágrafos
        html = '<p>' + html + '</p>';
        
        return html;
    }

    // Método principal para renderizar
    async renderFromGitHub(githubUrl) {
        try {
            const markdown = await this.fetchMarkdownContent(githubUrl);
            const html = this.renderMarkdownToHTML(markdown);
            
            return {
                success: true,
                html: html,
                rawMarkdown: markdown
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                html: '<p>Erro ao carregar o markdown: ' + error.message + '</p>'
            };
        }
    }
}

// URL fixa - altere aqui para o link que deseja usar
const URL_repo_github = "https://github.com/PedroVic12/Pikachu-Flask-Server/"
const GITHUB_MARKDOWN_URL = "https://raw.githubusercontent.com/PedroVic12/Pikachu-Flask-Server/refs/heads/main/batcaverna/batcaverna_pv.md";

// Função principal que você pode chamar de outros arquivos
async function renderMarkdown() {
    const renderer = new GitHubMarkdownRenderer();
    const result = await renderer.renderFromGitHub(GITHUB_MARKDOWN_URL);
    
    if (result.success) {
        console.log('✅ Markdown convertido com sucesso!');
        console.log('📊 Estatísticas:');
        console.log('   - Markdown:', result.rawMarkdown.length, 'caracteres');
        console.log('   - HTML:', result.html.length, 'caracteres');
        
        return result.html;
    } else {
        console.error('❌ Erro:', result.error);
        return result.html; // Retorna o HTML de erro
    }
}

// Se executado diretamente, mostra o resultado no console
if (require.main === module) {
    renderMarkdown()
        .then(html => {
            console.log('\n📄 HTML GERADO:');
            console.log('=' .repeat(50));
            console.log(html);
            console.log('=' .repeat(50));
        })
        .catch(error => {
            console.error('💥 Erro fatal:', error);
        });
}

// Exporta as funções para uso em outros arquivos
module.exports = {
    GitHubMarkdownRenderer,
    renderMarkdown,
    GITHUB_MARKDOWN_URL
};