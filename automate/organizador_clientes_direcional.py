# ==========================================
# GERENCIADOR DE ARQUIVOS DEFINITIVO - MAIN.PY
# CÓDIGO ÚNICO E COMPLETO
# ==========================================
import os
import sys
import shutil
import re
import unicodedata
from collections import defaultdict
import traceback

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, 
    QScrollArea, QGroupBox, QLineEdit, QTextEdit, QProgressBar, QTabWidget,
    QGridLayout, QSplitter, QListWidget, QComboBox, QFormLayout, QFileDialog, QMessageBox, QListWidgetItem
)
from PyQt6.QtCore import Qt, pyqtSignal, QThread
from PyQt6.QtGui import QPixmap, QImage

# --- GATILHO DE ERROS GLOBAIS ---
def global_exception_handler(exctype, value, tb):
    error_msg = "".join(traceback.format_exception(exctype, value, tb))
    print("ERRO CRÍTICO:", error_msg)
    msg = QMessageBox()
    msg.setIcon(QMessageBox.Icon.Critical)
    msg.setWindowTitle("Erro Inesperado")
    msg.setText("Ocorreu um erro e o programa evitou fechar. Veja os detalhes.")
    msg.setDetailedText(error_msg)
    msg.exec()

sys.excepthook = global_exception_handler

# ==========================================
# 1. CONFIGURAÇÕES GLOBAIS E VARIÁVEIS DA TELA
# ==========================================

FONT_SIZE_GLOBAL = 10       
FONT_SIZE_HEADERS = 12      
FONT_SIZE_BUTTONS = 10      
SIDEBAR_MIN_WIDTH = 250     
SIDEBAR_MAX_WIDTH = 350     

# Cores Dark Mode
COLOR_BG_MAIN = "#1e1e1e"
COLOR_BG_PANEL = "#2b2b2b"
COLOR_BG_INPUT = "#3c3c3c"
COLOR_TEXT = "#ffffff"
COLOR_TEXT_MUTED = "#dddddd"
COLOR_BTN_PRIMARY = "#2196F3"
COLOR_BTN_SUCCESS = "#4CAF50"
COLOR_BTN_WARNING = "#FF9800"
COLOR_BTN_DANGER = "#f44336"

# Se True: Organiza em pastas alfabéticas de nível 1 (ex: A / ALICE / arquivo.pdf)
USE_ALPHABETICAL_FOLDERS = True 

# Stopwords atualizadas para adivinhar o nome do cliente corretamente
STOPWORDS = {
    'documento', 'doc', 'boleto', 'foto', 'img', 'imagem', 'carteira', 'certidao', 
    'contracheque', 'contra cheque', 'historico', 'historico-creditos', 'comprovante', 
    'bradesco', 'camscanner', 'nu_', 'cnh', 'rg', 'cpf', 'extrato', 'identidade', 
    'comp', 'residencia', 'nota', 'whatsapp', 'image', 'carta', 'pagamentos', 
    'solemar', 'ilovepdf', 'merged', 'novo', 'copia', 'scan', 'scanner', 'mobile',
    'anotacao', 'anotação'
}

# Dependências de OCR e PDF
try:
    import pytesseract
    from PIL import Image
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False

try:
    import pymupdf  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False


# ==========================================
# 2. LÓGICA DE NEGÓCIOS (MODEL)
# ==========================================

