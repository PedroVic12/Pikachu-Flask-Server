import math

from PyQt6 import QtCore, QtGui, QtSvgWidgets, QtWidgets

from pages.sequential_logic import SequentialTruthRow
from simulando_circuitos_digitais_3bits import JKCounterModel


class SvgGallery(QtWidgets.QScrollArea):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWidgetResizable(True)
        self.content = QtWidgets.QWidget()
        self.grid = QtWidgets.QGridLayout(self.content)
        self.grid.setColumnStretch(0, 1)
        self.grid.setColumnStretch(1, 1)
        self.setWidget(self.content)

    def show_diagrams(
        self,
        diagrams: list[tuple[str, bytes]],
        full_width: set[int] | None = None,
    ):
        self._clear()
        full_width = full_width or set()
        for index, (title, svg) in enumerate(diagrams):
            card = QtWidgets.QFrame()
            card.setFrameShape(QtWidgets.QFrame.Shape.StyledPanel)
            layout = QtWidgets.QVBoxLayout(card)
            heading = QtWidgets.QLabel(title)
            heading.setWordWrap(True)
            heading.setStyleSheet("font-weight: 600; color: #c9d8ed;")
            image = QtSvgWidgets.QSvgWidget(card)
            image.load(svg)
            image.setMinimumHeight(130)
            image.setSizePolicy(
                QtWidgets.QSizePolicy.Policy.Expanding,
                QtWidgets.QSizePolicy.Policy.Expanding,
            )
            layout.addWidget(heading)
            layout.addWidget(image, 1)
            if index in full_width:
                self.grid.addWidget(card, index, 0, 1, 2)
            else:
                self.grid.addWidget(card, index // 2, index % 2)

    def _clear(self):
        while self.grid.count():
            item = self.grid.takeAt(0)
            widget = item.widget()
            if widget is not None:
                widget.deleteLater()


def draw_counter_diagram(
    view: QtWidgets.QGraphicsView,
    scene: QtWidgets.QGraphicsScene,
    counter: JKCounterModel,
    expressions: dict[str, str],
    highlighted_bits: set[int],
):
    scene.clear()
    bit_count = counter.bit_count
    box_width, box_height, gap = 152, 174, 28
    total_width = bit_count * box_width + (bit_count - 1) * gap
    start_x = max(24, (900 - total_width) / 2)
    top = 40

    for column in range(bit_count):
        bit = bit_count - column - 1
        x = start_x + column * (box_width + gap)
        flip_flop = counter.flip_flops[bit]
        active = bit in highlighted_bits
        scene.addRect(
            QtCore.QRectF(x, top, box_width, box_height),
            QtGui.QPen(QtGui.QColor("#f9e2af" if active else "#89b4fa"), 3 if active else 2),
            QtGui.QBrush(QtGui.QColor("#24483d" if flip_flop.q else "#20252a")),
        )
        _add_text(scene, x + 12, top + 12, f"FF JK — Q{bit}", 13, True)
        _add_text(scene, x + 12, top + 48, f"J{bit} = {expressions[f'J{bit}']}", 11)
        _add_text(scene, x + 12, top + 72, f"K{bit} = {expressions[f'K{bit}']}", 11)
        _add_text(scene, x + 12, top + 108, f"J/K atuais: {flip_flop.j}/{flip_flop.k}", 11)
        _add_text(scene, x + 12, top + 140, f"Q={flip_flop.q}   Q̅={flip_flop.q_bar}", 13, True)

    clock_y = top + box_height + 48
    for column in range(bit_count):
        center_x = start_x + column * (box_width + gap) + box_width / 2
        scene.addLine(
            center_x,
            top + box_height,
            center_x,
            clock_y,
            QtGui.QPen(QtGui.QColor("#f38ba8"), 2),
        )
    scene.addLine(
        start_x,
        clock_y,
        start_x + total_width,
        clock_y,
        QtGui.QPen(QtGui.QColor("#f38ba8"), 3),
    )
    _add_text(scene, start_x, clock_y + 6, "CLK comum · borda de subida", 11, True)
    scene.setSceneRect(0, 0, max(900, total_width + 48), clock_y + 42)
    view.fitInView(scene.sceneRect(), QtCore.Qt.AspectRatioMode.KeepAspectRatio)


def _add_text(
    scene: QtWidgets.QGraphicsScene,
    x: float,
    y: float,
    text: str,
    size: int = 11,
    bold: bool = False,
):
    item = scene.addText(text)
    font = QtGui.QFont("Consolas", size)
    font.setBold(bold)
    item.setFont(font)
    item.setDefaultTextColor(QtGui.QColor("#e0e0e0"))
    item.setPos(x, y)


def draw_state_diagram(
    view: QtWidgets.QGraphicsView,
    scene: QtWidgets.QGraphicsScene,
    rows: list[SequentialTruthRow],
    current_state: int,
):
    scene.clear()
    bit_count = len(rows[0].current_bits)
    state_count = len(rows)
    center = QtCore.QPointF(420, 310)
    radius = 240 if bit_count == 4 else 200
    node_radius = 28
    positions = {
        state: QtCore.QPointF(
            center.x() + radius * math.cos(-math.pi / 2 + 2 * math.pi * state / state_count),
            center.y() + radius * math.sin(-math.pi / 2 + 2 * math.pi * state / state_count),
        )
        for state in range(state_count)
    }
    pen = QtGui.QPen(QtGui.QColor("#89b4fa"), 1.8)
    for row in rows:
        start, end = positions[row.state], positions[row.next_state]
        if row.state == row.next_state:
            scene.addEllipse(start.x() - 13, start.y() - 56, 26, 26, pen)
            _add_text(scene, start.x() - 8, start.y() - 57, "↺", 13)
            continue
        vector = end - start
        length = math.hypot(vector.x(), vector.y())
        unit = QtCore.QPointF(vector.x() / length, vector.y() / length)
        line_end = end - unit * (node_radius + 7)
        line_start = start + unit * node_radius
        scene.addLine(QtCore.QLineF(line_start, line_end), pen)
        angle = math.atan2(unit.y(), unit.x())
        tip = line_end
        arrow = [
            tip,
            tip - QtCore.QPointF(10 * math.cos(angle - math.pi / 6), 10 * math.sin(angle - math.pi / 6)),
            tip - QtCore.QPointF(10 * math.cos(angle + math.pi / 6), 10 * math.sin(angle + math.pi / 6)),
        ]
        scene.addPolygon(QtGui.QPolygonF(arrow), pen, QtGui.QBrush(QtGui.QColor("#89b4fa")))

    for state, position in positions.items():
        is_current = state == current_state
        scene.addEllipse(
            position.x() - node_radius,
            position.y() - node_radius,
            node_radius * 2,
            node_radius * 2,
            QtGui.QPen(QtGui.QColor("#f9e2af" if is_current else "#89b4fa"), 3 if is_current else 2),
            QtGui.QBrush(QtGui.QColor("#24483d" if is_current else "#20252a")),
        )
        _add_text(scene, position.x() - 18, position.y() - 11, format(state, f"0{bit_count}b"), 11, True)
    scene.setSceneRect(0, 0, 840, 620)
    view.fitInView(scene.sceneRect(), QtCore.Qt.AspectRatioMode.KeepAspectRatio)


class TimingDiagram(QtWidgets.QWidget):
    TRACE_COLORS = ("#79c0ff", "#a6e3a1", "#f9e2af", "#cba6f7")

    def __init__(self, bit_count: int, parent=None):
        super().__init__(parent)
        self.bit_count = bit_count
        self.states = [0]
        self.setMinimumSize(420, 150 + 42 * bit_count)
        self.setSizePolicy(
            QtWidgets.QSizePolicy.Policy.Expanding,
            QtWidgets.QSizePolicy.Policy.Expanding,
        )

    def set_states(self, states: list[int], bit_count: int):
        self.states = states[:]
        self.bit_count = bit_count
        self.setMinimumHeight(118 + 42 * bit_count)
        self.update()

    def paintEvent(self, event):
        del event
        painter = QtGui.QPainter(self)
        painter.setRenderHint(QtGui.QPainter.RenderHint.Antialiasing)
        painter.fillRect(self.rect(), QtGui.QColor("#111820"))
        states = self.states or [0]
        left, right = 54.0, max(60.0, float(self.width() - 18))
        top, row_height = 22.0, 42.0
        samples = len(states)
        step = (right - left) / max(samples, 1)
        painter.setPen(QtGui.QPen(QtGui.QColor("#415168"), 1))

        signals = [("CLK", None)] + [
            (f"Q{bit}", bit) for bit in reversed(range(self.bit_count))
        ]
        for index, (name, bit) in enumerate(signals):
            y = top + index * row_height
            painter.setPen(QtGui.QColor("#a9bad1"))
            painter.drawText(8, int(y + 5), name)
            painter.setPen(QtGui.QPen(QtGui.QColor("#34445c"), 1))
            painter.drawLine(QtCore.QPointF(left, y + 10), QtCore.QPointF(right, y + 10))
            color = self.TRACE_COLORS[index % len(self.TRACE_COLORS)]
            painter.setPen(QtGui.QPen(QtGui.QColor(color), 2))
            for sample in range(samples):
                x0 = left + sample * step
                x1 = x0 + step
                if bit is None:
                    high = (sample % 2) == 0
                    middle = y + (4 if high else 18)
                    other = y + (18 if high else 4)
                    painter.drawLine(QtCore.QPointF(x0, middle), QtCore.QPointF(x1, middle))
                    if sample + 1 < samples:
                        painter.drawLine(QtCore.QPointF(x1, middle), QtCore.QPointF(x1, other))
                else:
                    value = (states[sample] >> bit) & 1
                    level = y + (4 if value else 18)
                    painter.drawLine(QtCore.QPointF(x0, level), QtCore.QPointF(x1, level))
                    if sample + 1 < samples:
                        next_value = (states[sample + 1] >> bit) & 1
                        if next_value != value:
                            next_level = y + (4 if next_value else 18)
                            painter.drawLine(QtCore.QPointF(x1, level), QtCore.QPointF(x1, next_level))
        painter.setPen(QtGui.QColor("#8795a9"))
        tick_step = max(1, samples // 12)
        for sample in range(0, samples, tick_step):
            x = left + sample * step
            painter.drawText(QtCore.QPointF(x - 4, self.height() - 6), str(sample))
        painter.end()
