import os
import sqlite3
import uuid
import re
import subprocess
import sys
from datetime import datetime
from flask import (
    Flask,
    request,
    jsonify,
    render_template,
    send_from_directory,
    send_file,
)
from PyPDF2 import PdfReader
from pdf2image import convert_from_path
import cv2
import numpy as np
import pytesseract
import pandas as pd
import io

app = Flask(__name__)
DB_FILE = "notas.db"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Defina o caminho do tesseract caso necessário no Linux
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notas (
            id TEXT PRIMARY KEY, 
            numero TEXT, 
            data_emissao TEXT,
            nome_fantasia TEXT,
            valor TEXT,
            filename TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()


init_db()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/notas", methods=["GET"])
def listar_notas():
    conn = get_db_connection()
    notas = conn.execute("SELECT * FROM notas ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in notas])


@app.route("/api/limpar_banco", methods=["POST"])
def limpar_banco():
    """Apaga os dados da tabela com segurança"""
    try:
        conn = get_db_connection()
        conn.execute("DROP TABLE IF EXISTS notas")
        conn.commit()
        conn.close()
        init_db()  # Recria a estrutura limpa
        return jsonify({"message": "Banco de dados resetado com sucesso!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/corrigir_pyside/<nota_id>", methods=["POST"])
def corrigir_pyside(nota_id):
    """Dispara o PySide6 especificamente para corrigir uma nota no banco"""
    conn = get_db_connection()
    nota = conn.execute(
        "SELECT filename FROM notas WHERE id = ?", (nota_id,)
    ).fetchone()
    conn.close()

    if not nota:
        return jsonify({"error": "Nota não encontrada no banco"}), 404

    filepath = os.path.join(UPLOAD_FOLDER, nota["filename"])
    if not os.path.exists(filepath):
        return jsonify({"error": "PDF original não encontrado na pasta uploads"}), 404

    # Dispara o pyside_tool passando o caminho do PDF original e o ID da nota no banco
    try:
        subprocess.Popen(
            [sys.executable, "pyside_tool.py", filepath, nota_id], cwd=os.getcwd()
        )
        return jsonify({"message": "PySide6 aberto para correção!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/bulk_process", methods=["POST"])
def bulk_process():
    if "files" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    files = request.files.getlist("files")
    resultados = []
    conn = get_db_connection()

    for file in files:
        original_filename = getattr(file, "filename", "") or ""
        # A MÁGICA PARA PASTA COMPLETA: Pega só o nome do arquivo, ignorando subpastas
        filename = os.path.basename(original_filename)

        if file and filename.lower().endswith(".pdf"):
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)

            print(f"\n{'='*60}")
            print(f"🔍 ANALISANDO DOCUMENTO: {filename}")
            print(f"{'='*60}")

            # 1. Extração de texto nativo com PyPDF2
            texto_pypdf2 = ""
            try:
                reader = PdfReader(filepath)
                for page in reader.pages:
                    extraido = page.extract_text()
                    if extraido:
                        texto_pypdf2 += extraido + "\n"
            except Exception as e:
                print(f"[ERRO PYPDF2]: {e}")

            # 2. Extração via Imagem com Tesseract OCR
            texto_ocr = ""
            try:
                pages = convert_from_path(filepath, dpi=150)
                img = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2GRAY)
                texto_ocr = pytesseract.image_to_string(img, lang="por")
            except Exception as e:
                print(f"[ERRO TESSERACT]: {e}")

            # Combina os textos analisados para alimentar a esteira de Regex
            texto_completo = texto_pypdf2 + "\n" + texto_ocr

            # ========================================================
            # REGEX DE PRECISÃO - PADRÃO NOTA CARIOCA (PREFEITURA RJ)
            # ========================================================

            # A) Número da Nota
            numero = "Não encontrado"
            match_num = re.search(
                r"Número da Nota\s*\n\s*(\d+)", texto_completo, re.IGNORECASE
            )
            if not match_num:
                match_num = re.search(
                    r"Número da Nota\s+(\d+)", texto_completo, re.IGNORECASE
                )
            if match_num:
                numero = match_num.group(1).lstrip(
                    "0"
                )  # Remove zeros à esquerda chatos

            # B) Data e Hora de Emissão
            data_emissao = "Não encontrada"
            match_data = re.search(
                r"(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})", texto_completo
            )
            if not match_data:
                match_data = re.search(r"(\d{2}/\d{2}/\d{4})", texto_completo)
            if match_data:
                data_emissao = match_data.group(1)

            # C) Nome Fantasia
            nome_fantasia = "Não encontrado"
            match_nome = re.search(
                r"Nome Fantasia\s*[:]*\s*(.*)", texto_completo, re.IGNORECASE
            )
            if not match_nome:
                match_nome = re.search(
                    r"Nome\s*Razão\s*Social\s*[:]*\s*(.*)",
                    texto_completo,
                    re.IGNORECASE,
                )
            if match_nome:
                nome_fantasia = match_nome.group(1).strip()

            # D) Valor da Nota
            valor = "0,00"
            match_val = re.search(
                r"VALOR DA NOTA\s*[=\s]*R\$\s*([\d\.,]+)", texto_completo, re.IGNORECASE
            )
            if not match_val:
                # Fallback genérico para pegar valores maiores com cifrão
                valores_encontrados = re.findall(
                    r"R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})", texto_completo
                )
                if valores_encontrados:
                    valor = valores_encontrados[
                        -1
                    ]  # Geralmente o total fica no fim do bloco descritivo
            if match_val:
                valor = match_val.group(1).strip()

            print(f"[CONSOLE LOG - DADOS CAPTURADOS]")
            print(
                f" -> Número: {numero}\n -> Data/Hora: {data_emissao}\n -> Empresa: {nome_fantasia}\n -> Valor: R$ {valor}"
            )
            print(f"{'='*60}\n")

            # Salva no banco de dados
            conn.execute(
                """INSERT INTO notas (id, numero, data_emissao, nome_fantasia, valor, filename, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid.uuid4()),
                    numero,
                    data_emissao,
                    nome_fantasia,
                    valor,
                    filename,
                    datetime.now().isoformat(),
                ),
            )
            resultados.append({"file": filename, "status": "sucesso"})

    conn.commit()
    conn.close()
    return jsonify({"message": "Processamento concluído", "data": resultados})


@app.route("/api/exportar", methods=["GET"])
def exportar_excel():
    """Usa Pandas para extrair os dados do notas.db e entregar um excel polido"""
    conn = get_db_connection()
    query = """
        SELECT 
            numero AS [Número da Nota], 
            data_emissao AS [Data/Hora Emissão], 
            nome_fantasia AS [Nome Fantasia], 
            valor AS [Valor (R$)], 
            filename AS [Arquivo de Referência],
            created_at AS [Data Processamento]
        FROM notas 
        ORDER BY created_at DESC
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Relatório de Notas")

    output.seek(0)
    return send_file(
        output,
        as_attachment=True,
        download_name=f"Relatorio_Notas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@app.route("/api/launch_pyside", methods=["POST"])
def launch_pyside():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo"}), 400

    file = request.files["file"]
    temp_pdf = "temp.pdf"
    file.save(temp_pdf)

    try:
        subprocess.Popen([sys.executable, "pyside_tool.py", temp_pdf], cwd=os.getcwd())
        return jsonify({"message": "Janela do PySide6 disparada!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
