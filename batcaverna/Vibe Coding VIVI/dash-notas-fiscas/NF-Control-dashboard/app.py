import os
import re
import sqlite3
from io import BytesIO
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_file
from PyPDF2 import PdfReader
from pdf2image import convert_from_bytes
import pytesseract
import pandas as pd

# 🔧 Configure o caminho do Tesseract se necessário (exemplo Windows)
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)


# ---------- Banco de Dados ----------
def init_db():
    conn = sqlite3.connect("notas.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS notas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT,
            fornecedor TEXT,
            valor REAL,
            data_emissao TEXT,
            data_vencimento TEXT,
            categoria TEXT,
            status TEXT,
            descricao TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


init_db()


def db_get_all():
    conn = sqlite3.connect("notas.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM notas ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def db_insert(data):
    conn = sqlite3.connect("notas.db")
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO notas (numero, fornecedor, valor, data_emissao, data_vencimento, categoria, status, descricao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            data["numero"],
            data["fornecedor"],
            data["valor"],
            data["data_emissao"],
            data["data_vencimento"],
            data["categoria"],
            data["status"],
            data["descricao"],
        ),
    )
    conn.commit()
    last_id = c.lastrowid
    conn.close()
    return last_id


def db_update(id_, data):
    conn = sqlite3.connect("notas.db")
    c = conn.cursor()
    c.execute(
        """
        UPDATE notas SET numero=?, fornecedor=?, valor=?, data_emissao=?, data_vencimento=?,
                         categoria=?, status=?, descricao=?
        WHERE id=?
    """,
        (
            data["numero"],
            data["fornecedor"],
            data["valor"],
            data["data_emissao"],
            data["data_vencimento"],
            data["categoria"],
            data["status"],
            data["descricao"],
            id_,
        ),
    )
    conn.commit()
    conn.close()


def db_delete(id_):
    conn = sqlite3.connect("notas.db")
    c = conn.cursor()
    c.execute("DELETE FROM notas WHERE id=?", (id_,))
    conn.commit()
    conn.close()


def db_clear():
    conn = sqlite3.connect("notas.db")
    c = conn.cursor()
    c.execute("DELETE FROM notas")
    conn.commit()
    conn.close()


# ---------- Extração Avançada de PDF (OCR + Regex) ----------
def extrair_texto_pdf(arquivo):
    texto = ""
    try:
        pdf = PdfReader(arquivo)
        for pagina in pdf.pages:
            pagina_texto = pagina.extract_text()
            if pagina_texto:
                texto += pagina_texto
        # OCR nas páginas com imagens
        arquivo.seek(0)
        pdf_bytes = arquivo.read()
        imagens = convert_from_bytes(pdf_bytes, dpi=200)
        for img in imagens:
            img_texto = pytesseract.image_to_string(img, lang="por", config="--psm 6")
            texto += "\n" + img_texto
    except Exception as e:
        print(f"Erro na extração: {e}")
    return texto


def extrair_nota_do_texto(texto):
    nota = {
        "numero": "",
        "fornecedor": "",
        "valor": 0.0,
        "data_emissao": "",
        "data_vencimento": "",
        "categoria": "Outros",
        "descricao": "",
        "status": "Pendente",
    }

    # Número da Nota
    padroes_numero = [
        r"N[º°]\.?\s*(\d+)",
        r"Número\s*(?:da\s*Nota)?[:\s]*(\d+)",
        r"Nota\s*Fiscal[:\s]*(\d+)",
        r"NF[:\s]*(\d+)",
    ]
    for padrao in padroes_numero:
        match = re.search(padrao, texto, re.IGNORECASE)
        if match:
            nota["numero"] = match.group(1)
            break

    # Nome Fantasia / Fornecedor
    padrao_forn = re.search(
        r"(?:Fornecedor|Emitente|Prestador|Razão Social|Nome Fantasia)[:\s]*([^\n]{5,80})",
        texto,
        re.IGNORECASE,
    )
    if padrao_forn:
        nota["fornecedor"] = padrao_forn.group(1).strip()
    else:
        for linha in texto.split("\n"):
            if re.search(
                r"LTDA|EIRELI|ME|S/A|COMERCIO|SERVICOS|TECNOLOGIA", linha, re.IGNORECASE
            ):
                nota["fornecedor"] = linha.strip()
                break

    # Valor total (R$ 1.234,56)
    valor_match = re.search(r"R\$\s*([0-9]{1,3}(?:[\.][0-9]{3})*\,[0-9]{2})", texto)
    if valor_match:
        valor_str = valor_match.group(1).replace(".", "").replace(",", ".")
        nota["valor"] = float(valor_str)
    else:
        valores = re.findall(r"([0-9]{1,3}(?:[\.][0-9]{3})*\,[0-9]{2})", texto)
        if valores:
            numeros = [float(v.replace(".", "").replace(",", ".")) for v in valores]
            nota["valor"] = max(numeros)

    # Data + hora (opcional)
    data_match = re.search(r"(\d{2}/\d{2}/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?", texto)
    if data_match:
        dia, mes, ano = data_match.group(1).split("/")
        nota["data_emissao"] = f"{ano}-{mes}-{dia}"
        if data_match.group(2):
            nota["descricao"] += f" Hora emissão: {data_match.group(2)}"

    return nota


# ---------- Rotas da API ----------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/notas", methods=["GET"])
def get_notas():
    return jsonify(db_get_all())


@app.route("/api/notas", methods=["POST"])
def create_nota():
    data = request.json
    if not data.get("numero") or not data.get("fornecedor"):
        return jsonify({"error": "Número e fornecedor são obrigatórios"}), 400
    data["valor"] = float(data.get("valor", 0))
    data["status"] = data.get("status", "Pendente")
    data["categoria"] = data.get("categoria", "Outros")
    data["data_vencimento"] = data.get("data_vencimento", "")
    data["descricao"] = data.get("descricao", "")
    id_ = db_insert(data)
    return jsonify({"id": id_}), 201


@app.route("/api/notas/<int:id_>", methods=["PUT"])
def update_nota(id_):
    data = request.json
    data["valor"] = float(data.get("valor", 0))
    db_update(id_, data)
    return jsonify({"success": True})


@app.route("/api/notas/<int:id_>", methods=["DELETE"])
def delete_nota(id_):
    db_delete(id_)
    return jsonify({"success": True})


@app.route("/api/limpar_banco", methods=["DELETE"])
def limpar_banco():
    db_clear()
    return jsonify({"success": True})


@app.route("/api/upload", methods=["POST"])
def upload_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    file = request.files["pdf"]
    if file.filename == "":
        return jsonify({"error": "Arquivo vazio"}), 400
    texto = extrair_texto_pdf(file)
    dados = extrair_nota_do_texto(texto)
    dados["status"] = "Pendente"
    dados["categoria"] = "Outros"
    id_ = db_insert(dados)
    dados["id"] = id_
    return jsonify(dados), 201


@app.route("/api/bulk-upload", methods=["POST"])
def bulk_upload():
    if "pdfs" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    files = request.files.getlist("pdfs")
    resultados = []
    for file in files:
        if file.filename == "":
            continue
        texto = extrair_texto_pdf(file)
        dados = extrair_nota_do_texto(texto)
        dados["status"] = "Pendente"
        dados["categoria"] = "Outros"
        id_ = db_insert(dados)
        dados["id"] = id_
        resultados.append(dados)
    return jsonify(resultados), 201


@app.route("/api/exportar-excel", methods=["GET"])
def exportar_excel():
    notas = db_get_all()
    df = pd.DataFrame(notas)
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    return send_file(
        output,
        as_attachment=True,
        download_name="notas_fiscais.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
