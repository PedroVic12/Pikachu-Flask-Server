import sys
import os
import cv2
import pytesseract
import numpy as np
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QPushButton,
    QLabel,
    QMessageBox,
    QTextEdit,
)
from pdf2image import convert_from_path

# Se precisar apontar o caminho do Tesseract no Linux, descomente e ajuste a linha abaixo:
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'


def run_pyside_app(pdf_path):
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle("Extrator Multi-Coordenadas - OpenCV + Tesseract")

    layout = QVBoxLayout()

    instrucoes = (
        f"Arquivo carregado: {pdf_path}\n\n"
        "COMO USAR O EXTRATOR OPENCV:\n"
        "1. Clique no botão azul abaixo.\n"
        "2. Desenhe um retângulo no texto que deseja extrair.\n"
        "3. Aperte ENTER (ou ESPAÇO) para confirmar a marcação.\n"
        "4. Desenhe quantos retângulos quiser, apertando ENTER após cada um.\n"
        "5. Aperte ESC para finalizar. A extração vai começar!"
    )
    lbl = QLabel(instrucoes)
    layout.addWidget(lbl)

    text_output = QTextEdit()
    text_output.setReadOnly(True)
    text_output.setStyleSheet(
        "font-family: monospace; background-color: #1e1e1e; color: #00ff00;"
    )
    layout.addWidget(text_output)

    def start_opencv():
        img_path = "temp.png"
        try:
            text_output.setText("Convertendo PDF para imagem... (aguarde)")
            QApplication.processEvents()

            # Converte PDF para imagem em alta resolução
            pages = convert_from_path(pdf_path, dpi=200)
            img = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2BGR)
            cv2.imwrite(img_path, img)

            text_output.setText(
                "Imagem aberta. Faça suas seleções e aperte ESC quando terminar!"
            )
            QApplication.processEvents()

            # Abre a interface nativa do OpenCV para múltiplos retângulos
            rois = cv2.selectROIs(
                "Seletor OpenCV (ENTER para confirmar, ESC para finalizar)",
                img,
                fromCenter=False,
                showCrosshair=True,
            )
            cv2.destroyAllWindows()

            if len(rois) == 0:
                text_output.setText("Nenhuma área foi selecionada.")
                return

            text_output.setText("Extraindo texto com Tesseract OCR...\n")
            QApplication.processEvents()

            resultados = []
            for i, rect in enumerate(rois):
                x, y, w, h = rect
                if w > 0 and h > 0:
                    recorte = img[y : y + h, x : x + w]
                    gray = cv2.cvtColor(recorte, cv2.COLOR_BGR2GRAY)

                    # psm 6 assume que é um bloco uniforme de texto
                    texto = pytesseract.image_to_string(
                        gray, lang="por", config="--psm 6"
                    ).strip()

                    resultados.append(
                        f"=== RETÂNGULO {i+1} ===\n"
                        f"Coordenadas Python: X:{x}, Y:{y}, W:{w}, H:{h}\n"
                        f"Texto Extraído:\n{texto}\n"
                        f"{'-'*40}"
                    )

            text_output.setText("\n\n".join(resultados))

        except Exception as e:
            QMessageBox.critical(window, "Erro", f"Ocorreu um erro: {str(e)}")

    def fechar_e_limpar():
        # Apaga os rastros
        if os.path.exists("temp.png"):
            os.remove("temp.png")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        window.close()

    btn_start = QPushButton("1. Abrir OpenCV e Marcar Áreas")
    btn_start.setStyleSheet(
        "background-color: #2563eb; color: white; padding: 12px; font-weight: bold; border-radius: 5px;"
    )
    btn_start.clicked.connect(start_opencv)
    layout.addWidget(btn_start)

    btn_close = QPushButton("2. Concluir e Apagar Temporários")
    btn_close.setStyleSheet(
        "background-color: #dc2626; color: white; padding: 12px; font-weight: bold; border-radius: 5px;"
    )
    btn_close.clicked.connect(fechar_e_limpar)
    layout.addWidget(btn_close)

    window.setLayout(layout)
    window.resize(700, 600)
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_pyside_app(sys.argv[1])
    else:
        print("Erro: Nenhum arquivo fornecido. Uso: python pyside_tool.py temp.pdf")
