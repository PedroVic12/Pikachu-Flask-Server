# main.py
import sys
import os
import shutil
from pathlib import Path

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QScrollArea, QGroupBox,
    QLineEdit, QTextEdit, QMessageBox, QProgressBar
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QPixmap, QImage, QFont, QPalette, QColor

import pymupdf  # PyMuPDF
from PIL import Image

# pip install PyQt6 PyMuPDF Pillow

# ------------------------------------------------------------
# Classe para escanear a pasta em uma thread separada
# ------------------------------------------------------------
class ScannerThread(QThread):
    progress = pyqtSignal(int)
    finished = pyqtSignal(list, list)
    error = pyqtSignal(str)

    def __init__(self, root_dir):
        super().__init__()
        self.root_dir = root_dir

    def run(self):
        try:
            identified = []   # (caminho, nome_cliente)
            unidentified = [] # caminhos
            all_files = self._get_files(self.root_dir)
            total = len(all_files)
            for i, file_path in enumerate(all_files):
                self.progress.emit(i + 1)
                client_name = self._extract_client_name(file_path)
                if client_name:
                    identified.append((file_path, client_name))
                else:
                    unidentified.append(file_path)
            self.finished.emit(identified, unidentified)
        except Exception as e:
            self.error.emit(str(e))

    def _get_files(self, root):
        extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.pdf')
        files = []
        for dirpath, _, filenames in os.walk(root):
            for f in filenames:
                if f.lower().endswith(extensions):
                    files.append(os.path.join(dirpath, f))
        return files

    def _extract_client_name(self, file_path):
        base = os.path.splitext(os.path.basename(file_path))[0]
        base = base.strip()
        ignore_words = {'documento', 'doc', 'foto', 'img', 'imagem', 'scan', 'cópia', 'copy', 'novo', 'antigo'}
        for sep in [' - ', ' – ', '_', '.', '  ']:
            if sep in base:
                parts = base.split(sep, 1)
                candidate = parts[0].strip()
                if len(candidate) >= 3 and not any(w in candidate.lower() for w in ignore_words):
                    return candidate.title()
        if len(base) >= 3 and not any(w in base.lower() for w in ignore_words):
            return base.title()
        return None


