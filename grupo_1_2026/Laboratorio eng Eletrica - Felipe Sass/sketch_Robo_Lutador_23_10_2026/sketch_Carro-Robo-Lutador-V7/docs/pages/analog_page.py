import json
from pathlib import Path
from typing import Literal

import numpy as np
import schemdraw
import schemdraw.elements as elm
from PyQt6 import QtCore, QtGui, QtWidgets, uic
from PySpice.Spice.Netlist import Circuit as PySpiceCircuit

from simulando_circuitos_digitais_3bits import (
    AnimatedWireItem,
    CircuitProjectComponent,
    CircuitProjectModel,
    CircuitProjectWire,
    ComponentModel,
    ElectronicGraphicsItem,
    PySpiceCircuitModel,
    PySpiceComponentModel,
    TransientEngine,
)


CircuitType = Literal["RC", "RL", "RLC"]
Edge = tuple[str, AnimatedWireItem | ElectronicGraphicsItem, bool]


class AnalogCircuitPage(QtWidgets.QWidget):
    statusChanged = QtCore.pyqtSignal(str)

    circuitView: QtWidgets.QGraphicsView
    scopeLayout: QtWidgets.QVBoxLayout
    comboCircuitType: QtWidgets.QComboBox
    comboWave: QtWidgets.QComboBox
    spinFreq: QtWidgets.QDoubleSpinBox
    btnLoadPreset: QtWidgets.QPushButton
    btnAddSource: QtWidgets.QPushButton
    btnAddResistor: QtWidgets.QPushButton
    btnAddInductor: QtWidgets.QPushButton
    btnAddCapacitor: QtWidgets.QPushButton
    btnRotate: QtWidgets.QPushButton
    btnClear: QtWidgets.QPushButton
    btnRunSim: QtWidgets.QPushButton
    btnSwitch: QtWidgets.QPushButton
    btnGenSpice: QtWidgets.QPushButton
    btnExportSchemdraw: QtWidgets.QPushButton
    spiceOutput: QtWidgets.QPlainTextEdit
    statusLabel: QtWidgets.QLabel

    def __init__(self, parent=None):
        super().__init__(parent)
        ui_path = Path(__file__).resolve().parents[1] / "ui" / "analog_page.ui"
        load_ui = getattr(uic, "loadUi", None)
        if load_ui is None:
            raise RuntimeError("PyQt6 não disponibiliza uic.loadUi.")
        load_ui(str(ui_path), self)

        self.scene = QtWidgets.QGraphicsScene(0, 0, 1600, 900, self)
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
        self.circuit_type: CircuitType = "RC"
        self._project_path: str | None = None
        self._switch_initial_state = (0.0, 0.0)

        self.animation_timer = QtCore.QTimer(self)
        self.animation_timer.timeout.connect(self.on_animation_tick)
        self.animation_timer.start(33)

        self.btnLoadPreset.clicked.connect(self.load_selected_preset)
        self.btnAddSource.clicked.connect(lambda: self.add_component("V", 5.0, "V"))
        self.btnAddResistor.clicked.connect(lambda: self.add_component("R", 1000.0, "Ω"))
        self.btnAddInductor.clicked.connect(lambda: self.add_component("L", 0.01, "H"))
        self.btnAddCapacitor.clicked.connect(lambda: self.add_component("C", 0.00001, "F"))
        self.btnRotate.clicked.connect(self.rotate_selected_component)
        self.btnClear.clicked.connect(self.new_project)
        self.btnRunSim.clicked.connect(self.run_simulation)
        self.btnRunSim.setProperty("primary", True)
        self.btnLoadPreset.setProperty("primary", True)
        self.btnSwitch.toggled.connect(self.handle_switch_toggle)
        self.comboWave.currentIndexChanged.connect(self.update_switch_controls)
        self.btnGenSpice.clicked.connect(self.generate_spice_netlist)
        self.btnExportSchemdraw.clicked.connect(self.export_schemdraw)

        self.circuitView.setDragMode(
            QtWidgets.QGraphicsView.DragMode.RubberBandDrag
        )
        self.update_switch_controls()
        self.load_preset("RC")

    def set_status(self, message: str):
        self.statusLabel.setText(message)
        self.statusChanged.emit(message)

    def draw_grid(self):
        pen = QtGui.QPen(QtGui.QColor("#252525"), 1)
        for x in range(0, 1600, 20):
            self.scene.addLine(x, 0, x, 900, pen)
        for y in range(0, 900, 20):
            self.scene.addLine(0, y, 1600, y, pen)

    def add_component(
        self,
        comp_type: Literal["V", "R", "L", "C"],
        value: float,
        unit: str,
        x: float | None = None,
        y: float | None = None,
        name: str | None = None,
    ) -> ElectronicGraphicsItem:
        index = self.comp_counter[comp_type]
        self.comp_counter[comp_type] += 1
        if x is None or y is None:
            position_index = len(self.components)
            x = 180 + (position_index % 5) * 260
            y = 160 + (position_index // 5) * 150
        model = ComponentModel(
            comp_type=comp_type,
            name=name or f"{comp_type}{index}",
            value=value,
            unit=unit,
            x=x,
            y=y,
        )
        item = ElectronicGraphicsItem(model, x, y, self.handle_terminal_click)
        self.scene.addItem(item)
        self.components.append(item)
        return item

    def handle_terminal_click(self, item: ElectronicGraphicsItem, terminal: int):
        if self.pending_terminal is None:
            self.pending_terminal = (item, terminal)
            self.set_status("Clique em outro terminal para fechar a conexão.")
            return
        previous, previous_terminal = self.pending_terminal
        if previous is not item:
            wire = AnimatedWireItem(previous, previous_terminal, item, terminal)
            self.scene.addItem(wire)
            self.wires.append(wire)
        self.pending_terminal = None
        self.set_status("Conexão adicionada. Pressione F5 para simular.")

    def load_selected_preset(self):
        self.load_preset(self.selected_circuit_type())

    def selected_circuit_type(self) -> CircuitType:
        index = self.comboCircuitType.currentIndex()
        if index == 0:
            return "RC"
        if index == 1:
            return "RL"
        if index == 2:
            return "RLC"
        raise ValueError(f"Topologia selecionada inválida: {index}")

    def load_preset(self, circuit_type: CircuitType):
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
            self._add_wire(start, 2, end, 1)
        self._add_wire(path[-1], 2, path[0], 1)
        self.run_simulation(show_errors=False)

    def _add_wire(
        self,
        start: ElectronicGraphicsItem,
        start_terminal: int,
        end: ElectronicGraphicsItem,
        end_terminal: int,
    ):
        wire = AnimatedWireItem(start, start_terminal, end, end_terminal)
        self.scene.addItem(wire)
        self.wires.append(wire)

    def clear_canvas(self):
        self.scene.clear()
        self.draw_grid()
        self.components.clear()
        self.wires.clear()
        self.pending_terminal = None
        self.comp_counter = {"V": 1, "R": 1, "L": 1, "C": 1}
        self.engine.current = np.array([])
        self._switch_initial_state = (0.0, 0.0)
        self.scope.set_data([], [], [], [])

    def new_project(self):
        self.clear_canvas()
        self.circuit_type = "RC"
        self.comboCircuitType.setCurrentText("RC")
        self._project_path = None
        self.set_status("Novo circuito vazio.")

    def rotate_selected_component(self):
        selected = [
            item
            for item in self.scene.selectedItems()
            if isinstance(item, ElectronicGraphicsItem)
        ]
        if not selected:
            self.set_status("Selecione um componente para girar.")
            return
        for item in selected:
            item.setRotation((item.rotation() + 90) % 360)
            item.model.rotation = int(item.rotation())
        self.set_status(f"{len(selected)} componente(s) girado(s) em 90°.")

    def update_switch_controls(self, _index=None):
        del _index
        manual_mode = "Chave manual" in self.comboWave.currentText()
        self.btnSwitch.setEnabled(manual_mode)
        self.btnSwitch.setToolTip(
            "Chave fechada: carrega. Chave aberta: descarrega pelo resistor."
            if manual_mode
            else "Selecione Chave manual para controlar a carga e descarga."
        )
        self.btnSwitch.setText(
            "●  Chave ON" if self.btnSwitch.isChecked() else "○  Chave OFF"
        )

    def handle_switch_toggle(self, closed: bool):
        del closed
        self.update_switch_controls()
        if "Chave manual" in self.comboWave.currentText():
            self.run_simulation(show_errors=False)

    def _switch_simulation_duration(
        self, resistance: float, inductance: float, capacitance: float
    ) -> float:
        time_constants = []
        if self.circuit_type in ("RC", "RLC"):
            time_constants.append(resistance * capacitance)
        if self.circuit_type in ("RL", "RLC"):
            time_constants.append(inductance / resistance)
        return max(5.0 * max(time_constants), 1.0 / self.spinFreq.value())

    def _series_topology(self):
        expected = {
            "RC": {"V": 1, "R": 1, "C": 1},
            "RL": {"V": 1, "R": 1, "L": 1},
            "RLC": {"V": 1, "R": 1, "L": 1, "C": 1},
        }[self.circuit_type]
        actual: dict[str, int] = {}
        for item in self.components:
            actual[item.model.comp_type] = actual.get(item.model.comp_type, 0) + 1
        if actual != expected:
            raise ValueError(
                f"O modo {self.circuit_type} requer estes componentes em série: "
                f"{', '.join(expected)}."
            )
        if len(self.wires) != len(self.components):
            raise ValueError("A malha em série deve ter um fio para cada componente.")

        adjacency: dict[
            tuple[int, int],
            list[tuple[tuple[int, int], str, AnimatedWireItem | ElectronicGraphicsItem, bool]],
        ] = {}
        connected: set[tuple[int, int]] = set()

        def node(item: ElectronicGraphicsItem, terminal: int) -> tuple[int, int]:
            return id(item), terminal

        def add_edge(
            first: tuple[int, int],
            second: tuple[int, int],
            kind: Literal["wire", "component"],
            item: AnimatedWireItem | ElectronicGraphicsItem,
        ):
            adjacency.setdefault(first, []).append((second, kind, item, True))
            adjacency.setdefault(second, []).append((first, kind, item, False))

        for wire in self.wires:
            first = node(wire.item1, wire.term1)
            second = node(wire.item2, wire.term2)
            if first in connected or second in connected:
                raise ValueError("Cada terminal deve ter somente um fio conectado.")
            connected.update((first, second))
            add_edge(first, second, "wire", wire)

        source_item = next(item for item in self.components if item.model.comp_type == "V")
        passive_items = [item for item in self.components if item is not source_item]
        for item in passive_items:
            first, second = node(item, 1), node(item, 2)
            if first not in connected or second not in connected:
                raise ValueError(f"Conecte os dois terminais de {item.model.name}.")
            add_edge(first, second, "component", item)

        start, finish = node(source_item, 2), node(source_item, 1)
        if start not in connected or finish not in connected:
            raise ValueError("Conecte os polos positivo e negativo da fonte.")
        visited = {start}
        previous: dict[tuple[int, int], tuple[int, int]] = {}
        previous_edge: dict[tuple[int, int], Edge] = {}
        queue = [start]
        for current in queue:
            if current == finish:
                break
            for neighbor, kind, edge_item, forward in adjacency.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    previous[neighbor] = current
                    previous_edge[neighbor] = (kind, edge_item, forward)
                    queue.append(neighbor)
        if finish not in visited:
            raise ValueError("Não existe caminho fechado da fonte positiva à negativa.")

        edges: list[Edge] = []
        current = finish
        while current != start:
            edges.append(previous_edge[current])
            current = previous[current]
        edges.reverse()
        path_wires: list[AnimatedWireItem] = []
        path_components: list[ElectronicGraphicsItem] = []
        for kind, item, _ in edges:
            if kind == "wire" and isinstance(item, AnimatedWireItem):
                path_wires.append(item)
            elif kind == "component" and isinstance(item, ElectronicGraphicsItem):
                path_components.append(item)
        if {id(item) for item in path_wires} != {id(item) for item in self.wires}:
            raise ValueError("A malha tem derivações ou fios fora do caminho em série.")
        if {id(item) for item in path_components} != {id(item) for item in passive_items}:
            raise ValueError("A malha precisa passar por todos os componentes.")
        for kind, item, forward in edges:
            if kind == "wire" and isinstance(item, AnimatedWireItem):
                item.flow_sign = 1.0 if forward else -1.0
        return source_item.model, path_components

    def run_simulation(self, show_errors=True):
        try:
            self.circuit_type = self.selected_circuit_type()
            source, ordered = self._series_topology()
            resistor = next(item.model for item in ordered if item.model.comp_type == "R")
            inductor = next((item.model for item in ordered if item.model.comp_type == "L"), None)
            capacitor = next((item.model for item in ordered if item.model.comp_type == "C"), None)
            manual_switch = "Chave manual" in self.comboWave.currentText()
            resistance = float(resistor.value)
            inductance = float(inductor.value) if inductor else 0.01
            capacitance = float(capacitor.value) if capacitor else 1e-5
            if self.circuit_type == "RLC":
                initial_state = self._switch_initial_state
            else:
                initial_state = self._switch_initial_state[:1]
            t, vin, vout, current = self.engine.solve_circuit_transient(
                self.circuit_type,
                resistance,
                inductance,
                capacitance,
                self.comboWave.currentText(),
                self.spinFreq.value(),
                (
                    float(source.value)
                    if not manual_switch or self.btnSwitch.isChecked()
                    else 0.0
                ),
                initial_state=initial_state if manual_switch else None,
                duration=(
                    self._switch_simulation_duration(
                        resistance, inductance, capacitance
                    )
                    if manual_switch
                    else None
                ),
            )
        except (ValueError, StopIteration, RuntimeError) as exc:
            if show_errors:
                QtWidgets.QMessageBox.warning(self, "Circuito sem simulação", str(exc))
            self.set_status(str(exc))
            return
        output_label = (
            "Vc (capacitor)"
            if self.circuit_type in ("RC", "RLC")
            else "VR (resistor)"
        )
        self.scope.set_data(t, vin, vout, current, output_label)
        if manual_switch and len(t):
            if self.circuit_type == "RC":
                self._switch_initial_state = (float(vout[-1]), 0.0)
            elif self.circuit_type == "RL":
                self._switch_initial_state = (float(current[-1]), 0.0)
            else:
                self._switch_initial_state = (float(current[-1]), float(vout[-1]))
            phase = "carga" if self.btnSwitch.isChecked() else "descarga"
            self.set_status(
                f"Chave {'fechada' if self.btnSwitch.isChecked() else 'aberta'}: "
                f"simulação de {phase} concluída. Curvas de tensão e corrente "
                "animadas no osciloscópio."
            )
            return
        self.set_status(
            f"{self.circuit_type} simulado. Corrente convencional no sentido "
            "da fonte (+) para a carga e retorno ao (−). Modelo PySpice; "
            "análise transiente SciPy."
        )

    def on_animation_tick(self):
        if len(self.engine.current) == 0:
            return
        index = self.scope.cursor_idx
        if index >= len(self.engine.current):
            return
        current = float(self.engine.current[index])
        for wire in self.wires:
            wire.advance_animation(current)
        self.scope.step_cursor()

    def rotate_selected(self):
        self.rotate_selected_component()

    def generate_spice_netlist(self):
        try:
            self.circuit_type = self.selected_circuit_type()
            source, ordered = self._series_topology()
        except (ValueError, StopIteration) as exc:
            QtWidgets.QMessageBox.warning(self, "Circuito sem netlist", str(exc))
            return

        frequency = self.spinFreq.value()
        stop_time = 3.0 / frequency
        if "Chave manual" in self.comboWave.currentText():
            switch_voltage = float(source.value) if self.btnSwitch.isChecked() else 0.0
            waveform = f"DC {switch_voltage:g}"
        elif "Quadrada" in self.comboWave.currentText():
            period = 1.0 / frequency
            waveform = f"PULSE(0 {float(source.value):g} 0 1u 1u {period / 2:g} {period:g})"
        elif "Senoidal" in self.comboWave.currentText():
            waveform = f"SIN(0 {float(source.value):g} {frequency:g})"
        else:
            waveform = (
                f"PULSE(0 {float(source.value):g} 2m 1u 1u "
                f"{stop_time:g} {2 * stop_time:g})"
            )
        spice_components = [
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
        for index, item in enumerate(ordered):
            model = item.model
            last = index == len(ordered) - 1
            spice_components.append(
                PySpiceComponentModel(
                    name=model.name,
                    comp_type=model.comp_type,
                    value=float(model.value),
                    unit=model.unit,
                    node1=node,
                    node2=0 if last else node + 1,
                )
            )
            if not last:
                node += 1
        circuit_model = PySpiceCircuitModel(
            title=f"Circuito {self.circuit_type}",
            components=spice_components,
            transient=f".tran 0 {stop_time:g}",
        )
        pyspice_circuit = PySpiceCircuit(circuit_model.title)
        for component in circuit_model.components:
            component_name = component.name[1:]
            if component.comp_type == "V":
                pyspice_circuit.V(
                    component_name,
                    component.node1,
                    component.node2,
                    component.waveform,
                )
            else:
                getattr(pyspice_circuit, component.comp_type)(
                    component_name,
                    component.node1,
                    component.node2,
                    component.value,
                )
        netlist = str(pyspice_circuit).rstrip()
        self.spiceOutput.setPlainText(
            f"{netlist}\n{circuit_model.transient}\n.end"
        )
        self.set_status(
            "Circuito PySpice construído e netlist transiente gerado. "
            "Para executar no NgSpice, instale o motor NgSpice no sistema."
        )

    def export_schemdraw(self):
        filename, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Exportar esquemático", "esquematico.svg", "SVG (*.svg)"
        )
        if not filename:
            return
        if not filename.lower().endswith(".svg"):
            filename += ".svg"
        try:
            with schemdraw.Drawing(file=filename, show=False) as drawing:
                for item in self.components:
                    model = item.model
                    if model.comp_type == "V":
                        drawing += elm.SourcePulse().up().label(f"{model.name}\n{model.value}V")
                    elif model.comp_type == "R":
                        drawing += elm.Resistor().right().label(f"{model.name}\n{model.value}Ω")
                    elif model.comp_type == "L":
                        drawing += elm.Inductor().right().label(f"{model.name}\n{model.value}H")
                    else:
                        drawing += elm.Capacitor().down().label(f"{model.name}\n{model.value}F")
                drawing += elm.Ground()
        except (OSError, ValueError, AttributeError) as exc:
            QtWidgets.QMessageBox.critical(self, "Falha na exportação", str(exc))
            return
        self.set_status(f"Esquemático exportado: {filename}")

    def save_project(self):
        filename, _ = QtWidgets.QFileDialog.getSaveFileName(
            self,
            "Salvar projeto JSON",
            self._project_path or "",
            "Projeto PyEDA (*.json)",
        )
        if not filename:
            return
        if not filename.lower().endswith(".json"):
            filename += ".json"
        project = CircuitProjectModel(
            circuit_type=self.circuit_type,
            components=[
                CircuitProjectComponent(**item.model.model_dump())
                for item in self.components
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
        self.set_status(f"Projeto salvo: {filename}")

    def import_project(self):
        filename, _ = QtWidgets.QFileDialog.getOpenFileName(
            self, "Importar projeto JSON", "", "Projeto PyEDA (*.json)"
        )
        if not filename:
            return
        try:
            with open(filename, encoding="utf-8") as file:
                project = CircuitProjectModel.model_validate(json.load(file))
            self.load_project_model(project)
        except (OSError, UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            QtWidgets.QMessageBox.critical(self, "Falha ao importar", str(exc))
            return
        self._project_path = filename
        self.set_status(f"Projeto importado: {filename}")

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
                component.name,
            )
            item.setRotation(component.rotation)
        for wire in project.wires:
            self._add_wire(
                self.components[wire.start_component],
                wire.start_terminal,
                self.components[wire.end_component],
                wire.end_terminal,
            )
        self.run_simulation(show_errors=False)


class OscilloscopeWidget(QtWidgets.QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.t = np.array([])
        self.v_in = np.array([])
        self.v_out = np.array([])
        self.current = np.array([])
        self.output_label = "Vout"
        self.cursor_idx = 0

    def set_data(self, t, v_in, v_out, current=None, output_label="Vout"):
        self.t = np.asarray(t, dtype=float)
        self.v_in = np.asarray(v_in, dtype=float)
        self.v_out = np.asarray(v_out, dtype=float)
        self.current = np.asarray(current if current is not None else [], dtype=float)
        self.output_label = output_label
        if not (len(self.t) == len(self.v_in) == len(self.v_out)) or (
            len(self.current) not in (0, len(self.t))
        ):
            self.t = self.v_in = self.v_out = self.current = np.array([])
        self.cursor_idx = 0
        self.update()

    def step_cursor(self):
        if len(self.t):
            self.cursor_idx = (self.cursor_idx + 2) % len(self.t)
            self.update()

    def paintEvent(self, _event):
        del _event
        painter = QtGui.QPainter(self)
        painter.setRenderHint(QtGui.QPainter.RenderHint.Antialiasing)
        width, height = max(self.width(), 1), max(self.height(), 1)
        painter.fillRect(0, 0, width, height, QtGui.QColor("#111618"))
        painter.setPen(QtGui.QPen(QtGui.QColor("#223035"), 1))
        for x in range(0, width, 40):
            painter.drawLine(x, 0, x, height)
        for y in range(0, height, 30):
            painter.drawLine(0, y, width, y)
        if len(self.t) < 2:
            painter.setPen(QtGui.QColor("#888888"))
            painter.drawText(20, 30, "Osciloscópio aguardando simulação...")
            return

        voltage_top = 38.0
        voltage_height = height * 0.48
        current_top = height * 0.65
        current_height = height * 0.25
        voltage_max = max(
            float(np.max(np.abs(self.v_in))),
            float(np.max(np.abs(self.v_out))),
            1.0,
        )
        current_max = (
            max(float(np.max(np.abs(self.current))), 1e-9)
            if len(self.current) == len(self.t)
            else 1.0
        )

        def draw_trace(data, color, top, chart_height, maximum):
            painter.setPen(QtGui.QPen(QtGui.QColor(color), 2))
            path = QtGui.QPainterPath()
            for index, value in enumerate(data):
                point = QtCore.QPointF(
                    index / (len(data) - 1) * width,
                    top + chart_height / 2 - value / maximum * chart_height / 2,
                )
                if index == 0:
                    path.moveTo(point)
                else:
                    path.lineTo(point)
            painter.drawPath(path)

        painter.setPen(QtGui.QPen(QtGui.QColor("#29384d"), 1))
        painter.drawLine(
            0,
            int(voltage_top + voltage_height),
            width,
            int(voltage_top + voltage_height),
        )
        painter.drawLine(0, int(current_top), width, int(current_top))
        draw_trace(self.v_in, "#63d9ff", voltage_top, voltage_height, voltage_max)
        draw_trace(self.v_out, "#ffbd69", voltage_top, voltage_height, voltage_max)
        if len(self.current) == len(self.t):
            draw_trace(
                self.current,
                "#91d6b0",
                current_top,
                current_height,
                current_max,
            )
        self.cursor_idx = min(self.cursor_idx, len(self.t) - 1)
        cursor_x = self.cursor_idx / (len(self.t) - 1) * width
        painter.setPen(QtGui.QPen(QtGui.QColor("#ff3366"), 1, QtCore.Qt.PenStyle.DashLine))
        painter.drawLine(int(cursor_x), int(voltage_top), int(cursor_x), height)
        painter.setFont(QtGui.QFont("Consolas", 9))
        painter.setPen(QtGui.QColor("#63d9ff"))
        painter.drawText(15, 20, f"Vin: {self.v_in[self.cursor_idx]:.2f} V")
        painter.setPen(QtGui.QColor("#ffbd69"))
        painter.drawText(
            160,
            20,
            f"{self.output_label}: {self.v_out[self.cursor_idx]:.2f} V",
        )
        painter.setPen(QtGui.QColor("#b7c5da"))
        painter.drawText(
            max(width - 145, 300),
            20,
            f"t = {self.t[self.cursor_idx]:.4g} s",
        )
        if len(self.current) == len(self.t):
            painter.setPen(QtGui.QColor("#91d6b0"))
            painter.drawText(
                15,
                int(current_top + 15),
                f"Corrente I: {self.current[self.cursor_idx]:.5g} A",
            )
