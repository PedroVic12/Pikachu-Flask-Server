from pathlib import Path

from PyQt6 import QtCore, QtGui, QtWidgets, uic

from pages.logic_models import jk_truth_table_rows
from pages.sequential_logic import (
    SequentialTruthRow,
    analyze_sequential_circuit,
    default_jk_expressions,
)
from pages.sequential_schematics import (
    karnaugh_diagrams,
    logic_diagrams,
    truth_table_diagrams,
)
from pages.jk_counter_model import JKCounterModel
from pages.sequential_views import (
    FittedGraphicsView,
    SvgGallery,
    TimingDiagram,
    draw_counter_diagram,
    draw_state_diagram,
)


class JKCounterPage(QtWidgets.QWidget):
    statusChanged = QtCore.pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        ui_path = Path(__file__).resolve().parents[1] / "ui" / "jk_counter_page.ui"
        uic.loadUi(str(ui_path), self)

        self.counter = JKCounterModel()
        self.expressions = default_jk_expressions(3, "UP")
        self.highlighted_bits: set[int] = set()
        self._analysis_rows: list[SequentialTruthRow] = []
        self._expression_edits: dict[str, QtWidgets.QLineEdit] = {}
        self._state_history = [0]
        self._build_workspace()
        self._connect_controls()
        self._populate_jk_truth_table()
        self._update_analysis()
        self._refresh_views()

    def _build_workspace(self):
        root_layout = self.layout()
        if not isinstance(root_layout, QtWidgets.QVBoxLayout):
            raise RuntimeError("A página do contador precisa de um layout vertical.")
        old_splitter = self.findChild(QtWidgets.QSplitter, "counterSplitter")
        controls = self.findChild(QtWidgets.QFrame, "counterControlsPanel")
        old_view = self.findChild(QtWidgets.QGraphicsView, "flipFlopView")
        if old_splitter is None or controls is None or old_view is None:
            raise RuntimeError("A interface do contador está incompleta.")

        self.jkTablesTabs = self.findChild(QtWidgets.QTabWidget, "jkTablesTabs")
        if self.jkTablesTabs is None:
            raise RuntimeError("A interface do contador está sem abas de análise.")
        self.lblEquations = self.findChild(QtWidgets.QLabel, "lblEquations")
        self.jkTruthTable = self.findChild(QtWidgets.QTableWidget, "jkTruthTable")
        self.counterTruthTable = self.findChild(
            QtWidgets.QTableWidget, "counterTruthTable"
        )
        self.lblState = self.findChild(QtWidgets.QLabel, "lblState")
        self.comboBits = self.findChild(QtWidgets.QComboBox, "comboBits")
        self.comboDirection = self.findChild(QtWidgets.QComboBox, "comboDirection")
        self.btnClock = self.findChild(QtWidgets.QPushButton, "btnClock")
        self.btnReset = self.findChild(QtWidgets.QPushButton, "btnReset")
        required = (
            self.lblEquations,
            self.jkTruthTable,
            self.counterTruthTable,
            self.lblState,
            self.comboBits,
            self.comboDirection,
            self.btnClock,
            self.btnReset,
        )
        if any(widget is None for widget in required):
            raise RuntimeError(
                "Faltam controles obrigatórios na interface do contador."
            )

        root_layout.removeWidget(controls)
        root_layout.removeWidget(old_splitter)
        old_view.setParent(None)
        self.jkTablesTabs.setParent(None)
        old_splitter.setParent(None)
        old_splitter.deleteLater()

        self.flipFlopView = FittedGraphicsView()
        self.flipFlopView.setObjectName("flipFlopView")
        self.flipFlopView.setMinimumSize(0, 230)
        self.flipFlopScene = QtWidgets.QGraphicsScene(self)
        self.flipFlopScene.setBackgroundBrush(QtGui.QColor("#111618"))
        self.flipFlopView.setScene(self.flipFlopScene)
        self.scene = self.flipFlopScene

        self.simulatorPane = QtWidgets.QWidget()
        simulator_layout = QtWidgets.QVBoxLayout(self.simulatorPane)
        simulator_layout.setContentsMargins(0, 0, 0, 0)
        simulator_layout.setSpacing(10)
        simulator_layout.addWidget(controls)
        self._build_expression_editor(simulator_layout)
        self._build_sequence_controls(simulator_layout)
        simulator_layout.addWidget(self.flipFlopView, 1)

        self.simulatorScroll = QtWidgets.QScrollArea()
        self.simulatorScroll.setWidgetResizable(True)
        self.simulatorScroll.setFrameShape(QtWidgets.QFrame.Shape.NoFrame)
        self.simulatorScroll.setWidget(self.simulatorPane)

        self.logicGallery = SvgGallery()
        self.tableGallery = SvgGallery()
        self.kmapGallery = SvgGallery()
        self.stateView = FittedGraphicsView()
        self.stateScene = QtWidgets.QGraphicsScene(self)
        self.stateScene.setBackgroundBrush(QtGui.QColor("#111618"))
        self.stateView.setScene(self.stateScene)
        self.timingView = TimingDiagram(self.counter.bit_count)
        self.jkTablesTabs.addTab(self.logicGallery, "Portas Schemdraw")
        self.jkTablesTabs.addTab(self.tableGallery, "Tabelas Schemdraw")
        self.jkTablesTabs.addTab(self.kmapGallery, "Mapas K")
        self.jkTablesTabs.addTab(self.stateView, "Estados")
        timing_tab = QtWidgets.QWidget()
        timing_layout = QtWidgets.QVBoxLayout(timing_tab)
        timing_layout.addWidget(self.timingView)
        timing_layout.addStretch(1)
        self.jkTablesTabs.addTab(timing_tab, "Temporização")

        self.workspaceSplitter = QtWidgets.QSplitter(QtCore.Qt.Orientation.Horizontal)
        self.workspaceSplitter.setObjectName("counterWorkspaceSplitter")
        self.workspaceSplitter.setChildrenCollapsible(False)
        self.workspaceSplitter.setHandleWidth(8)
        self.workspaceSplitter.addWidget(self.simulatorScroll)
        self.workspaceSplitter.addWidget(self.jkTablesTabs)
        self.workspaceSplitter.setStretchFactor(0, 5)
        self.workspaceSplitter.setStretchFactor(1, 6)
        self.workspaceSplitter.setMinimumSize(0, 0)
        self.workspaceSplitter.setSizes([520, 620])
        root_layout.insertWidget(1, self.workspaceSplitter, 1)
        self._set_responsive_orientation()

        self.jkTruthTable.setHorizontalHeaderLabels(["J", "K", "Q(t)", "Q(t+1)"])
        self.counterTruthTable.setHorizontalHeaderLabels(
            ["Q(t)", "J por FF", "K por FF", "Q(t+1)", "Decimal"]
        )
        for table in (self.jkTruthTable, self.counterTruthTable):
            table.horizontalHeader().setSectionResizeMode(
                QtWidgets.QHeaderView.ResizeMode.Stretch
            )
            table.verticalHeader().setVisible(False)

    def _build_expression_editor(self, parent_layout: QtWidgets.QVBoxLayout):
        self.expressionGroup = QtWidgets.QGroupBox("Equações das entradas J e K")
        self.expressionLayout = QtWidgets.QGridLayout(self.expressionGroup)
        self.expressionLayout.setColumnStretch(1, 1)
        self.expressionLayout.setColumnStretch(2, 1)
        parent_layout.addWidget(self.expressionGroup)
        self._populate_expression_fields()

    def _populate_expression_fields(self):
        while self.expressionLayout.count():
            item = self.expressionLayout.takeAt(0)
            if item.widget() is not None:
                item.widget().deleteLater()
        self._expression_edits.clear()
        for column, title in enumerate(("Flip-flop", "J", "K")):
            self.expressionLayout.addWidget(QtWidgets.QLabel(title), 0, column)
        for row, bit in enumerate(reversed(range(self.counter.bit_count)), start=1):
            self.expressionLayout.addWidget(QtWidgets.QLabel(f"FF{bit}"), row, 0)
            for column, kind in ((1, "J"), (2, "K")):
                key = f"{kind}{bit}"
                edit = QtWidgets.QLineEdit(self.expressions[key])
                edit.setMinimumWidth(0)
                edit.setPlaceholderText("Q0 & Q1, ~Q2")
                edit.setToolTip(
                    "Use Q0–Q3, 0/1, AND (&), OR (|), XOR (^), NOT (~), NAND, NOR or XNOR."
                )
                self._expression_edits[key] = edit
                self.expressionLayout.addWidget(edit, row, column)
        note = QtWidgets.QLabel(
            "Personalize cada FF ou escolha bits/direção para gerar um contador binário."
        )
        note.setWordWrap(True)
        note.setStyleSheet("color: #98a7be;")
        self.expressionLayout.addWidget(note, self.counter.bit_count + 1, 0, 1, 3)

        self.regenerateButton = QtWidgets.QPushButton("Gerar equações do contador")
        self.regenerateButton.setToolTip(
            "Restaura a sequência binária crescente ou decrescente selecionada."
        )
        self.regenerateButton.clicked.connect(self.regenerate_counter)
        self.expressionLayout.addWidget(
            self.regenerateButton, self.counter.bit_count + 2, 0, 1, 3
        )

    def _build_sequence_controls(self, parent_layout: QtWidgets.QVBoxLayout):
        group = QtWidgets.QGroupBox("Simulação da sequência")
        layout = QtWidgets.QGridLayout(group)
        self.initialStateSpin = QtWidgets.QSpinBox()
        self.initialStateSpin.setPrefix("Q = ")
        self.initialStateSpin.setToolTip("Estado decimal inicial.")
        self.clockCountSpin = QtWidgets.QSpinBox()
        self.clockCountSpin.setRange(1, 256)
        self.clockCountSpin.setValue(8)
        self.clockCountSpin.setSuffix(" pulsos")
        self.applyEquationsButton = QtWidgets.QPushButton("Aplicar")
        self.applyEquationsButton.setProperty("primary", True)
        self.simulateButton = QtWidgets.QPushButton("Simular")
        layout.addWidget(QtWidgets.QLabel("Estado inicial"), 0, 0)
        layout.addWidget(self.initialStateSpin, 0, 1)
        layout.addWidget(QtWidgets.QLabel("Pulsos"), 0, 2)
        layout.addWidget(self.clockCountSpin, 0, 3)
        layout.addWidget(self.applyEquationsButton, 1, 0, 1, 2)
        layout.addWidget(self.simulateButton, 1, 2, 1, 2)

        self.simulationResult = QtWidgets.QTableWidget(0, 4)
        self.simulationResult.setHorizontalHeaderLabels(
            ["Pulso", "Q(t)", "J / K", "Q(t+1)"]
        )
        self.simulationResult.setEditTriggers(
            QtWidgets.QAbstractItemView.EditTrigger.NoEditTriggers
        )
        self.simulationResult.setAlternatingRowColors(True)
        self.simulationResult.setMaximumHeight(155)
        self.simulationResult.horizontalHeader().setSectionResizeMode(
            QtWidgets.QHeaderView.ResizeMode.Stretch
        )
        layout.addWidget(self.simulationResult, 2, 0, 1, 4)
        parent_layout.addWidget(group)
        self.applyEquationsButton.clicked.connect(self.apply_equations)
        self.simulateButton.clicked.connect(self.simulate_sequence)

    def _connect_controls(self):
        self.btnClock.setProperty("primary", True)
        self.btnClock.clicked.connect(self.clock_counter)
        self.btnReset.clicked.connect(self.reset_counter)
        self.comboBits.currentIndexChanged.connect(self.configure_counter)
        self.comboDirection.currentIndexChanged.connect(self.configure_counter)

    def _set_responsive_orientation(self):
        if not hasattr(self, "workspaceSplitter"):
            return
        narrow = self.width() < 920
        orientation = (
            QtCore.Qt.Orientation.Vertical
            if narrow
            else QtCore.Qt.Orientation.Horizontal
        )
        if self.workspaceSplitter.orientation() != orientation:
            self.workspaceSplitter.setOrientation(orientation)
            self.workspaceSplitter.setSizes([440, 620] if narrow else [520, 620])

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self._set_responsive_orientation()

    def _populate_jk_truth_table(self):
        rows = jk_truth_table_rows()
        self.jkTruthTable.setRowCount(len(rows))
        for row_index, row in enumerate(rows):
            for column_index, value in enumerate(row):
                item = QtWidgets.QTableWidgetItem(str(value))
                item.setTextAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
                self.jkTruthTable.setItem(row_index, column_index, item)

    def configure_counter(self, _index=None):
        del _index
        self.regenerate_counter()

    def regenerate_counter(self):
        bit_count = 3 if self.comboBits.currentIndex() == 0 else 4
        direction = "UP" if self.comboDirection.currentIndex() == 0 else "DOWN"
        self.counter = JKCounterModel(bit_count=bit_count, direction=direction)
        self.expressions = default_jk_expressions(bit_count, direction)
        self.initialStateSpin.setRange(0, (1 << bit_count) - 1)
        self.initialStateSpin.setValue(0)
        self.highlighted_bits.clear()
        self._state_history = [0]
        self._populate_expression_fields()
        self._update_analysis()
        self._refresh_views()
        self.set_status(
            f"Contador de {bit_count} bits gerado: "
            f"{'crescente' if direction == 'UP' else 'decrescente'}."
        )

    def _read_expressions(self) -> dict[str, str]:
        return {
            key: field.text().strip() for key, field in self._expression_edits.items()
        }

    def _commit_expressions(self) -> bool:
        expressions = self._read_expressions()
        if expressions == self.expressions:
            return True
        try:
            rows = analyze_sequential_circuit(self.counter.bit_count, expressions)
        except ValueError as exc:
            QtWidgets.QMessageBox.warning(self, "Expressão inválida", str(exc))
            self.set_status(f"Expressão inválida: {exc}")
            return False
        self.expressions = expressions
        self._analysis_rows = rows
        self._update_analysis(rows)
        self._sync_inputs()
        self._refresh_views()
        return True

    def apply_equations(self):
        if self._commit_expressions():
            self.set_status("Equações aplicadas às tabelas, gráficos e ao simulador.")

    def _update_analysis(self, rows: list[SequentialTruthRow] | None = None):
        self._analysis_rows = rows or analyze_sequential_circuit(
            self.counter.bit_count, self.expressions
        )
        self.lblEquations.setText(self._equation_text())
        self._populate_transition_table()
        self.logicGallery.show_diagrams(
            logic_diagrams(self.counter.bit_count, self.expressions)
        )
        self.tableGallery.show_diagrams(
            truth_table_diagrams(self.counter.bit_count, self._analysis_rows),
            full_width={2},
        )
        self.kmapGallery.show_diagrams(
            karnaugh_diagrams(
                self.counter.bit_count, self.expressions, self._analysis_rows
            )
        )

    def _equation_text(self) -> str:
        equations = []
        for bit in reversed(range(self.counter.bit_count)):
            equations.append(
                f"FF{bit}: J{bit} = {self.expressions[f'J{bit}']}; "
                f"K{bit} = {self.expressions[f'K{bit}']}\n"
                f"Q{bit}(t+1) = J{bit}·¬Q{bit}(t) + ¬K{bit}·Q{bit}(t)"
            )
        return "\n\n".join(equations)

    def _populate_transition_table(self):
        self.counterTruthTable.setRowCount(len(self._analysis_rows))
        for row_index, row in enumerate(self._analysis_rows):
            values = (
                "".join(map(str, reversed(row.current_bits))),
                "".join(map(str, reversed(row.j_values))),
                "".join(map(str, reversed(row.k_values))),
                "".join(map(str, reversed(row.next_bits))),
                str(row.next_state),
            )
            for column, value in enumerate(values):
                item = QtWidgets.QTableWidgetItem(value)
                item.setTextAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
                self.counterTruthTable.setItem(row_index, column, item)

    def _sync_inputs(self):
        row = self._analysis_rows[self.counter.state]
        for bit, flip_flop in enumerate(self.counter.flip_flops):
            flip_flop.j = row.j_values[bit]
            flip_flop.k = row.k_values[bit]
            flip_flop.q = row.current_bits[bit]
            flip_flop.q_bar = 1 - row.current_bits[bit]

    def _refresh_views(self):
        self._sync_inputs()
        draw_counter_diagram(
            self.flipFlopView,
            self.flipFlopScene,
            self.counter,
            self.expressions,
            self.highlighted_bits,
        )
        draw_state_diagram(
            self.stateView,
            self.stateScene,
            self._analysis_rows,
            self.counter.state,
        )
        self.timingView.set_states(self._state_history, self.counter.bit_count)
        direction = "crescente" if self.counter.direction == "UP" else "decrescente"
        self.lblState.setText(
            f"Q = {self.counter.bits}   decimal = {self.counter.state}   "
            f"módulo {1 << self.counter.bit_count}   {direction}"
        )

    def clock_counter(self):
        if not self._commit_expressions():
            return
        previous = self.counter.state
        row = self._analysis_rows[previous]
        self.counter.clock_with_inputs(row.j_values, row.k_values)
        self._state_history.append(self.counter.state)
        self._state_history = self._state_history[-257:]
        changed = previous ^ self.counter.state
        self.highlighted_bits = {
            bit for bit in range(self.counter.bit_count) if changed & (1 << bit)
        }
        self._refresh_views()
        self.set_status(
            f"Clock aplicado: Q = {self.counter.bits} "
            f"(decimal {self.counter.state})."
        )
        QtCore.QTimer.singleShot(450, self._clear_highlight)

    def _clear_highlight(self):
        self.highlighted_bits.clear()
        self._refresh_views()

    def simulate_sequence(self):
        if not self._commit_expressions():
            return
        self.counter.set_state(self.initialStateSpin.value())
        state = self.counter.state
        history = [state]
        pulse_count = self.clockCountSpin.value()
        self.simulationResult.setRowCount(pulse_count + 1)
        self._set_result_row(0, ("0", self.counter.bits, "—", "—"))

        for pulse in range(1, pulse_count + 1):
            row = self._analysis_rows[state]
            current_bits = format(state, f"0{self.counter.bit_count}b")
            inputs = (
                f"J={''.join(map(str, reversed(row.j_values)))}; "
                f"K={''.join(map(str, reversed(row.k_values)))}"
            )
            self.counter.clock_with_inputs(row.j_values, row.k_values)
            state = self.counter.state
            history.append(state)
            self._set_result_row(
                pulse,
                (
                    str(pulse),
                    current_bits,
                    inputs,
                    format(state, f"0{self.counter.bit_count}b"),
                ),
            )

        self._state_history = history
        self.highlighted_bits.clear()
        self._refresh_views()
        self.set_status(
            f"{pulse_count} pulsos: estado final {self.counter.bits} "
            f"(decimal {self.counter.state})."
        )

    def _set_result_row(self, row: int, values: tuple[str, ...]):
        for column, value in enumerate(values):
            item = QtWidgets.QTableWidgetItem(value)
            item.setTextAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
            self.simulationResult.setItem(row, column, item)

    def reset_counter(self):
        self.counter.reset()
        self._state_history = [self.counter.state]
        self.highlighted_bits.clear()
        self._refresh_views()
        self.set_status("Reset assíncrono aplicado.")

    def set_status(self, message: str):
        self.statusChanged.emit(message)