# ------------------------------------------------------------
# Widget para exibir um arquivo não identificado
# ------------------------------------------------------------
class UnidentifiedFileWidget(QGroupBox):
    saved = pyqtSignal(str, str)
    ignored = pyqtSignal(str)

    def __init__(self, file_path, parent=None):
        super().__init__(parent)
        self.file_path = file_path
        self.setTitle(os.path.basename(file_path))
        self.setStyleSheet("""
            QGroupBox {
                font-size: 14pt;
                color: #ffffff;
                border: 2px solid #555;
                border-radius: 8px;
                margin-top: 1ex;
                background-color: #2b2b2b;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
                color: #ffffff;
            }
        """)

        layout = QVBoxLayout()

        # Área de visualização
        self.preview_label = QLabel()
        self.preview_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_label.setMinimumHeight(300)
        self.preview_label.setStyleSheet("border: 1px solid #555; background-color: #1e1e1e;")
        layout.addWidget(self.preview_label)

        # Texto extraído
        self.text_preview = QTextEdit()
        self.text_preview.setReadOnly(True)
        self.text_preview.setMaximumHeight(100)
        self.text_preview.setStyleSheet("font-size: 12pt; background-color: #1e1e1e; color: #ddd;")
        layout.addWidget(self.text_preview)

        # Campo para digitar o nome
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Digite o nome do cliente...")
        self.name_edit.setStyleSheet("""
            font-size: 14pt; padding: 6px;
            background-color: #3c3c3c; color: #ffffff;
            border: 1px solid #555;
            border-radius: 4px;
        """)
        layout.addWidget(self.name_edit)

        # Botões
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("Salvar e Mover")
        save_btn.setStyleSheet("""
            QPushButton {
                font-size: 14pt; padding: 8px;
                background-color: #4CAF50; color: white;
                border: none; border-radius: 6px;
            }
            QPushButton:hover { background-color: #45a049; }
        """)
        save_btn.clicked.connect(self._on_save)

        ignore_btn = QPushButton("Ignorar")
        ignore_btn.setStyleSheet("""
            QPushButton {
                font-size: 14pt; padding: 8px;
                background-color: #f44336; color: white;
                border: none; border-radius: 6px;
            }
            QPushButton:hover { background-color: #d32f2f; }
        """)
        ignore_btn.clicked.connect(self._on_ignore)

        btn_layout.addWidget(save_btn)
        btn_layout.addWidget(ignore_btn)
        layout.addLayout(btn_layout)

        self.setLayout(layout)

        self._load_preview()

    def _load_preview(self):
        try:
            if self.file_path.lower().endswith('.pdf'):
                self._load_pdf_preview()
            else:
                self._load_image_preview()
        except Exception as e:
            self.preview_label.setText(f"Erro ao carregar: {e}")

    def _load_image_preview(self):
        pixmap = QPixmap(self.file_path)
        if not pixmap.isNull():
            pixmap = pixmap.scaled(400, 400, Qt.AspectRatioMode.KeepAspectRatio,
                                   Qt.TransformationMode.SmoothTransformation)
            self.preview_label.setPixmap(pixmap)
        else:
            self.preview_label.setText("Não foi possível carregar a imagem.")

    def _load_pdf_preview(self):
        doc = pymupdf.open(self.file_path)
        if doc.page_count > 0:
            page = doc[0]
            # Renderizar a página para imagem
            mat = pymupdf.Matrix(1, 1)
            pix = page.get_pixmap(matrix=mat)
            # Converter para QImage
            img_data = pix.tobytes("ppm")  # PPM é simples
            # PPM tem cabeçalho, mas podemos usar PIL para ler
            from io import BytesIO
            img = Image.open(BytesIO(img_data))
            img.thumbnail((400, 400))
            # Converter para QImage
            if img.mode == "RGB":
                data = img.tobytes("raw", "RGB")
                qimage = QImage(data, img.width, img.height, QImage.Format.Format_RGB888)
            else:
                # fallback
                img = img.convert("RGB")
                data = img.tobytes("raw", "RGB")
                qimage = QImage(data, img.width, img.height, QImage.Format.Format_RGB888)
            pixmap = QPixmap.fromImage(qimage)
            self.preview_label.setPixmap(pixmap)

            # Extrair texto da primeira página
            text = page.get_text()
            if text.strip():
                self.text_preview.setPlainText(text.strip()[:500] + ("..." if len(text) > 500 else ""))
            else:
                self.text_preview.setPlainText("(Nenhum texto extraído)")
        else:
            self.preview_label.setText("PDF vazio.")
        doc.close()

    def _on_save(self):
        client_name = self.name_edit.text().strip()
        if not client_name:
            QMessageBox.warning(self, "Aviso", "Por favor, digite o nome do cliente.")
            return
        self.saved.emit(self.file_path, client_name)

    def _on_ignore(self):
        self.ignored.emit(self.file_path)


