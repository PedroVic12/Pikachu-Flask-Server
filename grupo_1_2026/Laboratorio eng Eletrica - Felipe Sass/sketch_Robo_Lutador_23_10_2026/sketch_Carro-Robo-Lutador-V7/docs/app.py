import sys
from pathlib import Path

from PyQt6 import QtCore, QtGui, QtWidgets, uic

from pages.analog_page import AnalogCircuitPage
from pages.jk_counter_page import JKCounterPage


APP_STYLESHEET = """
QMainWindow, QWidget { background: #10151f; color: #e6edf7; font-size: 13px; }
QFrame#sidebar { background: #151d2b; border-right: 1px solid #293549; }
QFrame#topBar { background: #151d2b; border-bottom: 1px solid #293549; }
QPushButton, QToolButton {
    background: #1b2637; color: #dce7f7; border: 1px solid #34445c;
    border-radius: 8px; padding: 8px 11px; min-height: 20px;
}
QPushButton:hover, QToolButton:hover { background: #26364b; border-color: #5aa9ff; }
QPushButton:checked, QPushButton[primary="true"] {
    background: #2878d0; border-color: #4a9cff; color: #ffffff;
}
QPushButton:disabled { color: #718096; background: #171e2a; }
QComboBox, QDoubleSpinBox, QSpinBox, QLineEdit, QPlainTextEdit, QTextEdit,
QTableWidget {
    background: #151e2c; color: #e6edf7; border: 1px solid #34445c;
    border-radius: 7px; padding: 6px; selection-background-color: #2878d0;
}
QComboBox::drop-down { border: 0; width: 24px; }
QComboBox QAbstractItemView { background: #151e2c; selection-background-color: #2878d0; }
QGroupBox, QFrame#toolPanel, QFrame#simulationPanel, QFrame#tablesPanel {
    background: #151d2a; border: 1px solid #29384d; border-radius: 11px;
}
QGroupBox { margin-top: 12px; padding: 12px 8px 8px; font-weight: 600; }
QGroupBox::title { subcontrol-origin: margin; left: 12px; padding: 0 5px; color: #a9bad1; }
QLabel#statusLabel { color: #a9bad1; }
QTabWidget::pane { border: 1px solid #29384d; border-radius: 8px; }
QTabBar::tab {
    background: #151e2c; color: #9eacc1; border: 1px solid #29384d;
    padding: 9px 13px; border-top-left-radius: 7px; border-top-right-radius: 7px;
}
QTabBar::tab:selected { background: #23344b; color: #ffffff; }
QHeaderView::section {
    background: #202d40; color: #dce7f7; border: 0; border-bottom: 1px solid #34445c;
    padding: 7px; font-weight: 600;
}
QToolBar { background: #151d2a; border: 0; spacing: 5px; padding: 4px; }
QStatusBar { background: #151d2a; color: #a9bad1; border-top: 1px solid #293549; }
QSplitter::handle { background: #293549; }
QScrollBar:vertical { background: #151d2a; width: 10px; }
QScrollBar::handle:vertical { background: #40516a; border-radius: 4px; min-height: 25px; }
"""


