import io
import json
import math
import re
import sys
from typing import Literal, Sequence

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

    name: str = Field(..., min_length=1, pattern=r"^[A-Za-z][A-Za-z0-9_]*$")
    comp_type: Literal["V", "R", "L", "C"]
    value: float = Field(..., gt=0, allow_inf_nan=False)
    unit: str = "V"
    node1: int = 1
    node2: int = 0
    waveform: str = "PULSE(0 5 0 1u 1u 10m 20m)"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", value):
            raise ValueError("O nome SPICE deve começar por letra e conter apenas letras, números ou underscore.")
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


class CircuitProjectComponent(BaseModel):
    name: str = Field(..., min_length=1, pattern=r"^[A-Za-z][A-Za-z0-9_]*$")
    comp_type: Literal["V", "R", "L", "C"]
    value: float = Field(..., gt=0, allow_inf_nan=False)
    unit: str
    x: float = Field(allow_inf_nan=False)
    y: float = Field(allow_inf_nan=False)
    rotation: int = Field(default=0, ge=0, lt=360)


class CircuitProjectWire(BaseModel):
    start_component: int = Field(..., ge=0)
    start_terminal: Literal[1, 2]
    end_component: int = Field(..., ge=0)
    end_terminal: Literal[1, 2]


class CircuitProjectModel(BaseModel):
    version: Literal[1] = 1
    circuit_type: Literal["RC", "RL", "RLC"] = "RC"
    components: list[CircuitProjectComponent]
    wires: list[CircuitProjectWire] = Field(default_factory=list)

    @field_validator("wires")
    @classmethod
    def validate_wire_references(cls, wires, info):
        components = info.data.get("components", [])
        for wire in wires:
            if wire.start_component >= len(components) or wire.end_component >= len(components):
                raise ValueError("A conexão referencia um componente inexistente.")
        return wires


class JKFlipFlopState(BaseModel):
    j: int = Field(default=0, ge=0, le=1)
    k: int = Field(default=0, ge=0, le=1)
    q: int = Field(default=0, ge=0, le=1)
    q_bar: int = Field(default=1, ge=0, le=1)