class FileScanner(QThread):
    """Varre arquivos mantendo o nome original e agrupando perfeitamente por cliente."""
    progress = pyqtSignal(int)
    finished = pyqtSignal(list, list, dict)
    error = pyqtSignal(str)

    def __init__(self, root_dir):
        super().__init__()
        self.root_dir = root_dir

    def run(self):
        try:
            identified = []   
            unidentified = [] 
            client_files = defaultdict(list)  
            
            all_files, client_files_cache_names = self._get_files(self.root_dir)
            
            for i, file_path in enumerate(all_files):
                self.progress.emit(i + 1)
                client_name = self._extract_client_name(file_path)
                
                if client_name:
                    identified.append((file_path, client_name))
                    client_files[client_name].append(file_path)
                else:
                    unidentified.append(file_path)
                    
            FileManager.clean_empty_folders(self.root_dir)
            
            for c_name in client_files_cache_names:
                if c_name not in client_files:
                    client_files[c_name] = []

            self.finished.emit(identified, unidentified, dict(client_files))
        except Exception as e:
            self.error.emit(str(e))

    def _get_files(self, root):
        extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.pdf', '.htm', '.html')
        files = []
        existing_clients = set()
        alphabet_indexes = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'}

        for dirpath, dirnames, filenames in os.walk(root):
            rel_path = os.path.relpath(dirpath, root)
            parts = rel_path.split(os.sep)
            
            if USE_ALPHABETICAL_FOLDERS:
                if len(parts) == 2 and parts[0].upper() in alphabet_indexes:
                    existing_clients.add(parts[1].upper())
                    continue
                elif len(parts) >= 3 and parts[0].upper() in alphabet_indexes:
                    existing_clients.add(parts[1].upper())
                    continue
            else:
                if len(parts) == 1 and parts[0] != '.':
                    existing_clients.add(parts[0].upper())
                    continue

            if USE_ALPHABETICAL_FOLDERS and len(parts) >= 2 and parts[0].upper() in alphabet_indexes:
                continue

            for f in filenames:
                if f.lower().endswith(extensions):
                    files.append(os.path.join(dirpath, f))
                    
        return files, existing_clients

    def _clean_word(self, word):
        w = word.lower()
        return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')

    def _extract_client_name(self, file_path):
        base = os.path.splitext(os.path.basename(file_path))[0]
        base = re.sub(r'[_.-]', ' ', base)
        base = re.sub(r'\s+', ' ', base).strip()
        
        words = base.split()
        cleaned_words = []
        
        for w in words:
            clean_w = self._clean_word(w)
            if clean_w.isdigit() or len(clean_w) <= 1 or re.match(r'^\d{4}$', clean_w) or re.match(r'^\d{2}$', clean_w):
                continue
            is_stop = False
            for stop in STOPWORDS:
                if clean_w == stop or stop in clean_w:
                    is_stop = True
                    break
            if not is_stop:
                cleaned_words.append(w)
                
        if cleaned_words:
            client_full = ' '.join(cleaned_words).strip()
            if len(client_full) > 2:
                return client_full.upper()
                
        return None

class DocumentProcessor:
    @staticmethod
    def extract_text_from_image(file_path):
        if not HAS_TESSERACT:
            return "⚠️ OCR de imagem indisponível."
        try:
            with Image.open(file_path) as pil_img:
                text = pytesseract.image_to_string(pil_img, lang='por')
                return text.strip() if text.strip() else "(Nenhum texto detectado)"
        except Exception as e:
            return f"(Erro no OCR: {e})"

    @staticmethod
    def extract_text_from_pdf(file_path):
        if not HAS_PYMUPDF:
            return "⚠️ PyMuPDF não instalado."
        try:
            doc = pymupdf.open(file_path)
            if doc.page_count > 0:
                text = doc[0].get_text()
                doc.close()
                return text.strip()[:1000] + ("..." if len(text) > 1000 else "") if text.strip() else "(PDF vazio)"
            return "PDF vazio."
        except Exception as e:
            return f"(Erro ao ler PDF: {e})"

class FileManager:
    @staticmethod
    def move_file(root_dir, file_path, client_name, target_filename, subfolder=""):
        client_name = client_name.upper().strip()
        
        if USE_ALPHABETICAL_FOLDERS:
            first_char = client_name[0]
            if not first_char.isalpha():
                first_char = "#"
            dest_dir = os.path.join(root_dir, first_char, client_name)
        else:
            dest_dir = os.path.join(root_dir, client_name)

        os.makedirs(dest_dir, exist_ok=True)
        for sub in ['documentos pessoais', 'documentos financeiros', 'complementares']:
            os.makedirs(os.path.join(dest_dir, sub), exist_ok=True)
            
        if subfolder:
            dest_dir = os.path.join(dest_dir, subfolder)

        dest_path = os.path.join(dest_dir, target_filename)

        if os.path.abspath(file_path) == os.path.abspath(dest_path):
            return dest_path

        counter = 1
        base, ext = os.path.splitext(dest_path)
        while os.path.exists(dest_path) and os.path.abspath(file_path) != os.path.abspath(dest_path):
            dest_path = f"{base}_{counter}{ext}"
            counter += 1

        shutil.move(file_path, dest_path)
        return dest_path

    @staticmethod
    def clean_empty_folders(root_dir):
        for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
            if os.path.abspath(dirpath) == os.path.abspath(root_dir):
                continue
            try:
                if not os.listdir(dirpath):
                    os.rmdir(dirpath)
            except Exception:
                pass