# ------------------------------------------------------------
# Janela principal com Dark Mode
# ------------------------------------------------------------
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Organizador de Arquivos - Agenda de Contatos")
        self.setGeometry(100, 100, 900, 700)

        # Aplicar Dark Mode global
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1e1e1e;
            }
            QWidget {
                color: #ffffff;
            }
            QLabel {
                color: #ffffff;
            }
            QPushButton {
                font-size: 14pt;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                color: white;
            }
            QPushButton#btnSelect {
                background-color: #2196F3;
            }
            QPushButton#btnSelect:hover {
                background-color: #1976D2;
            }
            QPushButton#btnOrganize {
                background-color: #FF9800;
            }
            QPushButton#btnOrganize:hover {
                background-color: #F57C00;
            }
            QPushButton#btnFinish {
                background-color: #9E9E9E;
            }
            QPushButton#btnFinish:hover {
                background-color: #757575;
            }
            QLineEdit {
                background-color: #3c3c3c;
                color: #ffffff;
                border: 1px solid #555;
                border-radius: 4px;
                padding: 4px;
            }
            QTextEdit {
                background-color: #2b2b2b;
                color: #ddd;
                border: 1px solid #555;
                border-radius: 4px;
            }
            QProgressBar {
                border: 1px solid #555;
                border-radius: 4px;
                text-align: center;
                color: white;
                background-color: #2b2b2b;
            }
            QProgressBar::chunk {
                background-color: #2196F3;
                border-radius: 4px;
            }
            QScrollArea {
                border: 1px solid #555;
                background-color: #2b2b2b;
            }
        """)

        # Atributos
        self.root_dir = None
        self.identified_files = []
        self.unidentified_files = []
        self.unidentified_widgets = []

        # Widget central
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)
        main_layout.setSpacing(15)

        # Linha 1: selecionar pasta
        folder_layout = QHBoxLayout()
        self.folder_label = QLabel("Nenhuma pasta selecionada")
        self.folder_label.setStyleSheet("""
            font-size: 14pt;
            border: 1px solid #555;
            padding: 8px;
            background-color: #2b2b2b;
            border-radius: 4px;
        """)
        self.folder_label.setWordWrap(True)
        folder_layout.addWidget(self.folder_label, stretch=1)

        select_btn = QPushButton("📂 Selecionar Pasta")
        select_btn.setObjectName("btnSelect")
        select_btn.clicked.connect(self.select_folder)
        folder_layout.addWidget(select_btn)
        main_layout.addLayout(folder_layout)

        # Progresso e status
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)

        self.status_label = QLabel("Aguardando seleção...")
        self.status_label.setStyleSheet("font-size: 14pt;")
        main_layout.addWidget(self.status_label)

        # Botão organizar identificados
        btn_auto = QPushButton("▶ Organizar Arquivos Identificados")
        btn_auto.setObjectName("btnOrganize")
        btn_auto.clicked.connect(self.organize_identified)
        main_layout.addWidget(btn_auto)

        # Separador
        sep = QLabel("───── Arquivos não identificados ─────")
        sep.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sep.setStyleSheet("font-size: 16pt; font-weight: bold; color: #ffffff;")
        main_layout.addWidget(sep)

        # Área de rolagem
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_container = QWidget()
        self.scroll_layout = QVBoxLayout(self.scroll_container)
        self.scroll_area.setWidget(self.scroll_container)
        main_layout.addWidget(self.scroll_area)

        # Botão finalizar
        finish_btn = QPushButton("✅ Finalizar (sair)")
        finish_btn.setObjectName("btnFinish")
        finish_btn.clicked.connect(self.close)
        main_layout.addWidget(finish_btn)

        # Ajuste de fonte global
        font = QFont()
        font.setPointSize(11)
        QApplication.setFont(font)

    def select_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Selecione a pasta com os arquivos")
        if folder:
            self.root_dir = folder
            self.folder_label.setText(f"📁 {folder}")
            self.status_label.setText("Escaneando arquivos...")
            self.progress_bar.setVisible(True)
            self.progress_bar.setValue(0)
            self.clear_unidentified()
            self.scanner = ScannerThread(folder)
            self.scanner.progress.connect(self.progress_bar.setValue)
            self.scanner.finished.connect(self.on_scan_finished)
            self.scanner.error.connect(self.on_scan_error)
            self.scanner.start()

    def clear_unidentified(self):
        for i in reversed(range(self.scroll_layout.count())):
            widget = self.scroll_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()
        self.unidentified_widgets.clear()

    def on_scan_finished(self, identified, unidentified):
        self.progress_bar.setVisible(False)
        self.identified_files = identified
        self.unidentified_files = unidentified

        msg = f"Total de arquivos: {len(identified) + len(unidentified)}\n"
        msg += f"Identificados: {len(identified)}\n"
        msg += f"Não identificados: {len(unidentified)}"
        self.status_label.setText(msg)

        if unidentified:
            self.status_label.setText(msg + "\n\nPreencha o nome para os arquivos abaixo e clique em Salvar.")
            self._build_unidentified_widgets()
        else:
            QMessageBox.information(self, "Pronto", "Todos os arquivos foram identificados! Clique em 'Organizar Arquivos Identificados' para mover.")

    def on_scan_error(self, error_msg):
        self.progress_bar.setVisible(False)
        QMessageBox.critical(self, "Erro", f"Erro ao escanear: {error_msg}")

    def _build_unidentified_widgets(self):
        self.clear_unidentified()
        for file_path in self.unidentified_files:
            widget = UnidentifiedFileWidget(file_path)
            widget.saved.connect(self.on_unidentified_saved)
            widget.ignored.connect(self.on_unidentified_ignored)
            self.scroll_layout.addWidget(widget)
            self.unidentified_widgets.append(widget)

    def on_unidentified_saved(self, file_path, client_name):
        try:
            self._move_file(file_path, client_name)
            if file_path in self.unidentified_files:
                self.unidentified_files.remove(file_path)
            for widget in self.unidentified_widgets:
                if widget.file_path == file_path:
                    widget.deleteLater()
                    self.unidentified_widgets.remove(widget)
                    break
            self.status_label.setText(f"Arquivo '{os.path.basename(file_path)}' movido para '{client_name}'.")
            if not self.unidentified_files:
                QMessageBox.information(self, "Concluído", "Todos os arquivos não identificados foram resolvidos!")
        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Falha ao mover arquivo: {e}")

    def on_unidentified_ignored(self, file_path):
        if file_path in self.unidentified_files:
            self.unidentified_files.remove(file_path)
        for widget in self.unidentified_widgets:
            if widget.file_path == file_path:
                widget.deleteLater()
                self.unidentified_widgets.remove(widget)
                break
        self.status_label.setText(f"Arquivo '{os.path.basename(file_path)}' ignorado (permanecerá na pasta original).")
        if not self.unidentified_files:
            QMessageBox.information(self, "Concluído", "Todos os arquivos não identificados foram resolvidos!")

    def organize_identified(self):
        if not self.identified_files:
            QMessageBox.information(self, "Info", "Nenhum arquivo identificado para organizar.")
            return
        if self.root_dir is None:
            QMessageBox.warning(self, "Aviso", "Selecione uma pasta primeiro.")
            return

        confirm = QMessageBox.question(
            self, "Confirmar",
            f"Serão movidos {len(self.identified_files)} arquivos para a estrutura de pastas.\nContinuar?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if confirm != QMessageBox.StandardButton.Yes:
            return

        moved = 0
        errors = []
        for file_path, client_name in self.identified_files:
            try:
                self._move_file(file_path, client_name)
                moved += 1
            except Exception as e:
                errors.append(f"{os.path.basename(file_path)}: {e}")

        self.identified_files = []
        msg = f"Arquivos movidos com sucesso: {moved}"
        if errors:
            msg += f"\nErros: {len(errors)} - " + "; ".join(errors[:3])
            if len(errors) > 3:
                msg += "..."
            QMessageBox.warning(self, "Organização concluída (com erros)", msg)
        else:
            QMessageBox.information(self, "Organização concluída", msg)

    def _move_file(self, file_path, client_name):
        first_char = client_name[0].upper()
        if not first_char.isalpha():
            first_char = "#"

        # Garantir que root_dir não seja None
        if self.root_dir is None:
            raise ValueError("Pasta raiz não definida.")

        dest_dir = os.path.join(self.root_dir, first_char, client_name)
        os.makedirs(dest_dir, exist_ok=True)

        dest_path = os.path.join(dest_dir, os.path.basename(file_path))

        counter = 1
        base, ext = os.path.splitext(dest_path)
        while os.path.exists(dest_path):
            dest_path = f"{base}_{counter}{ext}"
            counter += 1

        shutil.move(file_path, dest_path)


# ------------------------------------------------------------
# Ponto de entrada
# ------------------------------------------------------------
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())