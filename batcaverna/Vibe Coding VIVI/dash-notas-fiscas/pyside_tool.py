import sys
import os
import cv2
import sqlite3
import numpy as np
import easyocr
import pypdfium2 as pdfium
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QPushButton,
    QLabel,
    QMessageBox,
    QTextEdit,
    QLineEdit,
    QFormLayout,
)

DB_FILE = "notas.db"


def run_pyside_app(pdf_path, nota_id):
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle(f"Correção Inteligente - {os.path.basename(pdf_path)}")
    layout = QVBoxLayout()

    lbl = QLabel(
        "1. Clique em 'Selecionar Área' e desenhe o retângulo no OpenCV (ENTER confirma).\n"
        "2. Copie o texto detectado pelo EasyOCR no bloco preto.\n"
        "3. Cole nos campos vazios e Atualize o Banco."
    )
    layout.addWidget(lbl)

    text_output = QTextEdit()
    text_output.setReadOnly(True)
    text_output.setMaximumHeight(150)
    text_output.setStyleSheet(
        "font-family: monospace; background-color: #000; color: #0f0;"
    )
    layout.addWidget(text_output)

    btn_start = QPushButton("🔍 Selecionar Área no PDF (OpenCV + EasyOCR)")
    btn_start.setStyleSheet(
        "background-color: #2563eb; color: white; padding: 10px; font-weight: bold;"
    )
    layout.addWidget(btn_start)

    form_layout = QFormLayout()
    input_numero = QLineEdit()
    input_data = QLineEdit()
    input_empresa = QLineEdit()
    input_valor = QLineEdit()

    # Tenta puxar dados do banco
    if nota_id != "null":
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
            text_output.setText(f"Aviso: {e}")

    form_layout.addRow("Número da Nota:", input_numero)
    form_layout.addRow("Data de Emissão:", input_data)
    form_layout.addRow("Nome da Empresa:", input_empresa)
    form_layout.addRow("Valor (R$):", input_valor)
    layout.addLayout(form_layout)

    def start_opencv():
        try:
            text_output.setText("Carregando motor IA (EasyOCR) e renderizando PDF...")
            QApplication.processEvents()

            # Renderiza Imagem com PyPDFium2
            pdf_doc = pdfium.PdfDocument(pdf_path)
            pil_image = (
                pdf_doc[0].render(scale=3).to_pil()
            )  # scale 3 para mais nitidez no recorte
            img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

            rois = cv2.selectROIs(
                "Seletor OpenCV (ENTER confirma, ESC finaliza)",
                img,
                fromCenter=False,
                showCrosshair=True,
            )
            cv2.destroyAllWindows()

            if len(rois) == 0:
                text_output.setText("Operação cancelada.")
                return

            text_output.setText("Extraindo texto das coordenadas...\n")
            QApplication.processEvents()

            # Roda o EasyOCR apenas nos recortes!
            reader = easyocr.Reader(["pt"], gpu=False)
            resultados = []

            for rect in rois:
                x, y, w, h = rect
                if w > 0 and h > 0:
                    recorte = img[y : y + h, x : x + w]

                    texto_detectado = reader.readtext(recorte, detail=0, paragraph=True)
                    resultados.append("\n".join(map(str, texto_detectado)))

            text_output.setText("\n---\n".join(resultados))
        except Exception as e:
            QMessageBox.critical(window, "Erro", str(e))

    def salvar_banco():
        try:
            if nota_id == "null":
                QMessageBox.information(
                    window,
                    "Aviso",
                    "Esta é uma visualização avulsa, banco não atualizado.",
                )
                window.close()
                return

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
                window, "Sucesso", "Banco atualizado! Dê F5 na página."
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
    if len(sys.argv) > 2:
        run_pyside_app(sys.argv[1], sys.argv[2])
    else:
        print("Uso correto: python pyside_tool.py <caminho_pdf> <id_nota>")