# ==========================================
# 3. INTERFACE VISUAL (VIEW)
# ==========================================

class FileReviewWidget(QGroupBox):
    saved = pyqtSignal(str, str, str, str)
    ignored = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__("Nenhum arquivo selecionado", parent)
        self.current_file = None
        
        main_layout = QVBoxLayout(self)
        self.visual_splitter = QSplitter(Qt.Orientation.Vertical)
        
        self.preview_scroll = QScrollArea()
        self.preview_scroll.setWidgetResizable(True)
        self.preview_scroll.setStyleSheet(f"background-color: {COLOR_BG_MAIN}; border: 1px solid #555;")
        
        self.preview_label = QLabel("Selecione um arquivo.")
        self.preview_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_scroll.setWidget(self.preview_label)
        self.visual_splitter.addWidget(self.preview_scroll)

        self.text_preview = QTextEdit()
        self.text_preview.setReadOnly(True)
        self.text_preview.setStyleSheet(f"font-size: {FONT_SIZE_GLOBAL}pt; background-color: {COLOR_BG_MAIN}; color: {COLOR_TEXT_MUTED};")
        self.visual_splitter.addWidget(self.text_preview)

        self.visual_splitter.setStretchFactor(0, 3) 
        self.visual_splitter.setStretchFactor(1, 1)
        main_layout.addWidget(self.visual_splitter)

        form_layout = QFormLayout()
        self.filename_edit = QLineEdit()
        form_layout.addRow("Nome Completo do Arquivo:", self.filename_edit)
        
        self.client_combo = QComboBox()
        self.client_combo.setEditable(True)
        form_layout.addRow("Pasta do Cliente:", self.client_combo)
        
        self.subfolder_combo = QComboBox()
        self.subfolder_combo.addItems(["(Salvar na Raiz do Cliente)", "documentos pessoais", "documentos financeiros", "complementares"])
        form_layout.addRow("Subpasta (Opcional):", self.subfolder_combo)
        
        main_layout.addLayout(form_layout)

        btn_layout = QHBoxLayout()
        self.save_btn = QPushButton("Salvar e Mover")
        self.save_btn.setStyleSheet(f"background-color: {COLOR_BTN_SUCCESS}; font-weight: bold;")
        self.save_btn.clicked.connect(self._on_save)
        
        self.ignore_btn = QPushButton("Ignorar")
        self.ignore_btn.setStyleSheet(f"background-color: {COLOR_BTN_DANGER}; font-weight: bold;")
        self.ignore_btn.clicked.connect(self._on_ignore)
        
        btn_layout.addWidget(self.save_btn)
        btn_layout.addWidget(self.ignore_btn)
        main_layout.addLayout(btn_layout)

        self.setEnabled(False)

    def _on_save(self):
        client_name = self.client_combo.currentText().strip().upper()
        new_filename = self.filename_edit.text().strip()
        subfolder = self.subfolder_combo.currentText()
        if subfolder == "(Salvar na Raiz do Cliente)":
            subfolder = ""
        
        if self.current_file and new_filename:
            _, original_ext = os.path.splitext(self.current_file)
            if not new_filename.lower().endswith(original_ext.lower()):
                new_filename += original_ext

        if client_name and new_filename:
            self.saved.emit(self.current_file, client_name, new_filename, subfolder)

    def _on_ignore(self):
        self.ignored.emit(self.current_file)


class ClientTab(QWidget):
    folder_clicked = pyqtSignal(str)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        
        title = QLabel("Pastas de Clientes:")
        title.setStyleSheet(f"font-size: {FONT_SIZE_HEADERS}pt; font-weight: bold;")
        layout.addWidget(title)

        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_container = QWidget()
        self.grid_layout = QGridLayout(self.scroll_container)
        self.scroll_area.setWidget(self.scroll_container)
        layout.addWidget(self.scroll_area)

    def populate(self, client_list):
        for i in reversed(range(self.grid_layout.count())): 
            self.grid_layout.itemAt(i).widget().setParent(None)

        row, col = 0, 0
        for client_name in sorted(client_list):
            btn = QPushButton(client_name)
            btn.setStyleSheet(f"background-color: {COLOR_BTN_PRIMARY}; padding: 10px; font-weight: bold;")
            btn.clicked.connect(lambda checked, name=client_name: self.folder_clicked.emit(name))
            self.grid_layout.addWidget(btn, row, col)
            col += 1
            if col >= 4:
                col = 0; row += 1


