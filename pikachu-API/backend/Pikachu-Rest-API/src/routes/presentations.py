from flask import Blueprint, request, jsonify, send_file
import os
import tempfile
import markdown
from weasyprint import HTML, CSS
from datetime import datetime
import base64

presentations_bp = Blueprint('presentations', __name__)

@presentations_bp.route('/presentations/convert', methods=['POST'])
def convert_markdown_to_pdf():
    """Converte Markdown para PDF de apresentação"""
    try:
        data = request.get_json()
        
        if not data or 'markdown' not in data:
            return jsonify({"error": "Markdown content is required"}), 400
        
        markdown_content = data['markdown']
        title = data.get('title', 'Apresentação')
        theme = data.get('theme', 'default')
        
        # Converte Markdown para HTML
        md = markdown.Markdown(extensions=['extra', 'codehilite'])
        html_content = md.convert(markdown_content)
        
        # Template HTML para apresentação
        html_template = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
            <style>
                @page {{
                    size: A4 landscape;
                    margin: 2cm;
                }}
                
                body {{
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                }}
                
                .slide {{
                    background: white;
                    padding: 40px;
                    margin-bottom: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    page-break-after: always;
                    min-height: 500px;
                }}
                
                .slide:last-child {{
                    page-break-after: avoid;
                }}
                
                h1 {{
                    color: #667eea;
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    text-align: center;
                    border-bottom: 3px solid #667eea;
                    padding-bottom: 10px;
                }}
                
                h2 {{
                    color: #764ba2;
                    font-size: 2em;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }}
                
                h3 {{
                    color: #555;
                    font-size: 1.5em;
                    margin-top: 25px;
                    margin-bottom: 10px;
                }}
                
                p {{
                    font-size: 1.1em;
                    margin-bottom: 15px;
                    text-align: justify;
                }}
                
                ul, ol {{
                    font-size: 1.1em;
                    margin-left: 20px;
                }}
                
                li {{
                    margin-bottom: 8px;
                }}
                
                code {{
                    background: #f4f4f4;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                }}
                
                pre {{
                    background: #f8f8f8;
                    padding: 15px;
                    border-radius: 5px;
                    border-left: 4px solid #667eea;
                    overflow-x: auto;
                }}
                
                blockquote {{
                    border-left: 4px solid #764ba2;
                    margin: 20px 0;
                    padding: 10px 20px;
                    background: #f9f9f9;
                    font-style: italic;
                }}
                
                .footer {{
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-size: 0.9em;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="slide">
                {html_content}
            </div>
            <div class="footer">
                Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}
            </div>
        </body>
        </html>
        """
        
        # Cria arquivo temporário para o PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            # Converte HTML para PDF
            HTML(string=html_template).write_pdf(temp_file.name)
            
            # Lê o arquivo PDF e converte para base64
            with open(temp_file.name, 'rb') as pdf_file:
                pdf_content = pdf_file.read()
                pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            
            # Remove o arquivo temporário
            os.unlink(temp_file.name)
            
            return jsonify({
                "success": True,
                "pdf_base64": pdf_base64,
                "filename": f"{title.replace(' ', '_')}.pdf",
                "size": len(pdf_content)
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@presentations_bp.route('/presentations/templates', methods=['GET'])
def get_presentation_templates():
    """Retorna templates de apresentação disponíveis"""
    templates = [
        {
            "name": "default",
            "title": "Padrão",
            "description": "Template padrão com gradiente azul/roxo"
        },
        {
            "name": "corporate",
            "title": "Corporativo",
            "description": "Template profissional para apresentações empresariais"
        },
        {
            "name": "academic",
            "title": "Acadêmico",
            "description": "Template para apresentações acadêmicas e científicas"
        }
    ]
    
    return jsonify(templates)

@presentations_bp.route('/presentations/example', methods=['GET'])
def get_example_markdown():
    """Retorna um exemplo de Markdown para apresentação"""
    example_markdown = """# Minha Apresentação Incrível

## Introdução

Esta é uma apresentação gerada automaticamente a partir de **Markdown**.

### Características

- Conversão automática de MD para PDF
- Design responsivo e profissional
- Suporte a código e formatação

## Código de Exemplo

```python
def hello_world():
    print("Olá, mundo!")
    return "Apresentação criada com sucesso!"
```

## Citação Inspiradora

> "A tecnologia é melhor quando aproxima as pessoas." - Matt Mullenweg

## Conclusão

- Sistema funcional ✅
- Interface intuitiva ✅
- Resultados profissionais ✅

**Obrigado pela atenção!**
"""
    
    return jsonify({
        "example": example_markdown,
        "title": "Exemplo de Apresentação"
    })

