from flask import Flask, request, render_template_string, send_file
from PyPDF2 import PdfReader  # O PYPDF2 que você pediu
import re
import pandas as pd
from io import BytesIO
from pdf2image import convert_from_bytes
import pytesseract
from PIL import Image
import io

# ======================================
# CAMINHO DO TESSERACT
# ======================================
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Users\viviane.alves\Downloads\tesseract.exe"
)

"""
ERRO PDF: tesseract.exe is not installed or it's not in your PATH. See README file for more information.

=== NOTA EXTRAÍDA ===
{'numero': 'Não encontrado', 'fornecedor': 'Fornecedor não encontrado', 'valor': '0,00', 'data_emissao': 'Não encontrada', 'status': 'Pendente'}
=====================

127.0.0.1 - - [21/May/2026 11:51:28] "POST / HTTP/1.1" 200 -
127.0.0.1 - - [21/May/2026 11:51:34] "GET /exportar HTTP/1.1" 200 -

"""


app = Flask(__name__)

notas = []


HTML = """
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>NF Control</title>

<style>

body{
    font-family: Arial;
    background:#f5f5f5;
    margin:0;
    padding:40px;
}

.container{
    max-width:1200px;
    margin:auto;
}

h1{
    margin-bottom:30px;
}

.cards{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:15px;
    margin-bottom:30px;
}

.card{
    background:white;
    border-radius:15px;
    padding:20px;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
}

.card h3{
    margin:0;
    color:#666;
}

.card p{
    font-size:28px;
    font-weight:bold;
}

.upload-box{
    background:white;
    padding:25px;
    border-radius:15px;
    margin-bottom:30px;
}

button{
    background:#4f46e5;
    color:white;
    border:none;
    padding:12px 20px;
    border-radius:10px;
    cursor:pointer;
}

button:hover{
    opacity:.9;
}

table{
    width:100%;
    background:white;
    border-collapse:collapse;
    border-radius:15px;
    overflow:hidden;
}

th, td{
    padding:15px;
    border-bottom:1px solid #eee;
    text-align:left;
}

th{
    background:#4f46e5;
    color:white;
}

.status{
    padding:5px 10px;
    border-radius:8px;
    color:white;
    font-size:12px;
}

.pendente{
    background:#f59e0b;
}

.paga{
    background:#10b981;
}

.vencida{
    background:#ef4444;
}

.cancelada{
    background:#6b7280;
}

</style>
</head>

<body>

<div class="container">

<h1>NF Control</h1>

<div class="cards">

<div class="card">
<h3>Total em Notas</h3>
<p>R$ {{ total_valor }}</p>
</div>

<div class="card">
<h3>Total de Notas</h3>
<p>{{ total_notas }}</p>
</div>

<div class="card">
<h3>Pendentes</h3>
<p>{{ pendentes }}</p>
</div>

<div class="card">
<h3>Pagas</h3>
<p>{{ pagas }}</p>
</div>

</div>

<div class="upload-box">

<h2>Importar Nota Fiscal PDF</h2>

<form method="POST" enctype="multipart/form-data">
<input type="file" name="pdf" required>
<br><br>

<button type="submit">
Enviar PDF
</button>
</form>

<br>

<a href="/exportar">
<button>
Exportar Excel
</button>
</a>

</div>

<table>

<tr>
<th>Número</th>
<th>Fornecedor</th>
<th>Data</th>
<th>Valor</th>
<th>Status</th>
</tr>

{% for nota in notas %}
<tr>
<td>{{ nota.numero }}</td>
<td>{{ nota.fornecedor }}</td>
<td>{{ nota.data_emissao }}</td>
<td>R$ {{ nota.valor }}</td>

<td>
<span class="status {{ nota.status.lower() }}">
{{ nota.status }}
</span>
</td>
</tr>
{% endfor %}

</table>

</div>

</body>
</html>
"""