class MainWindow(QMainWindow):
    btn_select_clicked = pyqtSignal()
    btn_auto_clicked = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Organizador de Documentos Definitivo")
        self.resize(1000, 700) 
        
        self.setStyleSheet(f"""
            QMainWindow {{ background-color: {COLOR_BG_MAIN}; }}
            QWidget {{ color: {COLOR_TEXT}; font-size: {FONT_SIZE_GLOBAL}pt; }}
            QMessageBox {{ background-color: {COLOR_BG_PANEL}; color: {COLOR_TEXT}; }}
            QMessageBox QLabel {{ color: {COLOR_TEXT}; background-color: transparent; }}
            QMessageBox QPushButton {{ background-color: {COLOR_BG_INPUT}; color: {COLOR_TEXT}; padding: 5px 15px; border-radius: 3px; }}
            QTabWidget::pane {{ border: 1px solid #555; background-color: {COLOR_BG_PANEL}; }}
            QTabBar::tab {{ background-color: {COLOR_BG_INPUT}; padding: 8px 16px; color: {COLOR_TEXT}; }}
            QTabBar::tab:selected {{ background-color: {COLOR_BTN_PRIMARY}; font-weight: bold; color: {COLOR_TEXT}; }}
            QPushButton {{ font-size: {FONT_SIZE_BUTTONS}pt; padding: 6px 12px; border: none; border-radius: 4px; color: white; }}
            QLineEdit, QComboBox {{ background-color: {COLOR_BG_INPUT}; border: 1px solid #555; padding: 4px; border-radius: 4px; color: {COLOR_TEXT}; }}
            QComboBox QAbstractItemView {{ background-color: {COLOR_BG_INPUT}; color: {COLOR_TEXT}; selection-background-color: {COLOR_BTN_PRIMARY}; }}
            QListWidget {{ background-color: {COLOR_BG_PANEL}; border: 1px solid #555; color: {COLOR_TEXT}; }}
            QListWidget::item:selected {{ background-color: {COLOR_BTN_PRIMARY}; color: {COLOR_TEXT}; }}
        """)

        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)

        self.tabs = QTabWidget()
        main_layout.addWidget(self.tabs)

        self.setup_organize_tab()
        
        self.client_tab = ClientTab()
        self.tabs.addTab(self.client_tab, "Explorar Pastas")

    def setup_organize_tab(self):
        self.organize_tab = QWidget()
        self.tabs.addTab(self.organize_tab, "Organizar e Revisar")
        layout = QVBoxLayout(self.organize_tab)

        header_layout = QHBoxLayout()
        self.folder_label = QLabel("Nenhuma pasta selecionada")
        self.folder_label.setStyleSheet("border: 1px solid #555; padding: 6px; border-radius: 4px;")
        header_layout.addWidget(self.folder_label, stretch=1)
        
        btn_select = QPushButton("📂 Selecionar Pasta Base")
        btn_select.setStyleSheet(f"background-color: {COLOR_BTN_PRIMARY}; font-weight: bold;")
        btn_select.clicked.connect(lambda: self.btn_select_clicked.emit())
        header_layout.addWidget(btn_select)

        layout.addLayout(header_layout)

        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        layout.addWidget(self.progress_bar)

        self.status_label = QLabel("Aguardando seleção...")
        layout.addWidget(self.status_label)

        self.btn_auto = QPushButton("▶ Organizar Mantendo Nomes Completos & Limpar Vazias")
        self.btn_auto.setStyleSheet(f"background-color: {COLOR_BTN_WARNING}; font-weight: bold; padding: 10px; color: black;")
        self.btn_auto.clicked.connect(lambda: self.btn_auto_clicked.emit())
        layout.addWidget(self.btn_auto)

        self.main_splitter = QSplitter(Qt.Orientation.Horizontal)
        self.sidebar_list = QListWidget()
        self.sidebar_list.setMinimumWidth(SIDEBAR_MIN_WIDTH)
        self.sidebar_list.setMaximumWidth(SIDEBAR_MAX_WIDTH)
        self.main_splitter.addWidget(self.sidebar_list)

        self.detail_view = FileReviewWidget()
        self.main_splitter.addWidget(self.detail_view)
        
        layout.addWidget(self.main_splitter)

    def render_image(self, file_path):
        pixmap = QPixmap(file_path)
        if not pixmap.isNull():
            pixmap = pixmap.scaled(800, 800, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
            self.detail_view.preview_label.setPixmap(pixmap)
        else:
            self.detail_view.preview_label.setText("Erro ao carregar a imagem.")

    def render_pdf(self, file_path):
        try:
            import pymupdf
            doc = pymupdf.open(file_path)
            if doc.page_count > 0:
                page = doc[0]
                mat = pymupdf.Matrix(1.5, 1.5)
                pix = page.get_pixmap(matrix=mat)
                
                from PIL import Image
                from io import BytesIO
                img = Image.open(BytesIO(pix.tobytes("ppm")))
                img.thumbnail((800, 800))
                
                if img.mode != "RGB":
                    img = img.convert("RGB")
                
                data = img.tobytes("raw", "RGB")
                qimage = QImage(data, img.width, img.height, QImage.Format.Format_RGB888)
                self.detail_view.preview_label.setPixmap(QPixmap.fromImage(qimage))
            doc.close()
        except Exception as e:
            self.detail_view.preview_label.setText(f"Erro ao renderizar PDF: {e}")


# ==========================================
# 4. CONTROLADOR DE EVENTOS (CONTROLLER)
# ==========================================

class AppController:
    def __init__(self, view):
        self.view = view
        self.root_dir = None
        self.identified_files = []
        self.unidentified_files = []
        self.client_names_cache = set()
        
        self._connect_signals()

    def _connect_signals(self):
        self.view.btn_select_clicked.connect(self.select_folder)
        self.view.btn_auto_clicked.connect(self.organize_identified)
        self.view.sidebar_list.currentItemChanged.connect(self.on_sidebar_selection)
        self.view.detail_view.saved.connect(self.save_pending_file)
        self.view.detail_view.ignored.connect(self.ignore_pending_file)
        self.view.client_tab.folder_clicked.connect(self.open_client_folder_os)

    def select_folder(self):
        folder = QFileDialog.getExistingDirectory(self.view, "Selecione a pasta raiz")
        if folder:
            self.root_dir = folder
            self.view.folder_label.setText(f"📁 {folder}")
            self.view.status_label.setText("Analisando arquivos...")
            self.view.progress_bar.setVisible(True)
            self.view.progress_bar.setValue(0)
            
            self.view.sidebar_list.clear()
            self._reset_detail_view()
            
            self.scanner = FileScanner(folder)
            self.scanner.progress.connect(self.view.progress_bar.setValue)
            self.scanner.finished.connect(self.on_scan_finished)
            self.scanner.error.connect(self.on_scan_error)
            self.scanner.start()

    def on_scan_finished(self, identified, unidentified, client_dict):
        self.view.progress_bar.setVisible(False)
        self.identified_files = identified
        self.unidentified_files = unidentified
        self.client_names_cache = set(client_dict.keys())

        msg = f"Prontos para mover: {len(identified)} | Pendentes de revisão manual: {len(unidentified)}"
        self.view.status_label.setText(msg)
        self.view.client_tab.populate(self.client_names_cache)

        for filepath in unidentified:
            item = QListWidgetItem(os.path.basename(filepath))
            item.setData(Qt.ItemDataRole.UserRole, filepath)
            self.view.sidebar_list.addItem(item)

        if not unidentified and identified:
            QMessageBox.information(self.view, "Pronto", "Pastas limpas e arquivos organizados mantendo os nomes originais!")

    def on_scan_error(self, err):
        self.view.progress_bar.setVisible(False)
        QMessageBox.critical(self.view, "Erro", str(err))

    def on_sidebar_selection(self, current, previous):
        if not current:
            self._reset_detail_view()
            return
            
        filepath = current.data(Qt.ItemDataRole.UserRole)
        if not filepath:
            return
            
        filename = os.path.basename(filepath)
        dv = self.view.detail_view
        
        dv.current_file = filepath
        dv.setTitle(filename)
        dv.filename_edit.setText(filename)
        dv.client_combo.clear()
        dv.client_combo.addItems(sorted(self.client_names_cache))
        dv.client_combo.setCurrentText("")
        
        dv.preview_label.setText("Carregando...")
        dv.text_preview.setPlainText("Extraindo texto...")
        dv.setEnabled(True)
        self.view.repaint()

        if filepath.lower().endswith('.pdf'):
            dv.text_preview.setPlainText(DocumentProcessor.extract_text_from_pdf(filepath))
            self.view.render_pdf(filepath)
        elif filepath.lower().endswith(('.htm', '.html')):
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                dv.text_preview.setPlainText(content[:1000])
                dv.preview_label.setText("Arquivo HTML (Visualização em Texto)")
            except Exception as e:
                dv.text_preview.setPlainText(f"Erro ao ler HTML: {e}")
        else:
            dv.text_preview.setPlainText(DocumentProcessor.extract_text_from_image(filepath))
            self.view.render_image(filepath)

    def _reset_detail_view(self):
        dv = self.view.detail_view
        dv.current_file = None
        dv.setTitle("Nenhum arquivo")
        dv.preview_label.setText("Selecione um arquivo na lista lateral.")
        dv.text_preview.clear()
        dv.filename_edit.clear()
        dv.client_combo.clear()
        dv.setEnabled(False)

    def remove_current_sidebar_item(self):
        row = self.view.sidebar_list.currentRow()
        if row >= 0:
            item = self.view.sidebar_list.takeItem(row)
            del item

    def save_pending_file(self, filepath, client_name, target_filename, subfolder=""):
        if not self.root_dir:
            return
        try:
            FileManager.move_file(self.root_dir, filepath, client_name, target_filename, subfolder)
            self.remove_current_sidebar_item()
            
            client_name = client_name.upper()
            if client_name not in self.client_names_cache:
                self.client_names_cache.add(client_name)
                self.view.client_tab.populate(self.client_names_cache)
                
            FileManager.clean_empty_folders(self.root_dir)
            self.view.status_label.setText(f"Arquivo salvo com o nome completo para '{client_name}'.")
        except Exception as e:
            QMessageBox.critical(self.view, "Erro", f"Falha ao mover arquivo:\n{e}")

    def ignore_pending_file(self, filepath):
        self.remove_current_sidebar_item()
        self.view.status_label.setText("Arquivo ignorado.")

    def organize_identified(self):
        if not self.identified_files:
            QMessageBox.information(self.view, "Aviso", "Nenhum arquivo auto-identificado para mover.")
            return
        
        moved = 0
        errors = []
        for file_path, client_name in self.identified_files:
            try:
                target = os.path.basename(file_path)
                FileManager.move_file(self.root_dir, file_path, client_name, target)
                moved += 1
                
                client_name_upper = client_name.upper()
                if client_name_upper not in self.client_names_cache:
                    self.client_names_cache.add(client_name_upper)
            except Exception as e:
                errors.append(f"{os.path.basename(file_path)}: {e}")

        self.identified_files = []
        FileManager.clean_empty_folders(self.root_dir)
        self.view.client_tab.populate(self.client_names_cache)
        
        if errors:
            QMessageBox.warning(self.view, "Atenção", f"Movidos: {moved}. Erros: {len(errors)}")
        else:
            QMessageBox.information(self.view, "Sucesso", f"{moved} arquivos movidos mantendo seus nomes completos originais!")

    def open_client_folder_os(self, client_name):
        if not self.root_dir: return
        client_name = client_name.upper()
        if USE_ALPHABETICAL_FOLDERS:
            first_char = client_name[0]
            if not first_char.isalpha(): first_char = "#"
            folder_path = os.path.join(self.root_dir, first_char, client_name)
        else:
            folder_path = os.path.join(self.root_dir, client_name)
            
        if os.path.exists(folder_path):
            if sys.platform == 'win32': os.startfile(folder_path)
            elif sys.platform == 'darwin': os.system(f'open "{folder_path}"')
            else: os.system(f'xdg-open "{folder_path}"')


# ==========================================
# 5. EXECUÇÃO PRINCIPAL (MAIN)
# ==========================================

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    controller = AppController(window)
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()