class MainWindow(QtWidgets.QMainWindow):
    mainStack: QtWidgets.QStackedWidget
    sidebar: QtWidgets.QFrame
    btnCollapseSidebar: QtWidgets.QToolButton
    btnAnalogNav: QtWidgets.QPushButton
    btnJKNav: QtWidgets.QPushButton
    lblBrand: QtWidgets.QLabel
    lblNavCaption: QtWidgets.QLabel
    lblSidebarFooter: QtWidgets.QLabel
    lblPageHeading: QtWidgets.QLabel

    def __init__(self):
        super().__init__()
        ui_path = Path(__file__).resolve().parent / "ui" / "mainwindow.ui"
        load_ui = getattr(uic, "loadUi", None)
        if load_ui is None:
            raise RuntimeError("PyQt6 não disponibiliza uic.loadUi.")
        load_ui(str(ui_path), self)
        self.setStyleSheet(APP_STYLESHEET)

        self.analog_page = AnalogCircuitPage(self)
        self.jk_page = JKCounterPage(self)
        self.mainStack.removeWidget(self.mainStack.widget(0))
        self.mainStack.removeWidget(self.mainStack.widget(0))
        self.mainStack.addWidget(self.analog_page)
        self.mainStack.addWidget(self.jk_page)
        self.sidebar_expanded = True
        self.btnAnalogNav.clicked.connect(lambda: self.set_active_page(0))
        self.btnJKNav.clicked.connect(lambda: self.set_active_page(1))
        self.btnCollapseSidebar.clicked.connect(self.toggle_sidebar)
        status_bar = self.statusBar()
        assert status_bar is not None
        self.analog_page.statusChanged.connect(status_bar.showMessage)
        self.jk_page.statusChanged.connect(status_bar.showMessage)
        self._create_actions()
        self.set_active_page(0)
        status_bar.showMessage(
            "PySpice gera o circuito SPICE; a análise transiente usa SciPy."
        )
        self._update_sidebar()

    def set_active_page(self, index: int):
        self.mainStack.setCurrentIndex(index)
        self.btnAnalogNav.setChecked(index == 0)
        self.btnJKNav.setChecked(index == 1)
        title = "Circuitos analógicos" if index == 0 else "Contador síncrono FF JK"
        self.lblPageHeading.setText(title)
        self.setWindowTitle(f"PyEDA Studio — {title}")

    def toggle_sidebar(self):
        self.sidebar_expanded = not self.sidebar_expanded
        self._update_sidebar()

    def _update_sidebar(self):
        compact = not self.sidebar_expanded or self.width() < 980
        self.sidebar.setFixedWidth(72 if compact else 224)
        self.lblBrand.setVisible(not compact)
        self.lblNavCaption.setVisible(not compact)
        self.lblSidebarFooter.setVisible(not compact)
        self.btnAnalogNav.setText("◉" if compact else "◉   Circuitos analógicos")
        self.btnJKNav.setText("▦" if compact else "▦   Contador FF JK")
        self.btnAnalogNav.setStyleSheet("font-size: 17px;" if compact else "")
        self.btnJKNav.setStyleSheet("font-size: 17px;" if compact else "")

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self._update_sidebar()

    def _create_action(self, text, shortcut, callback):
        action = QtGui.QAction(text, self)
        if shortcut:
            action.setShortcut(QtGui.QKeySequence(shortcut))
            action.setShortcutContext(QtCore.Qt.ShortcutContext.WindowShortcut)

        def invoke(_checked=False):
            del _checked
            callback()

        action.triggered.connect(invoke)
        self.addAction(action)
        return action

    def _create_actions(self):
        self.action_new = self._create_action("Novo circuito", "Ctrl+N", self.new_project)
        self.action_import = self._create_action(
            "Importar projeto JSON...", "Ctrl+O", self.import_project
        )
        self.action_save = self._create_action(
            "Salvar projeto JSON...", "Ctrl+S", self.save_project
        )
        self.action_rotate = self._create_action(
            "Girar componente 90°", "R", self.analog_page.rotate_selected
        )
        self.action_simulate = self._create_action(
            "Simular circuito", "F5", self.analog_page.run_simulation
        )
        self.action_clock = self._create_action(
            "Pulso de clock do contador JK", "Space", self.clock_counter
        )
        self.action_spice = self._create_action(
            "Gerar netlist SPICE", "Ctrl+E", self.analog_page.generate_spice_netlist
        )
        self.action_svg = self._create_action(
            "Exportar esquemático SVG...", "", self.analog_page.export_schemdraw
        )
        self.action_help = self._create_action("Ajuda", "F1", self.show_help)
        self.action_about = self._create_action("Sobre", "", self.show_about)

        menu_bar = self.menuBar()
        assert menu_bar is not None
        file_menu = QtWidgets.QMenu("&Arquivo", self)
        menu_bar.addMenu(file_menu)
        file_menu.addAction(self.action_new)
        file_menu.addAction(self.action_import)
        file_menu.addAction(self.action_save)
        file_menu.addSeparator()
        file_menu.addAction(self.action_spice)
        file_menu.addAction(self.action_svg)
        file_menu.addSeparator()
        file_menu.addAction("Sair", self.close)

        circuit_menu = QtWidgets.QMenu("&Circuito", self)
        menu_bar.addMenu(circuit_menu)
        circuit_menu.addAction(self.action_rotate)
        circuit_menu.addAction(self.action_simulate)
        circuit_menu.addAction("Montar circuito padrão", self.analog_page.load_selected_preset)

        counter_menu = QtWidgets.QMenu("&Contador JK", self)
        menu_bar.addMenu(counter_menu)
        counter_menu.addAction(self.action_clock)
        counter_menu.addAction("Reset assíncrono", self.jk_page.reset_counter)

        help_menu = QtWidgets.QMenu("&Ajuda", self)
        menu_bar.addMenu(help_menu)
        help_menu.addAction(self.action_help)
        help_menu.addAction(self.action_about)

        toolbar = QtWidgets.QToolBar("Ações", self)
        toolbar.setMovable(False)
        self.addToolBar(toolbar)
        for action in (
            self.action_new,
            self.action_import,
            self.action_save,
            self.action_rotate,
            self.action_simulate,
            self.action_clock,
            self.action_spice,
        ):
            toolbar.addAction(action)

    def new_project(self):
        self.set_active_page(0)
        self.analog_page.new_project()

    def import_project(self):
        self.set_active_page(0)
        self.analog_page.import_project()

    def save_project(self):
        self.set_active_page(0)
        self.analog_page.save_project()

    def clock_counter(self):
        self.set_active_page(1)
        self.jk_page.clock_counter()

    def show_help(self):
        if self.mainStack.currentIndex() == 1:
            self.jk_page.set_status(
                "Contador síncrono: Espaço aplica uma borda de subida; "
                "J=K=1 habilita a alternância do FF JK."
            )
            QtWidgets.QMessageBox.information(
                self,
                "Ajuda — contador JK",
                "Escolha 3 ou 4 bits, selecione a direção e aplique pulsos "
                "de clock com Espaço. Consulte as abas Equações e Tabelas "
                "para as funções booleanas e transições.",
            )
            return
        QtWidgets.QMessageBox.information(
            self,
            "Ajuda — circuitos",
            "Monte uma topologia ou arraste componentes para o canvas. Clique "
            "em dois terminais para conectar. No modo Chave manual, alterne "
            "a chave e simule para visualizar carga e descarga. F5 simula, "
            "R gira e Ctrl+E gera o netlist PySpice.",
        )

    def show_about(self):
        QtWidgets.QMessageBox.about(
            self,
            "Sobre a PyEDA Studio",
            "Laboratório didático com editor de circuitos, netlists PySpice, "
            "análise transiente SciPy e lógica simbólica SymPy. Para executar "
            "diretamente no ngspice, instale também o ngspice no sistema.",
        )


def main() -> int:
    application = QtWidgets.QApplication.instance() or QtWidgets.QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return application.exec()


if __name__ == "__main__":
    raise SystemExit(main())