class JKCounterModel(BaseModel):
    bit_count: Literal[3, 4] = 3
    direction: Literal["UP", "DOWN"] = "UP"
    state: int = Field(default=0, ge=0)
    flip_flops: list[JKFlipFlopState] = Field(default_factory=list)

    def model_post_init(self, __context):
        del __context
        if self.state >= (1 << self.bit_count):
            raise ValueError("O estado inicial excede a quantidade de bits do contador.")
        self._sync_flip_flops()

    @property
    def bits(self) -> str:
        return format(self.state, f"0{self.bit_count}b")

    def _sync_flip_flops(self):
        flip_flops = []
        for index in range(self.bit_count):
            lower_mask = (1 << index) - 1
            lower_bits = self.state & lower_mask
            should_toggle = index == 0 or (
                lower_bits == lower_mask if self.direction == "UP" else lower_bits == 0
            )
            q = (self.state >> index) & 1
            flip_flops.append(
                JKFlipFlopState(j=int(should_toggle), k=int(should_toggle), q=q, q_bar=1 - q)
            )
        self.flip_flops = flip_flops

    def reset(self):
        self.state = 0
        self._sync_flip_flops()

    def clock(self) -> str:
        next_state = self.state
        for index, flip_flop in enumerate(self.flip_flops):
            lower_mask = (1 << index) - 1
            lower_bits = self.state & lower_mask
            should_toggle = index == 0 or (
                lower_bits == lower_mask if self.direction == "UP" else lower_bits == 0
            )
            flip_flop.j = flip_flop.k = int(should_toggle)
            if should_toggle:
                next_state ^= 1 << index
        self.state = next_state
        self._sync_flip_flops()
        return self.bits


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
     <item><widget class="QPushButton" name="btnAddInductor"><property name="text"><string>+ Indutor (L)</string></property></widget></item>
     <item><widget class="QPushButton" name="btnRotate"><property name="text"><string>Girar selecionado (R)</string></property></widget></item>
     <item><widget class="QLabel" name="lblCircuitType"><property name="text"><string>Topologia do circuito:</string></property></widget></item>
     <item><widget class="QComboBox" name="comboCircuitType">
      <item><property name="text"><string>RC</string></property></item>
      <item><property name="text"><string>RL</string></property></item>
      <item><property name="text"><string>RLC</string></property></item>
     </widget></item>
     <item><widget class="QPushButton" name="btnLoadPreset"><property name="text"><string>Montar circuito padrão</string></property></widget></item>
     <item><widget class="QPushButton" name="btnClear"><property name="text"><string>Limpar Canvas</string></property></widget></item>
     <item><widget class="Line" name="lineDigital"><property name="orientation"><enum>Qt::Horizontal</enum></property></widget></item>
     <item><widget class="QLabel" name="lblJKCounter"><property name="text"><string>Contador síncrono com FF JK:</string></property></widget></item>
     <item><widget class="QComboBox" name="comboCounterBits">
      <item><property name="text"><string>3 bits (módulo 8)</string></property></item>
      <item><property name="text"><string>4 bits (módulo 16)</string></property></item>
     </widget></item>
     <item><widget class="QComboBox" name="comboCounterDirection">
      <item><property name="text"><string>Crescente</string></property></item>
      <item><property name="text"><string>Decrescente</string></property></item>
     </widget></item>
     <item><widget class="QPushButton" name="btnClock"><property name="text"><string>Pulso de clock (Espaço)</string></property></widget></item>
     <item><widget class="QPushButton" name="btnResetCounter"><property name="text"><string>Reset contador</string></property></widget></item>
     <item><widget class="QLabel" name="lblCounterState"><property name="text"><string>Q = 000</string></property></widget></item>
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

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid", validate_assignment=True)

    comp_type: Literal["V", "R", "L", "C"]
    name: str = Field(..., min_length=1, pattern=r"^[A-Za-z][A-Za-z0-9_]*$")
    value: float = Field(..., gt=0, allow_inf_nan=False)
    unit: str = "V"
    x: float = Field(default=200, allow_inf_nan=False)
    y: float = Field(default=200, allow_inf_nan=False)
    rotation: int = Field(default=0, ge=0, lt=360)

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
        self.circuit_type = "RC"

    def get_input_voltage(self, t: float, wave_type: str, freq: float, amp: float = 5.0) -> float:
        if "Chave manual" in wave_type:
            return amp
        if "Quadrada" in wave_type:
            return amp if math.sin(2 * math.pi * freq * t) >= 0 else 0.0
        if "Senoidal" in wave_type:
            return amp * math.sin(2 * math.pi * freq * t)
        return amp if t >= 0.002 else 0.0

    def solve_circuit_transient(
        self,
        circuit_type: Literal["RC", "RL", "RLC"],
        R: float,
        L: float,
        C: float,
        wave_type: str,
        freq: float,
        amp: float = 5.0,
        initial_state: Sequence[float] | None = None,
        duration: float | None = None,
    ):
        """Resolve a resposta de uma malha RLC série com corrente convencional."""
        R, L, C, freq, amp = float(R), float(L), float(C), float(freq), float(amp)
        values = (R, L, C, freq, amp)
        if not all(math.isfinite(value) for value in values):
            raise ValueError("R, L, C e frequência devem ser valores finitos.")
        if R <= 0 or freq <= 0:
            raise ValueError("R e frequência devem ser maiores que zero.")
        if circuit_type in ("RC", "RLC") and C <= 0:
            raise ValueError("A capacitância deve ser maior que zero.")
        if circuit_type in ("RL", "RLC") and L <= 0:
            raise ValueError("A indutância deve ser maior que zero.")
        if circuit_type not in ("RC", "RL", "RLC"):
            raise ValueError(f"Topologia não suportada: {circuit_type}")
        if duration is not None and (not math.isfinite(duration) or duration <= 0):
            raise ValueError("A duração da simulação deve ser positiva e finita.")

        self.circuit_type = circuit_type
        t_span = (0.0, duration if duration is not None else 3.0 / freq)
        t_eval = np.linspace(t_span[0], t_span[1], 600)
        max_step = min(1.0 / (freq * 100.0), t_span[1] / 300.0)

        def ode_system(_t, y):
            vin = self.get_input_voltage(_t, wave_type, freq, amp)
            if circuit_type == "RC":
                capacitor_voltage = y[0]
                return [(vin - capacitor_voltage) / (R * C)]
            if circuit_type == "RL":
                current = y[0]
                return [(vin - R * current) / L]
            current, capacitor_voltage = y
            return [(vin - R * current - capacitor_voltage) / L, current / C]

        default_state = [0.0, 0.0] if circuit_type == "RLC" else [0.0]
        state = list(initial_state) if initial_state is not None else default_state
        if len(state) != len(default_state) or not all(
            math.isfinite(float(value)) for value in state
        ):
            raise ValueError(f"Estado inicial inválido para o circuito {circuit_type}.")
        sol = solve_ivp(
            ode_system,
            t_span,
            state,
            t_eval=t_eval,
            method="RK45",
            max_step=max_step,
        )
        if not sol.success or sol.y.shape[1] != len(t_eval):
            raise RuntimeError(f"Falha na simulação transiente: {sol.message}")
        self.t = sol.t
        self.v_in = np.array(
            [self.get_input_voltage(ti, wave_type, freq, amp) for ti in self.t]
        )
        if circuit_type == "RC":
            self.v_out = sol.y[0]
            self.current = (self.v_in - self.v_out) / R
        elif circuit_type == "RL":
            self.current = sol.y[0]
            self.v_out = R * self.current
        else:
            self.current = sol.y[0]
            self.v_out = sol.y[1]
        return self.t, self.v_in, self.v_out, self.current

    def solve_rc_transient(self, R: float, C: float, wave_type: str, freq: float):
        return self.solve_circuit_transient("RC", R, 1.0, C, wave_type, freq)


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
        self.setRotation(model.rotation)

    def boundingRect(self) -> QtCore.QRectF:
        return QtCore.QRectF(-50, -30, 100, 60)

    def itemChange(self, change, value):
        if change == QtWidgets.QGraphicsItem.GraphicsItemChange.ItemPositionChange:
            x = round(value.x() / self.GRID_SIZE) * self.GRID_SIZE
            y = round(value.y() / self.GRID_SIZE) * self.GRID_SIZE
            self.model.x = x
            self.model.y = y
            return QtCore.QPointF(x, y)
        if change == QtWidgets.QGraphicsItem.GraphicsItemChange.ItemRotationHasChanged:
            self.model.rotation = int(self.rotation()) % 360
        return super().itemChange(change, value)

    def get_terminal_scene_pos(self, index: int) -> QtCore.QPointF:
        if index not in (1, 2):
            raise ValueError(f"Terminal inválido: {index}")
        return self.mapToScene(self.term1_offset if index == 1 else self.term2_offset)

    def mousePressEvent(self, event):
        if event is None:
            return
        pos = event.pos()
        if (pos - self.term1_offset).manhattanLength() < 12:
            self.on_terminal_click(self, 1)
            return
        if (pos - self.term2_offset).manhattanLength() < 12:
            self.on_terminal_click(self, 2)
            return
        super().mousePressEvent(event)

    def mouseDoubleClickEvent(self, event):
        del event
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

    def paint(self, painter: QtGui.QPainter, _option, _widget=None):
        del _option, _widget
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
        elif self.model.comp_type == "L":
            painter.drawLine(-20, 0, -15, 0)
            for center_x in (-10, 0, 10):
                painter.drawArc(center_x - 5, -8, 10, 16, 0, 180 * 16)
            painter.drawLine(15, 0, 20, 0)
        elif self.model.comp_type == "V":
            painter.drawEllipse(-18, -18, 36, 36)
            painter.drawText(QtCore.QRectF(-18, -18, 36, 36), QtCore.Qt.AlignmentFlag.AlignCenter, "PWM")

        if self.model.comp_type == "V":
            painter.setPen(QtGui.QColor("#ffffff"))
            painter.drawText(-47, -8, "−")
            painter.drawText(38, -8, "+")
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
        self.flow_sign = 1.0
        self.current_value = 0.0
        self.setPen(QtGui.QPen(QtGui.QColor("#888888"), 2))
        self.update_positions()

    def update_positions(self):
        p1 = self.item1.get_terminal_scene_pos(self.term1)
        p2 = self.item2.get_terminal_scene_pos(self.term2)
        self.setLine(QtCore.QLineF(p1, p2))

    def boundingRect(self) -> QtCore.QRectF:
        return super().boundingRect().adjusted(-8, -8, 8, 8)

    def advance_animation(self, current_val: float):
        self.update_positions()
        oriented_current = current_val * self.flow_sign
        self.current_value = oriented_current
        self.phase = (self.phase + oriented_current * 15.0) % 1.0
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
        if abs(self.current_value) > 1e-12:
            direction = 1.0 if self.current_value > 0 else -1.0
            t = 0.68 if direction > 0 else 0.32
            point = line.pointAt(t)
            angle = math.atan2(line.dy(), line.dx()) + (0 if direction > 0 else math.pi)
            size = 7.0
            tip = QtCore.QPointF(
                point.x() + math.cos(angle) * size,
                point.y() + math.sin(angle) * size,
            )
            left = QtCore.QPointF(
                point.x() + math.cos(angle + 2.5) * size,
                point.y() + math.sin(angle + 2.5) * size,
            )
            right = QtCore.QPointF(
                point.x() + math.cos(angle - 2.5) * size,
                point.y() + math.sin(angle - 2.5) * size,
            )
            painter.setBrush(QtGui.QBrush(QtGui.QColor("#ffdd00")))
            painter.drawPolygon(QtGui.QPolygonF([tip, left, right]))


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
        self.current = np.array([])
        self.cursor_idx = 0

    def set_data(self, t, v_in, v_out, current=None):
        self.t = np.asarray(t, dtype=float)
        self.v_in = np.asarray(v_in, dtype=float)
        self.v_out = np.asarray(v_out, dtype=float)
        self.current = np.asarray(current if current is not None else [], dtype=float)
        if not (len(self.t) == len(self.v_in) == len(self.v_out)) or (
            len(self.current) not in (0, len(self.t))
        ):
            self.t = self.v_in = self.v_out = self.current = np.array([])
        self.cursor_idx = 0
        self.update()

    def step_cursor(self):
        if len(self.t) > 0:
            self.cursor_idx = (self.cursor_idx + 2) % len(self.t)
            self.update()

    def paintEvent(self, _event):
        _event.accept()
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

        v_max = max(np.max(np.abs(self.v_in)), np.max(np.abs(self.v_out)), 5.5)
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
        if len(self.current) == len(self.t):
            painter.setPen(QtGui.QColor("#a6e3a1"))
            painter.drawText(440, 20, f"I (convencional): {self.current[self.cursor_idx]:.4f} A")