# ======================================
# OCR + LEITOR DE PDF
# ======================================
def extrair_texto_pdf(arquivo):

    texto = ""

    try:
        pdf = PdfReader(arquivo)
        for pagina in pdf.pages:
            # tenta texto normal
            texto += pagina.extract_text() or ""

        # OCR nas imagens das páginas (usando pdf2image)
        arquivo.seek(0)
        pdf_bytes = arquivo.read()
        # Converte as páginas do PDF para imagens PIL
        imagens = convert_from_bytes(pdf_bytes, dpi=200)

        for imagem in imagens:
            # Converte imagem para escala de cinza para melhorar OCR
            texto_ocr = pytesseract.image_to_string(
                imagem, lang="por", config="--psm 6"
            )
            texto += "\n" + texto_ocr

        print("\n=== TEXTO EXTRAÍDO ===")
        print(texto[:5000])
        print("======================\n")

        return texto

    except Exception as e:
        print("ERRO PDF:", e)
        return ""


# ======================================
# EXTRATOR DA NF
# ======================================
def extrair_nota(texto):

    numero = "Não encontrado"
    fornecedor = "Fornecedor não encontrado"
    valor = "0,00"
    data_emissao = "Não encontrada"

    # ======================
    # NUMERO NF
    # ======================
    padroes_numero = [
        r"Número da Nota[:\s]*([0-9]+)",
        r"Nota Fiscal[:\s]*([0-9]+)",
        r"NF[\sºN°:]*([0-9]+)",
    ]

    for padrao in padroes_numero:

        match = re.search(padrao, texto, re.IGNORECASE)

        if match:
            numero = match.group(1)
            break

    # ======================
    # VALOR
    # ======================
    valores = re.findall(r"([0-9]+\.[0-9]{2}|[0-9]+,[0-9]{2})", texto)

    maior_valor = 0

    for v in valores:

        try:
            numero_float = float(v.replace(".", "").replace(",", "."))

            if numero_float > maior_valor:
                maior_valor = numero_float
                valor = v

        except:
            pass

    # ======================
    # DATA
    # ======================
    datas = re.findall(r"([0-9]{2}/[0-9]{2}/[0-9]{4})", texto)

    if datas:
        data_emissao = datas[0]

    # ======================
    # FORNECEDOR
    # ======================
    linhas = texto.split("\n")

    for linha in linhas:

        linha = linha.strip()

        if any(
            palavra in linha.upper()
            for palavra in [
                "LTDA",
                "EIRELI",
                "ME",
                "SERVICOS",
                "SERVIÇOS",
                "COMERCIO",
                "TECNOLOGIA",
                "INDUSTRIA",
            ]
        ):
            fornecedor = linha
            break

    return {
        "numero": numero,
        "fornecedor": fornecedor,
        "valor": valor,
        "data_emissao": data_emissao,
        "status": "Pendente",
    }


@app.route("/", methods=["GET", "POST"])
def home():

    if request.method == "POST":

        arquivo = request.files["pdf"]

        texto = extrair_texto_pdf(arquivo)

        nota = extrair_nota(texto)

        print("\n=== NOTA EXTRAÍDA ===")
        print(nota)
        print("=====================\n")

        notas.append(nota)

    total_valor = 0

    for nota in notas:

        try:
            valor = str(nota["valor"]).replace(".", "").replace(",", ".")

            total_valor += float(valor)

        except:
            pass

    pendentes = len([n for n in notas if n["status"] == "Pendente"])

    pagas = len([n for n in notas if n["status"] == "Paga"])

    return render_template_string(
        HTML,
        notas=notas,
        total_notas=len(notas),
        total_valor=f"{total_valor:,.2f}",
        pendentes=pendentes,
        pagas=pagas,
    )


@app.route("/exportar")
def exportar():

    df = pd.DataFrame(notas)

    output = BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:

        df.to_excel(writer, index=False)

    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="notas_fiscais.xlsx",
        mimetype=(
            "application/" "vnd.openxmlformats-officedocument." "spreadsheetml.sheet"
        ),
    )


if __name__ == "__main__":
    app.run(debug=True)
