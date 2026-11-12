from pathlib import Path

from PyQt6 import QtCore, QtGui, QtWidgets, uic

from pages.logic_models import jk_counter_equations, jk_truth_table_rows
from simulando_circuitos_digitais_3bits import JKCounterModel


class JKCounterPage(QtWidgets.QWidget):
    statusChanged = QtCore.pyqtSignal(str)

    comboBits: QtWidgets.QComboBox
    comboDirection: QtWidgets.QComboBox
    btnClock: QtWidgets.QPushButton
    btnReset: QtWidgets.QPushButton
    lblState: QtWidgets.QLabel
    lblEquations: QtWidgets.QLabel
    flipFlopView: QtWidgets.QGraphicsView
    jkTablesTabs: QtWidgets.QTabWidget
    jkTruthTable: QtWidgets.QTableWidget
    counterTruthTable: QtWidgets.QTableWidget

    def __init__(self, parent=None):
        super().__init__(parent)
        ui_path = Path(__file__).resolve().parents[1] / "ui" / "jk_counter_page.ui"
        load_ui = getattr(uic, "loadUi", None)
        if load_ui is None:
            raise RuntimeError("PyQt6 não disponibiliza uic.loadUi.")
        load_ui(str(ui_path), self)
        self.scene = QtWidgets.QGraphicsScene(0, 0, 1000, 430, self)
        self.scene.setBackgroundBrush(QtGui.QBrush(QtGui.QColor("#111618")))
        self.flipFlopView.setScene(self.scene)

        self.counter = JKCounterModel()
        self.highlighted_bits: set[int] = set()
        self.btnClock.clicked.connect(self.clock_counter)
        self.btnReset.clicked.connect(self.reset_counter)
        self.comboBits.currentIndexChanged.connect(self.configure_counter)
        self.comboDirection.currentIndexChanged.connect(self.configure_counter)
        self.jkTruthTable.setHorizontalHeaderLabels(["J", "K", "Q(t)", "Q(t+1)"])
        self.counterTruthTable.setHorizontalHeaderLabels(
            ["Q(t)", "J por FF", "K por FF", "Q(t+1)", "Decimal"]
        )
        self._populate_jk_truth_table()
        self.draw_counter()
        self._update_logic_views()

    def set_status(self, message: str):
        self.statusChanged.emit(message)

    def configure_counter(self, _index=None):
        del _index
        bit_count = 3 if self.comboBits.currentIndex() == 0 else 4
        direction = "UP" if self.comboDirection.currentIndex() == 0 else "DOWN"
        self.counter = JKCounterModel(bit_count=bit_count, direction=direction)
        self.highlighted_bits.clear()
        self.draw_counter()
        self._update_logic_views()
        self.set_status(f"Contador JK de {bit_count} bits, direção {direction.lower()}.")

    def draw_counter(self):
        self.scene.clear()
        bit_count = self.counter.bit_count
        box_width, box_height, gap = 170, 190, 36
        total_width = bit_count * box_width + (bit_count - 1) * gap
        start_x = max(24, (1000 - total_width) / 2)
        top = 72

        for column in range(bit_count):
            bit_index = bit_count - column - 1
            x = start_x + column * (box_width + gap)
            q = (self.counter.state >> bit_index) & 1
            active = bit_index in self.highlighted_bits
            border = QtGui.QColor("#f9e2af" if active else "#89b4fa")
            fill = QtGui.QColor("#24483d" if q else "#20252a")
            self.scene.addRect(
                QtCore.QRectF(x, top, box_width, box_height),
                QtGui.QPen(border, 3 if active else 2),
                QtGui.QBrush(fill),
            )
            self._add_text(x + 14, top + 12, f"FF JK — Q{bit_index}", 13, True)

            if bit_index == 0:
                equation = "J0 = K0 = 1"
            elif self.counter.direction == "UP":
                equation = "J = K = " + " · ".join(f"Q{i}" for i in range(bit_index))
            else:
                equation = "J = K = " + " · ".join(f"¬Q{i}" for i in range(bit_index))
            self._add_text(x + 14, top + 48, equation, 11)
            self._add_text(
                x + 14,
                top + 82,
                f"J{bit_index} = K{bit_index} = {self.counter.flip_flops[bit_index].j}",
                11,
            )
            self._add_text(x + 14, top + 112, f"Q{bit_index} = {q}", 16, True)
            self._add_text(x + 14, top + 148, f"Q̅{bit_index} = {1 - q}", 14)

        bus_y = top + box_height + 58
        for column in range(bit_count):
            center_x = start_x + column * (box_width + gap) + box_width / 2
            self.scene.addLine(
                center_x,
                top + box_height,
                center_x,
                bus_y,
                QtGui.QPen(QtGui.QColor("#f38ba8"), 2),
            )
        self.scene.addLine(
            start_x + 2,
            bus_y,
            start_x + total_width - 2,
            bus_y,
            QtGui.QPen(QtGui.QColor("#f38ba8"), 3),
        )
        self._add_text(start_x, bus_y + 5, "CLK — borda de subida", 11, True)
        direction_text = "Crescente" if self.counter.direction == "UP" else "Decrescente"
        self.lblState.setText(
            f"Q = {self.counter.bits}     decimal = {self.counter.state}     "
            f"módulo {1 << bit_count}     {direction_text}"
        )
        self.flipFlopView.setSceneRect(0, 0, 1000, bus_y + 48)

    def _add_text(self, x, y, text, size=11, bold=False):
        item = self.scene.addText(text)
        assert item is not None
        font = QtGui.QFont("Consolas", size)
        font.setBold(bold)
        item.setFont(font)
        item.setDefaultTextColor(QtGui.QColor("#e0e0e0"))
        item.setPos(x, y)

    def _populate_jk_truth_table(self):
        rows = jk_truth_table_rows()
        self.jkTruthTable.setRowCount(len(rows))
        for row_index, row in enumerate(rows):
            for column_index, value in enumerate(row):
                item = QtWidgets.QTableWidgetItem(str(value))
                item.setTextAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
                self.jkTruthTable.setItem(row_index, column_index, item)
        self._format_table(self.jkTruthTable)

    def _update_logic_views(self):
        equations = jk_counter_equations(
            self.counter.bit_count,
            self.counter.direction,
        )
        self.lblEquations.setText("\n".join(equations))
        transition_rows = []
        modulus = 1 << self.counter.bit_count
        step = 1 if self.counter.direction == "UP" else -1
        for state in range(modulus):
            counter = JKCounterModel(
                bit_count=self.counter.bit_count,
                direction=self.counter.direction,
                state=state,
            )
            next_state = (state + step) % modulus
            j_values = "".join(str(ff.j) for ff in reversed(counter.flip_flops))
            k_values = "".join(str(ff.k) for ff in reversed(counter.flip_flops))
            transition_rows.append(
                (
                    counter.bits,
                    j_values,
                    k_values,
                    format(next_state, f"0{self.counter.bit_count}b"),
                    str(next_state),
                )
            )
        self.counterTruthTable.setRowCount(len(transition_rows))
        for row_index, row in enumerate(transition_rows):
            for column_index, value in enumerate(row):
                item = QtWidgets.QTableWidgetItem(value)
                item.setTextAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
                self.counterTruthTable.setItem(row_index, column_index, item)
        self._format_table(self.counterTruthTable)

    @staticmethod
    def _format_table(table: QtWidgets.QTableWidget):
        table.horizontalHeader().setSectionResizeMode(
            QtWidgets.QHeaderView.ResizeMode.Stretch
        )
        table.verticalHeader().setVisible(False)

    def clock_counter(self):
        previous_state = self.counter.state
        self.counter.clock()
        changed = previous_state ^ self.counter.state
        self.highlighted_bits = {
            index for index in range(self.counter.bit_count) if changed & (1 << index)
        }
        self.draw_counter()
        self.set_status(f"Clock: Q = {self.counter.bits} (decimal {self.counter.state}).")
        QtCore.QTimer.singleShot(450, self.clear_highlight)

    def clear_highlight(self):
        if self.highlighted_bits:
            self.highlighted_bits.clear()
            self.draw_counter()

    def reset_counter(self):
        self.counter.reset()
        self.highlighted_bits.clear()
        self.draw_counter()
        self.set_status("Reset assíncrono aplicado: Q = 0.")