# ==============================================================================
# 6. JANELA PRINCIPAL (INTEGRAÇÃO DE TODOS OS MÓDULOS)
# ==============================================================================
class MainApp(QtWidgets.QMainWindow):
    circuitView: QtWidgets.QGraphicsView
    scopeLayout: QtWidgets.QVBoxLayout
    comboWave: QtWidgets.QComboBox
    spinFreq: QtWidgets.QDoubleSpinBox
    btnAddSource: QtWidgets.QPushButton
    btnAddResistor: QtWidgets.QPushButton
    btnAddCapacitor: QtWidgets.QPushButton
    btnAddInductor: QtWidgets.QPushButton
    btnRotate: QtWidgets.QPushButton
    comboCircuitType: QtWidgets.QComboBox
    btnLoadPreset: QtWidgets.QPushButton
    btnClear: QtWidgets.QPushButton
    btnRunSim: QtWidgets.QPushButton
    btnExportSchemdraw: QtWidgets.QPushButton
    btnGenSpice: QtWidgets.QPushButton
    txtSpiceOutput: QtWidgets.QTextEdit
    comboCounterBits: QtWidgets.QComboBox
    comboCounterDirection: QtWidgets.QComboBox
    btnClock: QtWidgets.QPushButton
    btnResetCounter: QtWidgets.QPushButton
    lblCounterState: QtWidgets.QLabel

    def __init__(self):
        super().__init__()
        ui_stream = io.StringIO(PAGE_UI_XML)
        load_ui = getattr(uic, "loadUi", None)
        if load_ui is None:
            raise RuntimeError("PyQt6 não disponibiliza uic.loadUi.")
        load_ui(ui_stream, self)
        self.status_bar = QtWidgets.QStatusBar(self)
        self.setStatusBar(self.status_bar)

        self.scene = QtWidgets.QGraphicsScene(0, 0, 1000, 600)
        self.scene.setBackgroundBrush(QtGui.QBrush(QtGui.QColor("#181818")))
        self.circuitView.setScene(self.scene)
        self.draw_grid()

        self.scope = OscilloscopeWidget()
        self.scopeLayout.addWidget(self.scope)

        self.engine = TransientEngine()
        self.components: list[ElectronicGraphicsItem] = []
        self.wires: list[AnimatedWireItem] = []
        self.pending_terminal: tuple[ElectronicGraphicsItem, int] | None = None
        self.comp_counter = {"V": 1, "R": 1, "L": 1, "C": 1}
        self.circuit_type: Literal["RC", "RL", "RLC"] = "RC"
        self.counter = JKCounterModel()
        self._project_path = None

        self.anim_timer = QtCore.QTimer(self)
        self.anim_timer.timeout.connect(self.on_animation_tick)
        self.anim_timer.start(33)

        self._create_actions_and_menus()
        self.btnAddSource.clicked.connect(lambda: self.add_component("V", 5.0, "V"))
        self.btnAddResistor.clicked.connect(lambda: self.add_component("R", 1000.0, "Ω"))
        self.btnAddCapacitor.clicked.connect(lambda: self.add_component("C", 0.00001, "F"))
        self.btnAddInductor.clicked.connect(lambda: self.add_component("L", 0.01, "H"))
        self.btnRotate.clicked.connect(self.rotate_selected_component)
        self.btnLoadPreset.clicked.connect(self.load_selected_preset)
        self.btnClear.clicked.connect(self.clear_canvas)
        self.btnRunSim.clicked.connect(self.run_simulation)
        self.btnExportSchemdraw.clicked.connect(self.export_schemdraw)
        self.btnGenSpice.clicked.connect(self.generate_spice_netlist)
        self.btnClock.clicked.connect(self.clock_counter)
        self.btnResetCounter.clicked.connect(self.reset_counter)
        self.comboCounterBits.currentIndexChanged.connect(self.configure_counter)
        self.comboCounterDirection.currentIndexChanged.connect(self.configure_counter)

        self.load_preset("RC")
        self.update_counter_display()

    def _create_actions_and_menus(self):
        def action(text, shortcut, callback):
            item = QtGui.QAction(text, self)
            if shortcut:
                item.setShortcut(QtGui.QKeySequence(shortcut))
                item.setShortcutContext(QtCore.Qt.ShortcutContext.WindowShortcut)
            def invoke(_checked=False):
                del _checked
                callback()

            item.triggered.connect(invoke)
            self.addAction(item)
            return item

        self.action_new = action("Novo circuito", "Ctrl+N", self.new_project)
        self.action_import = action("Importar projeto JSON...", "Ctrl+O", self.import_project)
        self.action_save = action("Salvar projeto JSON...", "Ctrl+S", self.save_project)
        self.action_rotate = action("Girar componente 90°", "R", self.rotate_selected_component)
        self.action_simulate = action("Simular circuito", "F5", self.run_simulation)
        self.action_clock = action("Pulso no contador JK", "Space", self.clock_counter)
        self.action_spice = action("Gerar netlist SPICE", "Ctrl+E", self.generate_spice_netlist)
        self.action_svg = action("Exportar desenho SVG...", "", self.export_schemdraw)
        self.action_help = action("Ajuda", "F1", self.show_help)
        self.action_about = action("Sobre", "", self.show_about)

        menu_bar = self.menuBar()
        assert menu_bar is not None
        file_menu = QtWidgets.QMenu("&Arquivo", self)
        menu_bar.addMenu(file_menu)
        for item in (self.action_new, self.action_import, self.action_save):
            file_menu.addAction(item)
        file_menu.addSeparator()
        file_menu.addAction(self.action_spice)
        file_menu.addAction(self.action_svg)
        file_menu.addSeparator()
        file_menu.addAction("Sair", self.close)

        component_menu = QtWidgets.QMenu("&Componentes", self)
        menu_bar.addMenu(component_menu)
        component_menu.addAction("Adicionar fonte", lambda: self.add_component("V", 5.0, "V"))
        component_menu.addAction("Adicionar resistor", lambda: self.add_component("R", 1000.0, "Ω"))
        component_menu.addAction("Adicionar indutor", lambda: self.add_component("L", 0.01, "H"))
        component_menu.addAction("Adicionar capacitor", lambda: self.add_component("C", 0.00001, "F"))
        component_menu.addSeparator()
        component_menu.addAction(self.action_rotate)

        simulation_menu = QtWidgets.QMenu("&Simulação", self)
        menu_bar.addMenu(simulation_menu)
        simulation_menu.addAction(self.action_simulate)
        simulation_menu.addAction(self.action_clock)
        simulation_menu.addAction("Resetar contador JK", self.reset_counter)
        simulation_menu.addAction("Montar circuito selecionado", self.load_selected_preset)

        help_menu = QtWidgets.QMenu("&Ajuda", self)
        menu_bar.addMenu(help_menu)
        help_menu.addAction(self.action_help)
        help_menu.addAction(self.action_about)

        toolbar = QtWidgets.QToolBar("Ações")
        toolbar.setMovable(False)
        self.addToolBar(toolbar)
        for item in (
            self.action_new,
            self.action_import,
            self.action_save,
            self.action_rotate,
            self.action_simulate,
            self.action_clock,
            self.action_spice,
        ):
            toolbar.addAction(item)

    def show_help(self):
        QtWidgets.QMessageBox.information(
            self,
            "Ajuda - PyEDA Suite",
            "Circuitos analógicos:\n"
            "1. Selecione RC, RL ou RLC e clique em 'Montar circuito padrão'.\n"
            "2. Ajuste os valores com duplo clique e inicie a simulação (F5).\n"
            "3. Arraste componentes; selecione e pressione R para girar 90°.\n"
            "A corrente exibida é convencional: sai do terminal positivo da fonte.\n\n"
            "Contadores JK síncronos:\n"
            "Escolha 3 ou 4 bits e contagem crescente/decrescente; use Espaço "
            "para aplicar um pulso de clock e Reset para zerar.\n\n"
            "Atalhos: Ctrl+N novo, Ctrl+O importar JSON, Ctrl+S salvar JSON, "
            "F5 simular, R girar, Espaço clock, Ctrl+E gerar SPICE, F1 ajuda.",
        )

    def show_about(self):
        QtWidgets.QMessageBox.about(
            self,
            "Sobre a PyEDA Suite",
            "Editor didático de circuitos RC/RL/RLC e contadores síncronos "
            "com flip-flops JK.\nSimulação transiente com SciPy e validação de "
            "projetos com Pydantic.",
        )

    def new_project(self):
        self.clear_canvas()
        self.circuit_type = "RC"
        self.comboCircuitType.setCurrentText(self.circuit_type)
        self._project_path = None

    def import_project(self):
        filename, _ = QtWidgets.QFileDialog.getOpenFileName(
            self, "Importar projeto", "", "Projeto PyEDA (*.json);;Todos os arquivos (*)"
        )
        if not filename:
            return
        try:
            with open(filename, encoding="utf-8") as file:
                project = CircuitProjectModel.model_validate(json.load(file))
            self.load_project_model(project)
            self._project_path = filename
            self.status_bar.showMessage(f"Projeto importado: {filename}", 5000)
        except (OSError, UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            QtWidgets.QMessageBox.critical(self, "Falha ao importar", str(exc))

    def save_project(self):
        filename, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Salvar projeto", self._project_path or "", "Projeto PyEDA (*.json)"
        )
        if not filename:
            return
        if not filename.lower().endswith(".json"):
            filename += ".json"
        project = CircuitProjectModel(
            circuit_type=self.circuit_type,
            components=[
                CircuitProjectComponent(**component.model.model_dump())
                for component in self.components
            ],
            wires=[
                CircuitProjectWire(
                    start_component=self.components.index(wire.item1),
                    start_terminal=wire.term1,
                    end_component=self.components.index(wire.item2),
                    end_terminal=wire.term2,
                )
                for wire in self.wires
            ],
        )
        try:
            with open(filename, "w", encoding="utf-8") as file:
                file.write(project.model_dump_json(indent=2))
        except OSError as exc:
            QtWidgets.QMessageBox.critical(self, "Falha ao salvar", str(exc))
            return
        self._project_path = filename
        self.status_bar.showMessage(f"Projeto salvo: {filename}", 5000)

    def load_project_model(self, project: CircuitProjectModel):
        self.clear_canvas()
        self.circuit_type = project.circuit_type
        self.comboCircuitType.setCurrentText(project.circuit_type)
        for component in project.components:
            item = self.add_component(
                component.comp_type,
                component.value,
                component.unit,
                component.x,
                component.y,
                name=component.name,
            )
            item.setRotation(component.rotation)
        for wire_model in project.wires:
            wire = AnimatedWireItem(
                self.components[wire_model.start_component],
                wire_model.start_terminal,
                self.components[wire_model.end_component],
                wire_model.end_terminal,
            )
            self.scene.addItem(wire)
            self.wires.append(wire)
        self.run_simulation(show_errors=False)

    def rotate_selected_component(self):
        selected = [
            item for item in self.scene.selectedItems()
            if isinstance(item, ElectronicGraphicsItem)
        ]
        if not selected:
            self.status_bar.showMessage("Selecione um componente para girar.", 3000)
            return
        for item in selected:
            item.setRotation((item.rotation() + 90) % 360)
            item.model.rotation = int(item.rotation())
        self.status_bar.showMessage(f"{len(selected)} componente(s) girado(s).", 3000)

    def configure_counter(self, _index=None):
        del _index
        bit_count = 3 if self.comboCounterBits.currentIndex() == 0 else 4
        direction = "UP" if self.comboCounterDirection.currentIndex() == 0 else "DOWN"
        self.counter = JKCounterModel(bit_count=bit_count, direction=direction)
        self.update_counter_display()

    def update_counter_display(self):
        self.lblCounterState.setText(
            f"Q = {self.counter.bits}  |  decimal {self.counter.state}  |  "
            f"J/K síncronos"
        )

    def clock_counter(self):
        self.counter.clock()
        self.update_counter_display()

    def reset_counter(self):
        self.counter.reset()
        self.update_counter_display()

    def draw_grid(self):
        pen = QtGui.QPen(QtGui.QColor("#252525"), 1)
        for x in range(0, 1000, 20):
            self.scene.addLine(x, 0, x, 600, pen)
        for y in range(0, 600, 20):
            self.scene.addLine(0, y, 1000, y, pen)

    def add_component(
        self,
        comp_type: Literal["V", "R", "L", "C"],
        default_val: float,
        unit: str,
        x: float = 200,
        y: float = 200,
        name: str | None = None,
    ):
        idx = self.comp_counter[comp_type]
        self.comp_counter[comp_type] += 1
        model = ComponentModel(
            comp_type=comp_type,
            name=name or f"{comp_type}{idx}",
            value=default_val,
            unit=unit,
            x=x,
            y=y,
        )
        item = ElectronicGraphicsItem(model, x, y, self.handle_terminal_click)
        self.scene.addItem(item)
        self.components.append(item)
        return item

    def handle_terminal_click(self, item: ElectronicGraphicsItem, term_idx: int):
        if self.pending_terminal is None:
            self.pending_terminal = (item, term_idx)
            self.status_bar.showMessage("Clique em outro terminal para conectar o fio...")
            return

        item1, term1 = self.pending_terminal
        if item1 != item:
            wire = AnimatedWireItem(item1, term1, item, term_idx)
            self.scene.addItem(wire)
            self.wires.append(wire)
        self.pending_terminal = None
        self.status_bar.clearMessage()

    def _series_topology(self):
        expected_types = {
            "RC": {"V": 1, "R": 1, "C": 1},
            "RL": {"V": 1, "R": 1, "L": 1},
            "RLC": {"V": 1, "R": 1, "L": 1, "C": 1},
        }[self.circuit_type]
        actual_types = {}
        for item in self.components:
            kind = item.model.comp_type
            actual_types[kind] = actual_types.get(kind, 0) + 1
        if actual_types != expected_types:
            raise ValueError(
                f"O modo {self.circuit_type} requer exatamente estes componentes: "
                f"{', '.join(expected_types)}. Monte o circuito padrão ou corrija os componentes."
            )
        if len(self.wires) != len(self.components):
            raise ValueError("A malha precisa estar fechada, com um fio para cada componente.")

        adjacency: dict[
            tuple[int, int],
            list[tuple[tuple[int, int], str, AnimatedWireItem | ElectronicGraphicsItem, bool]],
        ] = {}
        terminal_connections: dict[tuple[int, int], AnimatedWireItem] = {}

        def node(item: ElectronicGraphicsItem, terminal: int) -> tuple[int, int]:
            return id(item), terminal

        def add_edge(
            start: tuple[int, int],
            end: tuple[int, int],
            kind: Literal["wire", "component"],
            edge_item: AnimatedWireItem | ElectronicGraphicsItem,
            forward: bool,
        ):
            adjacency.setdefault(start, []).append((end, kind, edge_item, forward))
            adjacency.setdefault(end, []).append((start, kind, edge_item, not forward))

        for wire in self.wires:
            start = node(wire.item1, wire.term1)
            end = node(wire.item2, wire.term2)
            if start in terminal_connections or end in terminal_connections:
                raise ValueError("Cada terminal deve ter exatamente um fio conectado.")
            terminal_connections[start] = wire
            terminal_connections[end] = wire
            add_edge(start, end, "wire", wire, True)

        source_item = next(item for item in self.components if item.model.comp_type == "V")
        passive_items = [item for item in self.components if item is not source_item]
        for item in passive_items:
            pin1, pin2 = node(item, 1), node(item, 2)
            if pin1 not in terminal_connections or pin2 not in terminal_connections:
                raise ValueError(f"Os dois terminais de {item.model.name} precisam estar conectados.")
            add_edge(pin1, pin2, "component", item, True)

        start = node(source_item, 2)
        finish = node(source_item, 1)
        if start not in terminal_connections or finish not in terminal_connections:
            raise ValueError("Os polos positivo e negativo da fonte precisam fechar a malha.")

        Edge = tuple[str, AnimatedWireItem | ElectronicGraphicsItem, bool]
        previous: dict[tuple[int, int], tuple[int, int]] = {}
        previous_edge: dict[tuple[int, int], Edge] = {}
        visited = {start}
        queue = [start]
        for current_node in queue:
            if current_node == finish:
                break
            for neighbor, kind, edge_item, forward in adjacency.get(current_node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    previous[neighbor] = current_node
                    previous_edge[neighbor] = (kind, edge_item, forward)
                    queue.append(neighbor)
        if finish not in visited:
            raise ValueError("Não existe um caminho fechado da fonte positiva à negativa.")

        path_edges: list[Edge] = []
        current_node = finish
        while current_node != start:
            predecessor = previous.get(current_node)
            edge = previous_edge.get(current_node)
            if predecessor is None or edge is None:
                raise RuntimeError("Falha ao reconstruir o caminho elétrico da malha.")
            path_edges.append(edge)
            current_node = predecessor
        path_edges.reverse()
        path_wires = []
        path_components = []
        for kind, edge_item, _ in path_edges:
            if kind == "wire":
                if not isinstance(edge_item, AnimatedWireItem):
                    raise RuntimeError("A malha contém uma conexão inválida.")
                path_wires.append(edge_item)
            else:
                if not isinstance(edge_item, ElectronicGraphicsItem):
                    raise RuntimeError("A malha contém um componente inválido.")
                path_components.append(edge_item)
        if {id(wire) for wire in path_wires} != {id(wire) for wire in self.wires}:
            raise ValueError("A ligação tem derivações ou componentes fora da malha em série.")
        if {id(item) for item in path_components} != {id(item) for item in passive_items}:
            raise ValueError("A malha precisa passar por todos os componentes em série.")
        for kind, edge_item, forward in path_edges:
            if kind == "wire":
                edge_item.flow_sign = 1.0 if forward else -1.0
        return source_item.model, path_components

    def load_selected_preset(self):
        self.load_preset(self.selected_circuit_type())

    def selected_circuit_type(self) -> Literal["RC", "RL", "RLC"]:
        index = self.comboCircuitType.currentIndex()
        if index == 0:
            return "RC"
        if index == 1:
            return "RL"
        if index == 2:
            return "RLC"
        raise ValueError(f"Seleção de topologia inválida: {index}")

    def load_preset(self, circuit_type: Literal["RC", "RL", "RLC"]):
        self.clear_canvas()
        self.circuit_type = circuit_type
        self.comboCircuitType.setCurrentText(circuit_type)
        path = [self.add_component("V", 5.0, "V", 160, 320)]
        path.append(self.add_component("R", 1000.0, "Ω", 340, 160))
        if circuit_type == "RC":
            path.append(self.add_component("C", 0.00001, "F", 560, 320))
        elif circuit_type == "RL":
            path.append(self.add_component("L", 0.01, "H", 560, 320))
        else:
            path.append(self.add_component("L", 0.01, "H", 520, 160))
            path.append(self.add_component("C", 0.00001, "F", 640, 320))

        for start, end in zip(path, path[1:]):
            wire = AnimatedWireItem(start, 2, end, 1)
            self.scene.addItem(wire)
            self.wires.append(wire)
        return_wire = AnimatedWireItem(path[-1], 2, path[0], 1)
        self.scene.addItem(return_wire)
        self.wires.append(return_wire)
        self.run_simulation(show_errors=False)

    def clear_canvas(self):
        self.scene.clear()
        self.draw_grid()
        self.components.clear()
        self.wires.clear()
        self.pending_terminal = None
        self.comp_counter = {"V": 1, "R": 1, "L": 1, "C": 1}
        self.engine.current = np.array([])
        self.scope.set_data([], [], [], [])

    def run_simulation(self, show_errors=True):
        try:
            self.circuit_type = self.selected_circuit_type()
            source, passive_components = self._series_topology()
            resistor = next(item for item in passive_components if item.model.comp_type == "R").model
            inductor = next(
                (item.model for item in passive_components if item.model.comp_type == "L"),
                None,
            )
            capacitor = next(
                (item.model for item in passive_components if item.model.comp_type == "C"),
                None,
            )
        except (ValueError, StopIteration) as exc:
            if show_errors:
                QtWidgets.QMessageBox.warning(self, "Circuito incompleto", str(exc))
            else:
                self.status_bar.showMessage(str(exc), 5000)
            return
        r_val = float(resistor.value)
        l_val = float(inductor.value) if inductor else 0.01
        c_val = float(capacitor.value) if capacitor else 1e-5
        amp = float(source.value)
        wave = self.comboWave.currentText()
        freq = self.spinFreq.value()
        try:
            t, vin, vout, current = self.engine.solve_circuit_transient(
                self.circuit_type, r_val, l_val, c_val, wave, freq, amp
            )
        except (ValueError, RuntimeError) as exc:
            if show_errors:
                QtWidgets.QMessageBox.warning(self, "Erro de simulação", str(exc))
            return
        self.scope.set_data(t, vin, vout, current)
        self.status_bar.showMessage(
            f"Simulação {self.circuit_type}: R={r_val}Ω, L={l_val}H, "
            f"C={c_val}F, f={freq}Hz; + da fonte → carga."
        )

    def on_animation_tick(self):
        if len(self.engine.current) == 0 or self.scope.cursor_idx >= len(self.engine.current):
            return
        idx = self.scope.cursor_idx
        current_now = self.engine.current[idx]
        for wire in self.wires:
            wire.advance_animation(current_now)
        self.scope.step_cursor()

    def generate_spice_netlist(self):
        try:
            self.circuit_type = self.selected_circuit_type()
            source, ordered_components = self._series_topology()
        except ValueError as exc:
            QtWidgets.QMessageBox.warning(
                self, "Circuito incompleto", str(exc)
            )
            return
        passive_components = [item.model for item in ordered_components]
        stop_time = 3.0 / self.spinFreq.value()
        if "Quadrada" in self.comboWave.currentText():
            period = 1.0 / self.spinFreq.value()
            waveform = (
                f"PULSE(0 {float(source.value):g} 0 1u 1u "
                f"{period / 2:g} {period:g})"
            )
        elif "Senoidal" in self.comboWave.currentText():
            waveform = f"SIN(0 {float(source.value):g} {self.spinFreq.value():g})"
        else:
            waveform = (
                f"PULSE(0 {float(source.value):g} 2m 1u 1u "
                f"{stop_time:g} {2 * stop_time:g})"
            )
        components = [
            PySpiceComponentModel(
                name=source.name,
                comp_type="V",
                value=float(source.value),
                unit=source.unit,
                node1=1,
                node2=0,
                waveform=waveform,
            )
        ]
        node = 1
        for index, model in enumerate(passive_components):
            is_last = index == len(passive_components) - 1
            components.append(
                PySpiceComponentModel(
                    name=model.name,
                    comp_type=model.comp_type,
                    value=float(model.value),
                    unit=model.unit,
                    node1=node,
                    node2=0 if is_last else node + 1,
                )
            )
            if not is_last:
                node += 1
        circuit = PySpiceCircuitModel(
            title=f"Circuito {self.circuit_type} gerado pela PyEDA Suite",
            components=components,
            transient=f".tran 0 {stop_time:g}",
        )
        self.txtSpiceOutput.setPlainText("\n".join(circuit.build_netlist()))

    def export_schemdraw(self):
        filename, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Exportar esquemático", "esquematico_exportado.svg", "SVG (*.svg)"
        )
        if not filename:
            return
        if not filename.lower().endswith(".svg"):
            filename += ".svg"
        try:
            with schemdraw.Drawing(file=filename, show=False) as drawing:
                for c in self.components:
                    m = c.model
                    if m.comp_type == "V":
                        drawing += elm.SourcePulse().up().label(f"{m.name}\n{m.value}V")
                    elif m.comp_type == "R":
                        drawing += elm.Resistor().right().label(f"{m.name}\n{m.value}Ω")
                    elif m.comp_type == "L":
                        drawing += elm.Inductor().right().label(f"{m.name}\n{m.value}H")
                    elif m.comp_type == "C":
                        drawing += elm.Capacitor().down().label(f"{m.name}\n{m.value}F")
                drawing += elm.Ground()
        except (OSError, ValueError, AttributeError) as exc:
            QtWidgets.QMessageBox.critical(self, "Falha na exportação", str(exc))
            return
        QtWidgets.QMessageBox.information(self, "Schemdraw", f"Esquemático vetorial salvo em:\n{filename}")


if __name__ == "__main__":
    from main import main

    sys.exit(main())
