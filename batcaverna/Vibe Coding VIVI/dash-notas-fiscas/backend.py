import os
import sqlite3
import uuid
import re
import subprocess
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from PyPDF2 import PdfReader
from pdf2image import convert_from_path
import cv2
import numpy as np
import pytesseract
import sys

app = Flask(__name__)
DB_FILE = "notas.db"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notas (
            id TEXT PRIMARY KEY, texto_ocr TEXT, texto_pypdf2 TEXT, dado_limpo TEXT, filename TEXT, created_at TEXT
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


@app.route("/api/bulk_process", methods=["POST"])
def bulk_process():
    """Recebe pasta completa ou único PDF, processa OCR e PyPDF2 com Logs Gigantes"""
    if "files" not in request.files:
        return jsonify({"error": "Nenhum arquivo"}), 400

    files = request.files.getlist("files")
    resultados = []
    conn = get_db_connection()

    for file in files:
        filename = getattr(file, "filename", "") or ""
        if file and filename.lower().endswith(".pdf"):
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)

            print(f"\n{'='*60}")
            print(f"🚀 INICIANDO EXTRAÇÃO: {filename}")
            print(f"{'='*60}")

            # 1. TENTATIVA COM PYPDF2 (Mais rápido e preciso para NFS-e digital)
            texto_pypdf2 = ""
            try:
                reader = PdfReader(filepath)
                for page in reader.pages:
                    extraido = page.extract_text()
                    if extraido:
                        texto_pypdf2 += extraido + "\n"
                print(
                    f"\n[🟢 LOG PYPDF2] Extraído com sucesso ({len(texto_pypdf2)} caracteres)."
                )
                print(
                    f"--- INÍCIO DO TEXTO PYPDF2 ---\n{texto_pypdf2[:300]}\n[...]\n--- FIM DO TEXTO PYPDF2 ---"
                )
            except Exception as e:
                print(f"\n[🔴 ERRO PYPDF2] Falha na extração: {e}")

            # 2. TENTATIVA COM TESSERACT OCR (Fallback para PDFs escaneados)
            texto_ocr = ""
            try:
                pages = convert_from_path(filepath, dpi=150)
                img = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2GRAY)
                texto_ocr = pytesseract.image_to_string(img, lang="por")

                print(
                    f"\n[🟢 LOG TESSERACT] OCR concluído com sucesso ({len(texto_ocr)} caracteres)."
                )
                print(
                    f"--- INÍCIO DO TEXTO OCR ---\n{texto_ocr[:300]}\n[...]\n--- FIM DO TEXTO OCR ---"
                )
            except Exception as e:
                print(f"\n[🔴 ERRO TESSERACT] Falha no OCR: {e}")

            # 3. COMBINAÇÃO E REGEX DIRECIONADO PARA NOTA CARIOCA
            # Unimos os dois textos para garantir que se um falhar, o outro salva.
            texto_unido = texto_pypdf2 + "\n" + texto_ocr

            numero_nf = "N/A"
            valor_nf = "0,00"

            # Regex específico para o padrão dos arquivos enviados ("Número da Nota \n 00000106")
            match_numero = re.search(
                r"Número da Nota[\s:]*0*(\d+)", texto_unido, re.IGNORECASE
            )
            if match_numero:
                numero_nf = match_numero.group(1)

            # Regex específico para ("VALOR DA NOTA R$ 774,00" ou "VALOR DA NOTA = R$ 2.604,40")
            match_valor = re.search(
                r"VALOR DA NOTA[\s=]*R\$\s*([\d\.,]+)", texto_unido, re.IGNORECASE
            )
            if not match_valor:
                # Fallback caso a frase "VALOR DA NOTA" esteja quebrada
                match_valor = re.search(
                    r"R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})", texto_unido
                )

            if match_valor:
                valor_nf = match_valor.group(1)

            dado_limpo = f"NF: {numero_nf} | R$ {valor_nf}"

            print(f"\n[🎯 RESULTADO REGEX] {filename} -> {dado_limpo}")
            print(f"{'='*60}\n")

            # 4. SALVAR NO BANCO DE DADOS
            # Agora salvamos o "dado_limpo" montado, que é o que aparece na tela do React
            conn.execute(
                "INSERT INTO notas (id, texto_ocr, texto_pypdf2, dado_limpo, filename, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    str(uuid.uuid4()),
                    texto_ocr,
                    texto_pypdf2,
                    dado_limpo,
                    filename,
                    datetime.now().isoformat(),
                ),
            )
            resultados.append({"file": filename, "valor": dado_limpo})

    conn.commit()
    conn.close()
    return jsonify(
        {"message": f"{len(resultados)} arquivos processados", "data": resultados}
    )


@app.route("/api/launch_pyside", methods=["POST"])
def launch_pyside():
    """Recebe 1 PDF, salva como temp.pdf e abre o script PySide6"""
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo"}), 400

    file = request.files["file"]

    # Salva o arquivo temporário que o PySide6 vai consumir
    temp_pdf = "temp.pdf"
    file.save(temp_pdf)

    # Executa o PySide6 de forma assíncrona, apontando para a pasta atual (cwd)
    try:
        subprocess.Popen([sys.executable, "pyside_tool.py", temp_pdf], cwd=os.getcwd())
        return jsonify(
            {
                "message": "Ferramenta PySide6 iniciada com sucesso. Verifique sua área de trabalho!"
            }
        )
    except Exception as e:
        return jsonify({"error": f"Erro ao iniciar PySide6: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
