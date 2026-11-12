import io
import math
import sys
from typing import Any, Literal

import numpy as np
import schemdraw
import schemdraw.elements as elm
from pydantic import BaseModel, ConfigDict, Field, field_validator
from PyQt6 import QtCore, QtGui, QtWidgets, uic
from scipy.integrate import solve_ivp

# ==============================================================================
# 1. MODELOS Pydantic PARA SPICE / CIRCUITO
# ==============================================================================


class PySpiceComponentModel(BaseModel):
    """Representa um componente de netlist SPICE com validação via Pydantic."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(..., min_length=1)
    comp_type: Literal["V", "R", "C"]
    value: float = Field(..., gt=0)
    unit: str = "V"
    node1: int = 1
    node2: int = 0
    waveform: str = "PULSE(0 5 0 1u 1u 10m 20m)"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not value:
            raise ValueError("O nome do componente não pode ser vazio.")
        return value

    def as_spice_line(self) -> str:
        if self.comp_type == "V":
            return f"{self.name} {self.node1} {self.node2} {self.waveform}"
        return f"{self.name} {self.node1} {self.node2} {self.value}"


class PySpiceCircuitModel(BaseModel):
    """Agrupa componentes e exporta um netlist SPICE."""

    title: str = "Circuito RC gerado pela PyEDA Suite"
    components: list[PySpiceComponentModel] = Field(default_factory=list)
    transient: str = ".tran 0 50m 0 10u"

    def build_netlist(self) -> list[str]:
        lines = [
            "* Netlist gerado automaticamente pela PyEDA Suite",
            "* Compatível com LTspice / PSpice / Ngspice",
            f"* {self.title}",
        ]
        lines.extend(component.as_spice_line() for component in self.components)
        lines.append(self.transient)
        lines.append(".end")
        return lines


# ==============================================================================
# 2. DEFINIÇÃO DA INTERFACE XML (PAGE.UI EMBUTIDA NO CÓDIGO)
# ==============================================================================
PAGE_UI_XML = """<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>MainWindow</class>
 <widget class="QMainWindow" name="MainWindow">
  <property name="geometry">
   <rect><x>0</x><y>0</y><width>1280</width><height>800</height></rect>
  </property>
  <property name="windowTitle">
   <string>PyEDA Suite - Falstad + SciPy + SPICE + Schemdraw + Arduino</string>
  </property>
  <property name="styleSheet">
   <string notr="true">
    QMainWindow { background-color: #1e1e1e; color: #e0e0e0; }
    QDockWidget { color: #ffffff; font-weight: bold; }
    QPushButton { background-color: #2d2d30; color: #ffffff; border: 1px solid #3e3e42; padding: 6px; border-radius: 4px; }
    QPushButton:hover { background-color: #3e3e42; border-color: #007acc; }
    QLabel, QComboBox, QDoubleSpinBox { color: #e0e0e0; }
    QComboBox, QDoubleSpinBox, QTextEdit { background-color: #252526; border: 1px solid #3e3e42; padding: 4px; }
   </string>
  </property>
  <widget class="QWidget" name="centralwidget">
   <layout class="QVBoxLayout" name="verticalLayout">
    <item>
     <widget class="QSplitter" name="mainSplitter">
      <property name="orientation"><enum>Qt::Vertical</enum></property>
      <widget class="QGraphicsView" name="circuitView">
       <property name="renderHints"><set>QPainter::Antialiasing</set></property>
      </widget>
      <widget class="QWidget" name="oscilloscopeContainer" native="true">
       <property name="minimumSize"><size><width>0</width><height>230</height></size></property>
       <layout class="QVBoxLayout" name="scopeLayout"/>
      </widget>
     </widget>
    </item>
   </layout>
  </widget>
  <widget class="QDockWidget" name="dockPalette">
   <property name="windowTitle"><string>Componentes &amp; Ferramentas</string></property>
   <attribute name="dockWidgetArea"><number>1</number></attribute>
   <widget class="QWidget" name="dockWidgetContents">
    <layout class="QVBoxLayout" name="paletteLayout">
     <item><widget class="QLabel" name="lblAdd"><property name="text"><string>Adicionar ao Canvas:</string></property></widget></item>
     <item><widget class="QPushButton" name="btnAddSource"><property name="text"><string>+ Fonte / Pino Arduino</string></property></widget></item>
     <item><widget class="QPushButton" name="btnAddResistor"><property name="text"><string>+ Resistor (R)</string></property></widget></item>
     <item><widget class="QPushButton" name="btnAddCapacitor"><property name="text"><string>+ Capacitor (C)</string></property></widget></item>
     <item><widget class="QPushButton" name="btnClear"><property name="text"><string>Limpar Canvas</string></property></widget></item>
     <item><widget class="Line" name="line1"><property name="orientation"><enum>Qt::Horizontal</enum></property></widget></item>
     <item><widget class="QLabel" name="lblSim"><property name="text"><string>Simulação Transiente (SciPy):</string></property></widget></item>
     <item><widget class="QComboBox" name="comboWave">
      <item><property name="text"><string>Onda Quadrada (Arduino PWM)</string></property></item>
      <item><property name="text"><string>Onda Senoidal (AC)</string></property></item>
      <item><property name="text"><string>Degrau DC (5V)</string></property></item>
     </widget></item>
     <item><widget class="QLabel" name="lblFreq"><property name="text"><string>Frequência (Hz):</string></property></widget></item>
     <item><widget class="QDoubleSpinBox" name="spinFreq"><property name="minimum"><double>1.0</double></property><property name="maximum"><double>1000.0</double></property><property name="value"><double>50.0</double></property></widget></item>
     <item><widget class="QPushButton" name="btnRunSim"><property name="text"><string>▶ Simular Transiente</string></property></widget></item>
     <item><widget class="Line" name="line2"><property name="orientation"><enum>Qt::Horizontal</enum></property></widget></item>
     <item><widget class="QLabel" name="lblExp"><property name="text"><string>Exportação &amp; SPICE:</string></property></widget></item>
     <item><widget class="QPushButton" name="btnExportSchemdraw"><property name="text"><string>Gerar Schemdraw (.SVG)</string></property></widget></item>
     <item><widget class="QPushButton" name="btnGenSpice"><property name="text"><string>Gerar Netlist LTspice</string></property></widget></item>
     <item><widget class="QTextEdit" name="txtSpiceOutput"><property name="readOnly"><bool>true</bool></property><property name="placeholderText"><string>Netlist SPICE aparecerá aqui...</string></property></widget></item>
     <item><spacer name="verticalSpacer"><property name="orientation"><enum>Qt::Vertical</enum></property><property name="sizeHint" stdset="0"><size><width>20</width><height>40</height></size></property></spacer></item>
    </layout>
   </widget>
  </widget>
 </widget>
 <resources/>
 <connections/>
</ui>
"""


# ==============================================================================
# 3. MODELO LÓGICO E MOTOR TRANSIENTE (SCIPY + SCHEMDRAW + SPICE)
# ==============================================================================
class ComponentModel(BaseModel):
    """Modelo lógico de cada componente eletrônico com validação dos dados."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    comp_type: Literal["V", "R", "C"]
    name: str = Field(..., min_length=1)
    value: float = Field(..., gt=0)
    unit: str = "V"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not value:
            raise ValueError("O nome do componente não pode ser vazio.")
        return value


class TransientEngine:
    """Motor matemático baseado em SciPy para análise no domínio do tempo."""

    def __init__(self):
        self.t = np.linspace(0, 0.05, 1000)
        self.v_in = np.zeros_like(self.t)
        self.v_out = np.zeros_like(self.t)
        self.current = np.zeros_like(self.t)

    def get_input_voltage(self, t: float, wave_type: str, freq: float, amp: float = 5.0) -> float:
        if "Quadrada" in wave_type:
            return amp if math.sin(2 * math.pi * freq * t) >= 0 else 0.0
        if "Senoidal" in wave_type:
            return amp * math.sin(2 * math.pi * freq * t)
        return amp if t >= 0.002 else 0.0

    def solve_rc_transient(self, R: float, C: float, wave_type: str, freq: float):
        """Resolve a EDO do circuito RC: dVc/dt = (Vin(t) - Vc) / (R * C)"""
        R, C, freq = float(R), float(C), float(freq)
        if not all(math.isfinite(value) for value in (R, C, freq)):
            raise ValueError("R, C e frequência devem ser valores finitos.")
        if R <= 0 or C <= 0 or freq <= 0:
            raise ValueError("R, C e frequência devem ser maiores que zero.")
        R = max(R, 1.0)
        C = max(C, 1e-9)
        tau = R * C
        t_span = (0.0, 3.0 / freq)
        t_eval = np.linspace(t_span[0], t_span[1], 600)

        def ode_system(_t, y):
            vin = self.get_input_voltage(_t, wave_type, freq)
            dvdt = (vin - y[0]) / tau
            return [dvdt]

        sol = solve_ivp(ode_system, t_span, [0.0], t_eval=t_eval, method="RK45")
        if not sol.success or sol.y.shape[1] != len(t_eval):
            raise RuntimeError(f"Falha na simulação transiente: {sol.message}")
        self.t = sol.t
        self.v_in = np.array([self.get_input_voltage(ti, wave_type, freq) for ti in self.t])
        self.v_out = sol.y[0]
        self.current = (self.v_in - self.v_out) / R
        return self.t, self.v_in, self.v_out, self.current


# ==============================================================================
# 4. COMPONENTES VISUAIS INTERATIVOS (CANVAS ESTILO FALSTAD)
# ==============================================================================
class ElectronicGraphicsItem(QtWidgets.QGraphicsItem):
    """Componente arrastável no QGraphicsScene com terminais clicáveis."""

    GRID_SIZE = 20

    def __init__(self, model: ComponentModel, x: float, y: float, on_terminal_click):
        super().__init__()
        self.model = model
        self.on_terminal_click = on_terminal_click
        self.setPos(x, y)
        self.setFlags(
            QtWidgets.QGraphicsItem.GraphicsItemFlag.ItemIsMovable
            | QtWidgets.QGraphicsItem.GraphicsItemFlag.ItemIsSelectable
            | QtWidgets.QGraphicsItem.GraphicsItemFlag.ItemSendsGeometryChanges
        )
        self.term1_offset = QtCore.QPointF(-40, 0)
        self.term2_offset = QtCore.QPointF(40, 0)

    def boundingRect(self) -> QtCore.QRectF:
        return QtCore.QRectF(-50, -30, 100, 60)

    def itemChange(self, change, value):
        if change == QtWidgets.QGraphicsItem.GraphicsItemChange.ItemPositionChange:
            x = round(value.x() / self.GRID_SIZE) * self.GRID_SIZE
            y = round(value.y() / self.GRID_SIZE) * self.GRID_SIZE
            return QtCore.QPointF(x, y)
        return super().itemChange(change, value)

    def get_terminal_scene_pos(self, index: int) -> QtCore.QPointF:
        return self.mapToScene(self.term1_offset if index == 1 else self.term2_offset)

    def mousePressEvent(self, event):
        pos = event.pos()
        if (pos - self.term1_offset).manhattanLength() < 12:
            self.on_terminal_click(self, 1)
            return
        if (pos - self.term2_offset).manhattanLength() < 12:
            self.on_terminal_click(self, 2)
            return
        super().mousePressEvent(event)

    def mouseDoubleClickEvent(self, event):
        val, ok = QtWidgets.QInputDialog.getDouble(
            None,
            f"Editar {self.model.name}",
            f"Valor ({self.model.unit}):",
            float(self.model.value),
            0.000001,
            1e9,
            6,
        )
        if ok:
            self.model.value = val
            self.update()

    def paint(self, painter: QtGui.QPainter, option, widget=None):
        pen_color = QtGui.QColor("#00aaff") if self.isSelected() else QtGui.QColor("#00ff88")
        painter.setPen(QtGui.QPen(pen_color, 2))

        painter.drawLine(-40, 0, -20, 0)
        painter.drawLine(20, 0, 40, 0)

        if self.model.comp_type == "R":
            pts = [
                QtCore.QPointF(-20, 0),
                QtCore.QPointF(-15, -10),
                QtCore.QPointF(-5, 10),
                QtCore.QPointF(5, -10),
                QtCore.QPointF(15, 10),
                QtCore.QPointF(20, 0),
            ]
            painter.drawPolyline(QtGui.QPolygonF(pts))
        elif self.model.comp_type == "C":
            painter.drawLine(-5, -15, -5, 15)
            painter.drawLine(5, -15, 5, 15)
            painter.drawLine(-20, 0, -5, 0)
            painter.drawLine(5, 0, 20, 0)
        elif self.model.comp_type == "V":
            painter.drawEllipse(-18, -18, 36, 36)
            painter.drawText(QtCore.QRectF(-18, -18, 36, 36), QtCore.Qt.AlignmentFlag.AlignCenter, "PWM")

        painter.setBrush(QtGui.QBrush(QtGui.QColor("#ff4444")))
        painter.setPen(QtCore.Qt.PenStyle.NoPen)
        painter.drawEllipse(self.term1_offset, 4, 4)
        painter.drawEllipse(self.term2_offset, 4, 4)

        painter.setPen(QtGui.QColor("#ffffff"))
        painter.setFont(QtGui.QFont("Consolas", 8))
        label = f"{self.model.name}: {self.model.value:g}{self.model.unit}"
        painter.drawText(QtCore.QRectF(-50, -28, 100, 15), QtCore.Qt.AlignmentFlag.AlignCenter, label)


class AnimatedWireItem(QtWidgets.QGraphicsLineItem):
    """Fio conector com animação de partículas de corrente estilo Falstad."""

    def __init__(self, item1, term1, item2, term2):
        super().__init__()
        self.item1, self.term1 = item1, term1
        self.item2, self.term2 = item2, term2
        self.phase = 0.0
        self.setPen(QtGui.QPen(QtGui.QColor("#888888"), 2))
        self.update_positions()

    def update_positions(self):
        p1 = self.item1.get_terminal_scene_pos(self.term1)
        p2 = self.item2.get_terminal_scene_pos(self.term2)
        self.setLine(QtCore.QLineF(p1, p2))

    def advance_animation(self, current_val: float):
        self.update_positions()
        self.phase = (self.phase + current_val * 15.0) % 1.0
        self.update()

    def paint(self, painter: QtGui.QPainter, option, widget=None):
        super().paint(painter, option, widget)
        line = self.line()
        if line.length() == 0:
            return

        painter.setBrush(QtGui.QBrush(QtGui.QColor("#ffdd00")))
        painter.setPen(QtCore.Qt.PenStyle.NoPen)
        num_dots = max(1, int(line.length() // 25))
        for i in range(num_dots):
            t = (i / num_dots + self.phase) % 1.0
            pt = line.pointAt(t)
            painter.drawEllipse(pt, 3.0, 3.0)


# ==============================================================================
# 5. WIDGET DE OSCILOSCÓPIO NATIVO (ALTA PERFORMANCE)
# ==============================================================================
class OscilloscopeWidget(QtWidgets.QWidget):
    """Osciloscópio digital para visualizar formas de onda do SciPy."""

    def __init__(self):
        super().__init__()
        self.t = np.array([])
        self.v_in = np.array([])
        self.v_out = np.array([])
        self.cursor_idx = 0

    def set_data(self, t, v_in, v_out):
        self.t = np.asarray(t, dtype=float)
        self.v_in = np.asarray(v_in, dtype=float)
        self.v_out = np.asarray(v_out, dtype=float)
        if not (len(self.t) == len(self.v_in) == len(self.v_out)):
            self.t = self.v_in = self.v_out = np.array([])
        self.cursor_idx = 0
        self.update()

    def step_cursor(self):
        if len(self.t) > 0:
            self.cursor_idx = (self.cursor_idx + 2) % len(self.t)
            self.update()

    def paintEvent(self, event):
        painter = QtGui.QPainter(self)
        painter.setRenderHint(QtGui.QPainter.RenderHint.Antialiasing)
        w, h = max(self.width(), 1), max(self.height(), 1)

        painter.fillRect(0, 0, w, h, QtGui.QColor("#111618"))
        painter.setPen(QtGui.QPen(QtGui.QColor("#223035"), 1))
        for x in range(0, w, 40):
            painter.drawLine(x, 0, x, h)
        for y in range(0, h, 30):
            painter.drawLine(0, y, w, y)

        if len(self.t) < 2:
            painter.setPen(QtGui.QColor("#888888"))
            painter.drawText(20, 30, "Osciloscópio aguardando simulação...")
            return

        v_max = max(np.max(np.abs(self.v_in)), 5.5)
        mid_y = h / 2.0
        scale_y = (h * 0.4) / v_max

        def draw_trace(data, color_hex):
            painter.setPen(QtGui.QPen(QtGui.QColor(color_hex), 2))
            path = QtGui.QPainterPath()
            for i, val in enumerate(data):
                px = (i / (len(data) - 1)) * w
                py = mid_y - (val * scale_y)
                if i == 0:
                    path.moveTo(px, py)
                else:
                    path.lineTo(px, py)
            painter.drawPath(path)

        draw_trace(self.v_in, "#00e5ff")
        draw_trace(self.v_out, "#ffaa00")

        self.cursor_idx = min(max(self.cursor_idx, 0), len(self.t) - 1)
        cx = (self.cursor_idx / (len(self.t) - 1)) * w
        painter.setPen(QtGui.QPen(QtGui.QColor("#ff3366"), 1, QtCore.Qt.PenStyle.DashLine))
        painter.drawLine(int(cx), 0, int(cx), h)

        painter.setFont(QtGui.QFont("Consolas", 9))
        painter.setPen(QtGui.QColor("#00e5ff"))
        painter.drawText(15, 20, f"CH1 (Arduino/Vin): {self.v_in[self.cursor_idx]:.2f} V")
        painter.setPen(QtGui.QColor("#ffaa00"))
        painter.drawText(220, 20, f"CH2 (Saída Vout): {self.v_out[self.cursor_idx]:.2f} V")


# ==============================================================================
# 6. JANELA PRINCIPAL (INTEGRAÇÃO DE TODOS OS MÓDULOS)
# ==============================================================================
class MainApp(QtWidgets.QMainWindow):
    circuitView: QtWidgets.QGraphicsView

    def __init__(self):
        super().__init__()
        ui_stream = io.StringIO(PAGE_UI_XML)
        uic.loadUi(ui_stream, self)

        self.scene = QtWidgets.QGraphicsScene(0, 0, 1000, 600)
        self.scene.setBackgroundBrush(QtGui.QBrush(QtGui.QColor("#181818")))
        self.circuitView.setScene(self.scene)
        self.draw_grid()

        self.scope = OscilloscopeWidget()
        self.scopeLayout.addWidget(self.scope)

        self.engine = TransientEngine()
        self.components = []
        self.wires = []
        self.pending_terminal = None
        self.comp_counter = {"V": 1, "R": 1, "C": 1}

        self.anim_timer = QtCore.QTimer(self)
        self.anim_timer.timeout.connect(self.on_animation_tick)
        self.anim_timer.start(33)

        self.btnAddSource.clicked.connect(lambda: self.add_component("V", 5.0, "V"))
        self.btnAddResistor.clicked.connect(lambda: self.add_component("R", 1000.0, "Ω"))
        self.btnAddCapacitor.clicked.connect(lambda: self.add_component("C", 0.00001, "F"))
        self.btnClear.clicked.connect(self.clear_canvas)
        self.btnRunSim.clicked.connect(self.run_simulation)
        self.btnExportSchemdraw.clicked.connect(self.export_schemdraw)
        self.btnGenSpice.clicked.connect(self.generate_spice_netlist)

        self.load_default_circuit()

    def draw_grid(self):
        pen = QtGui.QPen(QtGui.QColor("#252525"), 1)
        for x in range(0, 1000, 20):
            self.scene.addLine(x, 0, x, 600, pen)
        for y in range(0, 600, 20):
            self.scene.addLine(0, y, 1000, y, pen)

    def add_component(self, comp_type: str, default_val: float, unit: str, x=200, y=200):
        idx = self.comp_counter[comp_type]
        self.comp_counter[comp_type] += 1
        model = ComponentModel(comp_type=comp_type, name=f"{comp_type}{idx}", value=default_val, unit=unit)
        item = ElectronicGraphicsItem(model, x, y, self.handle_terminal_click)
        self.scene.addItem(item)
        self.components.append(item)
        return item

    def handle_terminal_click(self, item: ElectronicGraphicsItem, term_idx: int):
        if self.pending_terminal is None:
            self.pending_terminal = (item, term_idx)
            self.statusBar().showMessage("Clique em outro terminal para conectar o fio...")
            return

        item1, term1 = self.pending_terminal
        if item1 != item:
            wire = AnimatedWireItem(item1, term1, item, term_idx)
            self.scene.addItem(wire)
            self.wires.append(wire)
        self.pending_terminal = None
        self.statusBar().clearMessage()

    def load_default_circuit(self):
        v1 = self.add_component("V", 5.0, "V", 160, 200)
        r1 = self.add_component("R", 1000.0, "Ω", 320, 200)
        c1 = self.add_component("C", 0.00001, "F", 480, 200)

        w1 = AnimatedWireItem(v1, 2, r1, 1)
        w2 = AnimatedWireItem(r1, 2, c1, 1)
        self.scene.addItem(w1)
        self.scene.addItem(w2)
        self.wires.extend([w1, w2])
        self.run_simulation()

    def clear_canvas(self):
        self.scene.clear()
        self.draw_grid()
        self.components.clear()
        self.wires.clear()
        self.pending_terminal = None
        self.comp_counter = {"V": 1, "R": 1, "C": 1}

    def run_simulation(self):
        r_val = next((float(c.model.value) for c in self.components if c.model.comp_type == "R"), 1000.0)
        c_val = next((float(c.model.value) for c in self.components if c.model.comp_type == "C"), 1e-5)
        wave = self.comboWave.currentText()
        freq = self.spinFreq.value()
        try:
            t, vin, vout, _ = self.engine.solve_rc_transient(r_val, c_val, wave, freq)
        except (ValueError, RuntimeError) as exc:
            QtWidgets.QMessageBox.warning(self, "Erro de simulação", str(exc))
            return
        self.scope.set_data(t, vin, vout)
        self.statusBar().showMessage(f"Simulação SciPy concluída: R={r_val}Ω, C={c_val}F, Freq={freq}Hz")

    def on_animation_tick(self):
        if len(self.engine.current) == 0:
            return
        idx = self.scope.cursor_idx
        current_now = self.engine.current[idx]
        for wire in self.wires:
            wire.advance_animation(current_now)
        self.scope.step_cursor()

    def generate_spice_netlist(self):
        components = []
        node = 1
        for c in self.components:
            model = c.model
            if model.comp_type == "V":
                components.append(
                    PySpiceComponentModel(
                        name=model.name,
                        comp_type="V",
                        value=float(model.value),
                        unit=model.unit,
                        node1=node,
                        node2=0,
                        waveform="PULSE(0 5 0 1u 1u 10m 20m)",
                    )
                )
            elif model.comp_type == "R":
                components.append(
                    PySpiceComponentModel(
                        name=model.name,
                        comp_type="R",
                        value=float(model.value),
                        unit=model.unit,
                        node1=node,
                        node2=node + 1,
                    )
                )
                node += 1
            elif model.comp_type == "C":
                components.append(
                    PySpiceComponentModel(
                        name=model.name,
                        comp_type="C",
                        value=float(model.value),
                        unit=model.unit,
                        node1=node,
                        node2=0,
                    )
                )

        circuit = PySpiceCircuitModel(
            title="Circuito gerado pela PyEDA Suite",
            components=components,
        )
        self.txtSpiceOutput.setPlainText("\n".join(circuit.build_netlist()))

    def export_schemdraw(self):
        filename = "esquematico_exportado.svg"
        with schemdraw.Drawing(file=filename, show=False) as d:
            for c in self.components:
                m = c.model
                if m.comp_type == "V":
                    d += elm.SourcePulse().up().label(f"{m.name}\n{m.value}V")
                elif m.comp_type == "R":
                    d += elm.Resistor().right().label(f"{m.name}\n{m.value}Ω")
                elif m.comp_type == "C":
                    d += elm.Capacitor().down().label(f"{m.name}\n{m.value}F")
            d += elm.Ground()
        QtWidgets.QMessageBox.information(self, "Schemdraw", f"Esquemático vetorial salvo em:\n{filename}")


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    window = MainApp()
    window.show()
    sys.exit(app.exec())
