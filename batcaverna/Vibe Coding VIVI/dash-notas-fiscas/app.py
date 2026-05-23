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
    send_file,
)
from PyPDF2 import PdfReader
import pypdfium2 as pdfium
import cv2
import numpy as np
import easyocr
import pandas as pd
import io
import ssl

app = Flask(__name__)
DB_FILE = "notas.db"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# pip install pypdfium2 easyocr opencv-python numpy
# ========================================================
# BYPASS DE REDE CORPORATIVA (Ignora erro de SSL)
# ========================================================
ssl._create_default_https_context = ssl._create_unverified_context
GPU_LIGADA = True

# Inicializa o EasyOCR globalmente para não recarregar a cada arquivo
# gpu=False garante que vai rodar em qualquer máquina (CPU) sem precisar de placa de vídeo
print("Inicializando modelo de Inteligência Artificial (EasyOCR)...")
reader = easyocr.Reader(["pt"], gpu=GPU_LIGADA)
print(
    "Utilizando o EasyOCR com GPU ativada!"
    if GPU_LIGADA
    else "Utilizando o EasyOCR em modo CPU (sem GPU)."
)
print("Motor OCR carregado com sucesso!")


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
        init_db()
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
        return jsonify({"error": "PDF original não encontrado"}), 404

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
                pdf_reader = PdfReader(filepath)
                for page in pdf_reader.pages:
                    extraido = page.extract_text()
                    if extraido:
                        texto_pypdf2 += extraido + "\n"
            except Exception as e:
                print(f"[ERRO PYPDF2]: {e}")

            # 2. Extração via Imagem com EasyOCR + PyPDFium2
            texto_ocr = ""
            try:
                # Renderiza PDF usando Chrome PDFium engine
                pdf_doc = pdfium.PdfDocument(filepath)
                page = pdf_doc[0]
                pil_image = page.render(scale=2).to_pil()

                # Converte PIL Image para OpenCV Array (BGR)
                img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

                # Roda o EasyOCR na imagem
                resultados_ocr = reader.readtext(img_cv, detail=0, paragraph=True)

                # CORREÇÃO AQUI: Salva na variável correta!
                texto_ocr = "\n".join(map(str, resultados_ocr))

            except Exception as e:
                print(f"[ERRO EASYOCR]: {e}")

            # Combina os textos para a Regex
            texto_completo = texto_pypdf2 + "\n" + texto_ocr

            # ========================================================
            # GERADOR DE LOG DE DEBUG (GRAVAÇÃO EM ARQUIVO .TXT)
            # ========================================================
            log_filepath = "./debug_ocr.txt"
            with open(log_filepath, "a", encoding="utf-8") as log_file:
                log_file.write(f"\n{'#'*80}\n")
                log_file.write(f"ARQUIVO: {filename}\n")
                log_file.write(
                    f"HORA DA LEITURA: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
                )
                log_file.write(f"{'-'*80}\n")
                log_file.write(texto_completo)
                log_file.write(f"\n{'#'*80}\n\n")

            # ========================================================
            # ISOLAMENTO DE ESCOPO - PRESTADOR VS TOMADOR
            # ========================================================
            bloco_prestador = texto_completo
            # O ponto (.) substitui a letra "Ç" para evitar erro caso o OCR leia "SERVICOS" ou "SERVI¢OS"
            match_bloco = re.search(
                r"PRESTADOR DE SERVI.OS(.*?)TOMADOR DE SERVI.OS",
                texto_completo,
                re.DOTALL | re.IGNORECASE,
            )
            if match_bloco:
                bloco_prestador = match_bloco.group(1)

            # ========================================================
            # REGEX DE PRECISÃO - BLINDADO PARA ERROS DO EASYOCR
            # ========================================================

            # A) NÚMERO DA NOTA (Sua ideia: Prioridade total para o Nome do Arquivo)
            numero = "Não encontrado"
            # Procura por "NF 13904", "NOTA 12155", "NFSe_3802" no nome do arquivo
            match_arquivo = re.search(
                r"(?:NF|NOTA|NFSe)[^\d]*(\d{3,8})", filename, re.IGNORECASE
            )
            if match_arquivo:
                numero = match_arquivo.group(1).lstrip("0")
            else:
                # Fallback: Se o nome do arquivo não tiver o número, tenta ler de dentro do PDF
                match_num = re.search(
                    r"N[a-zú]*ro\s+da\s+Not[a]?[\s:]*0*(\d+)",
                    texto_completo,
                    re.IGNORECASE,
                )
                if match_num:
                    numero = match_num.group(1)

            # B) DATA E HORA DE EMISSÃO
            data_emissao = "Não encontrada"
            match_data = re.search(
                r"(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})", texto_completo
            )
            if not match_data:
                match_data = re.search(r"(\d{2}/\d{2}/\d{4})", texto_completo)
            if match_data:
                data_emissao = match_data.group(1)

            # C) NOME FANTASIA (Busca a partir de "Fantasia" e ignora erros de português do OCR)
            nome_fantasia = "Não encontrado"
            match_nome = re.search(
                r"Fantasia[\s:\-]*(.*?)(?:Tel|Endere[çc]o|CPF|CNPJ|Munic[íi]pio)",
                bloco_prestador,
                re.IGNORECASE | re.DOTALL,
            )
            if not match_nome:
                # Fallback para Razão Social
                match_nome = re.search(
                    r"Social[\s:\-]*(.*?)(?:Fantasia|Tel|Endere[çc]o|CPF|CNPJ)",
                    bloco_prestador,
                    re.IGNORECASE | re.DOTALL,
                )

            if match_nome:
                nome_fantasia = match_nome.group(1).replace("\n", " ").strip()
                nome_fantasia = re.sub(r"[:\-]+$", "", nome_fantasia).strip()

                # DICA DE OURO: Filtro de Auto-Correção
                # Como o EasyOCR lê "PERSOHALE" ou "COHSULTORA", nós limpamos a sujeira!
                if "PERSO" in nome_fantasia.upper():
                    nome_fantasia = "PERSONALE CONSULTORIA E TREINAMENTO LTDA"
                elif "CLAN" in nome_fantasia.upper():
                    nome_fantasia = "CLAN SERVICOS TECNICOS EIRELI ME"
                elif (
                    "ENGLISH" in nome_fantasia.upper()
                    or "HOUSE" in nome_fantasia.upper()
                ):
                    nome_fantasia = "ENGLISH HOUSE LANGUAGE STUDIES LTDA"
                elif "HUNTER" in nome_fantasia.upper():
                    nome_fantasia = "I HUNTER TECNOLOGIA DA INFORMACAO LTDA"

            # D) VALOR DA NOTA
            valor = "0,00"
            match_val = re.search(
                r"VALOR DA NOTA[^\d]*([\d]{1,3}(?:\.\d{3})*,\d{2})",
                texto_completo,
                re.IGNORECASE,
            )
            if not match_val:
                valores_encontrados = re.findall(
                    r"R\$?\s*([\d]{1,3}(?:\.\d{3})*,\d{2})",
                    texto_completo,
                    re.IGNORECASE,
                )
                if valores_encontrados:
                    valor = valores_encontrados[-1]
            else:
                valor = match_val.group(1).strip()

            print(f"[CONSOLE LOG - DADOS CAPTURADOS]")
            print(
                f" -> Número: {numero}\n -> Data/Hora: {data_emissao}\n -> Nome Fantasia: {nome_fantasia}\n -> Valor: R$ {valor}"
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
        subprocess.Popen(
            [sys.executable, "pyside_tool.py", temp_pdf, "null"], cwd=os.getcwd()
        )
        return jsonify({"message": "Janela do PySide6 disparada!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
