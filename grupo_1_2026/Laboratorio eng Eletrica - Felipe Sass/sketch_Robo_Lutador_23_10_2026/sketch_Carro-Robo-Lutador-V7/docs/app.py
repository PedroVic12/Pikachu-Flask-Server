import sys
from pathlib import Path

from PyQt6 import QtCore, QtGui, QtWidgets, uic

from pages.analog_page import AnalogCircuitPage
from pages.jk_counter_page import JKCounterPage


class MainWindow(QtWidgets.QMainWindow):
    mainTabs: QtWidgets.QTabWidget
    analogTabLayout: QtWidgets.QVBoxLayout
    jkTabLayout: QtWidgets.QVBoxLayout

    def __init__(self):
        super().__init__()
        ui_path = Path(__file__).resolve().parent / "ui" / "mainwindow.ui"
        load_ui = getattr(uic, "loadUi", None)
        if load_ui is None:
            raise RuntimeError("PyQt6 não disponibiliza uic.loadUi.")
        load_ui(str(ui_path), self)

        self.analog_page = AnalogCircuitPage(self)
        self.jk_page = JKCounterPage(self)
        self.analogTabLayout.addWidget(self.analog_page)
        self.jkTabLayout.addWidget(self.jk_page)
        status_bar = self.statusBar()
        assert status_bar is not None
        self.analog_page.statusChanged.connect(status_bar.showMessage)
        self.jk_page.statusChanged.connect(status_bar.showMessage)
        self._create_actions()
        status_bar.showMessage("Selecione uma aba para começar.")

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
        self.action_import = self._create_action("Importar projeto JSON...", "Ctrl+O", self.import_project)
        self.action_save = self._create_action("Salvar projeto JSON...", "Ctrl+S", self.save_project)
        self.action_rotate = self._create_action("Girar componente 90°", "R", self.analog_page.rotate_selected)
        self.action_simulate = self._create_action("Simular circuito", "F5", self.analog_page.run_simulation)
        self.action_clock = self._create_action("Pulso de clock do contador JK", "Space", self.clock_counter)
        self.action_spice = self._create_action("Gerar netlist SPICE", "Ctrl+E", self.analog_page.generate_spice_netlist)
        self.action_svg = self._create_action("Exportar esquemático SVG...", "", self.analog_page.export_schemdraw)
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

        analog_menu = QtWidgets.QMenu("&Circuito", self)
        menu_bar.addMenu(analog_menu)
        analog_menu.addAction(self.action_rotate)
        analog_menu.addAction(self.action_simulate)
        analog_menu.addAction("Montar circuito padrão", self.analog_page.load_selected_preset)

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
        self.mainTabs.setCurrentIndex(0)
        self.analog_page.new_project()

    def import_project(self):
        self.mainTabs.setCurrentIndex(0)
        self.analog_page.import_project()

    def save_project(self):
        self.mainTabs.setCurrentIndex(0)
        self.analog_page.save_project()

    def clock_counter(self):
        self.mainTabs.setCurrentIndex(1)
        self.jk_page.clock_counter()

    def show_help(self):
        if self.mainTabs.currentIndex() == 1:
            self.jk_page.set_status(
                "Contador síncrono: Espaço aplica uma borda de subida; "
                "J=K=1 habilita a alternância do FF JK."
            )
            QtWidgets.QMessageBox.information(
                self,
                "Ajuda — contador JK",
                "Escolha 3 ou 4 bits, selecione a direção e aplique pulsos "
                "de clock com Espaço. Reset assíncrono leva Q a zero.\n"
                "Para contagem crescente, cada estágio alterna quando todos "
                "os bits inferiores são 1; para decrescente, quando são 0.",
            )
            return
        QtWidgets.QMessageBox.information(
            self,
            "Ajuda — circuitos",
            "Na aba Circuitos analógicos, escolha RC, RL ou RLC e pressione "
            "'Montar padrão'. Duplo clique edita valores, R gira o componente, "
            "F5 simula e Ctrl+E gera SPICE. Os projetos podem ser salvos e "
            "importados como JSON.\n\nAtalhos gerais: Ctrl+N novo, Ctrl+O "
            "importar, Ctrl+S salvar, F1 ajuda.",
        )

    def show_about(self):
        QtWidgets.QMessageBox.about(
            self,
            "Sobre a PyEDA Suite",
            "Simulador didático PyQt6 com páginas independentes para "
            "circuitos transientes RC/RL/RLC e contadores binários síncronos "
            "com flip-flops JK.",
        )


def main() -> int:
    application = QtWidgets.QApplication.instance() or QtWidgets.QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return application.exec()


if __name__ == "__main__":
    raise SystemExit(main())
