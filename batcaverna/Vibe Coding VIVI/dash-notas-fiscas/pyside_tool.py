import sys
import os
import cv2
import sqlite3
import pytesseract
import numpy as np
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QLabel,
    QMessageBox,
    QTextEdit,
    QLineEdit,
    QFormLayout,
)
from pdf2image import convert_from_path

# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

DB_FILE = "notas.db"


def run_pyside_app(pdf_path, nota_id):
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle(f"Correção de Nota - {os.path.basename(pdf_path)}")

    layout = QVBoxLayout()

    # Área de Log e OCR Bruto
    lbl = QLabel(
        "1. Clique em 'Selecionar Área' e desenhe o retângulo sobre a informação que faltou (ENTER confirma, ESC fecha o seletor).\n2. Copie o texto do log preto e cole no campo correspondente abaixo.\n3. Clique em Salvar!"
    )
    layout.addWidget(lbl)

    text_output = QTextEdit()
    text_output.setReadOnly(True)
    text_output.setMaximumHeight(150)
    text_output.setStyleSheet(
        "font-family: monospace; background-color: #000; color: #0f0;"
    )
    layout.addWidget(text_output)

    # Botão do OpenCV
    btn_start = QPushButton("🔍 Selecionar Área no PDF (OpenCV)")
    btn_start.setStyleSheet(
        "background-color: #2563eb; color: white; padding: 10px; font-weight: bold;"
    )
    layout.addWidget(btn_start)

    # Formulário de Correção
    form_layout = QFormLayout()
    input_numero = QLineEdit()
    input_data = QLineEdit()
    input_empresa = QLineEdit()
    input_valor = QLineEdit()

    # Tenta carregar os dados atuais do banco para preencher os campos
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT numero, data_emissao, nome_fantasia, valor FROM notas WHERE id=?",
            (nota_id,),
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            input_numero.setText(row[0] if row[0] != "Não encontrado" else "")
            input_data.setText(row[1] if row[1] != "Não encontrada" else "")
            input_empresa.setText(row[2] if row[2] != "Não encontrado" else "")
            input_valor.setText(row[3] if row[3] != "0,00" else "")
    except Exception as e:
        text_output.setText(f"Erro ao ler banco: {e}")

    form_layout.addRow("Número da Nota:", input_numero)
    form_layout.addRow("Data de Emissão:", input_data)
    form_layout.addRow("Nome da Empresa:", input_empresa)
    form_layout.addRow("Valor (R$):", input_valor)
    layout.addLayout(form_layout)

    def start_opencv():
        try:
            text_output.setText("Convertendo PDF para imagem...")
            QApplication.processEvents()

            pages = convert_from_path(pdf_path, dpi=200)
            img = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2BGR)

            rois = cv2.selectROIs(
                "Seletor OpenCV (ENTER confirma, ESC finaliza)",
                img,
                fromCenter=False,
                showCrosshair=True,
            )
            cv2.destroyAllWindows()

            resultados = []
            for rect in rois:
                x, y, w, h = rect
                if w > 0 and h > 0:
                    recorte = img[y : y + h, x : x + w]
                    gray = cv2.cvtColor(recorte, cv2.COLOR_BGR2GRAY)
                    texto = pytesseract.image_to_string(
                        gray, lang="por", config="--psm 6"
                    ).strip()
                    resultados.append(texto)

            text_output.setText("\n---\n".join(resultados))
        except Exception as e:
            QMessageBox.critical(window, "Erro", str(e))

    def salvar_banco():
        try:
            conn = sqlite3.connect(DB_FILE)
            conn.execute(
                """
                UPDATE notas 
                SET numero=?, data_emissao=?, nome_fantasia=?, valor=? 
                WHERE id=?
            """,
                (
                    input_numero.text() or "Não encontrado",
                    input_data.text() or "Não encontrada",
                    input_empresa.text() or "Não encontrado",
                    input_valor.text() or "0,00",
                    nota_id,
                ),
            )
            conn.commit()
            conn.close()
            QMessageBox.information(
                window,
                "Sucesso",
                "Banco atualizado com sucesso! Atualize a página web.",
            )
            window.close()
        except Exception as e:
            QMessageBox.critical(window, "Erro ao Salvar", str(e))

    btn_start.clicked.connect(start_opencv)

    btn_salvar = QPushButton("💾 Atualizar Banco de Dados")
    btn_salvar.setStyleSheet(
        "background-color: #16a34a; color: white; padding: 12px; font-weight: bold;"
    )
    btn_salvar.clicked.connect(salvar_banco)
    layout.addWidget(btn_salvar)

    window.setLayout(layout)
    window.resize(600, 500)
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    # Espera 2 argumentos: script.py [caminho_pdf] [id_da_nota]
    if len(sys.argv) > 2:
        run_pyside_app(sys.argv[1], sys.argv[2])
    else:
        print("Erro nos argumentos.")
