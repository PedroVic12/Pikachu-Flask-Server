import importlib.util
import math
import os
import sys
from pathlib import Path

import pytest

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

SCRIPT = Path(__file__).with_name("simulando_circuitos_digitais_3bits.py")
sys.path.insert(0, str(SCRIPT.parent))
SPEC = importlib.util.spec_from_file_location("circuit_app_under_test", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
circuit_app = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = circuit_app
SPEC.loader.exec_module(circuit_app)

from PyQt6 import QtSvgWidgets, QtWidgets
from app import MainWindow
from pages.sequential_logic import (
    analyze_sequential_circuit,
    default_jk_expressions,
    render_logic_expression_svg,
)


@pytest.fixture(scope="module")
def _qt_app():
    return QtWidgets.QApplication.instance() or QtWidgets.QApplication([])


@pytest.fixture
def main_window(_qt_app):
    window = circuit_app.MainApp()
    yield window
    window.close()


@pytest.mark.parametrize("kind", ["RC", "RL", "RLC"])
def test_analog_presets_and_transient_solver(main_window, kind):
    main_window.load_preset(kind)

    assert main_window.circuit_type == kind
    assert len(main_window.engine.t) == 600
    assert all(math.isfinite(value) for value in main_window.engine.current)
    assert len(main_window.wires) == len(main_window.components)

    source, passive_components = main_window._series_topology()
    assert source.comp_type == "V"
    assert len(passive_components) == len(main_window.components) - 1
    assert all(wire.flow_sign == 1 for wire in main_window.wires)


def test_wire_direction_follows_source_positive_to_negative(main_window):
    main_window.load_preset("RC")
    wire = main_window.wires[0]
    wire.item1, wire.item2 = wire.item2, wire.item1
    wire.term1, wire.term2 = wire.term2, wire.term1

    main_window._series_topology()

    assert wire.flow_sign == -1


def test_jk_counter_counts_up_and_down_with_wraparound():
    counter = circuit_app.JKCounterModel(bit_count=3, direction="UP")
    assert [counter.clock() for _ in range(9)] == [
        "001", "010", "011", "100", "101", "110", "111", "000", "001"
    ]

    counter = circuit_app.JKCounterModel(bit_count=4, direction="DOWN")
    assert [counter.clock() for _ in range(5)] == ["1111", "1110", "1101", "1100", "1011"]
    assert all(ff.q_bar == 1 - ff.q for ff in counter.flip_flops)
    counter.set_state(3)
    assert counter.clock_with_inputs([1, 0, 1, 0], [1, 0, 1, 0]) == "0110"


def test_three_bit_example_truth_table_matches_synchronous_up_counter():
    expressions = default_jk_expressions(3, "UP")
    assert expressions == {
        "J0": "1",
        "K0": "1",
        "J1": "Q0",
        "K1": "Q0",
        "J2": "Q0 & Q1",
        "K2": "Q0 & Q1",
    }
    rows = analyze_sequential_circuit(3, expressions)
    assert [row.next_state for row in rows] == [1, 2, 3, 4, 5, 6, 7, 0]
    assert [row.j_values for row in rows] == [
        (1, 0, 0), (1, 1, 0), (1, 0, 0), (1, 1, 1),
        (1, 0, 0), (1, 1, 0), (1, 0, 0), (1, 1, 1),
    ]


def test_user_defined_boolean_functions_and_rejects_non_boolean_syntax():
    expressions = {
        "J0": "1", "K0": "1",
        "J1": "~Q0", "K1": "Q0",
        "J2": "Q1 | Q0", "K2": "Q1 ^ Q0",
    }
    rows = analyze_sequential_circuit(3, expressions)
    assert len(rows) == 8
    assert rows[0].next_state == 3
    assert rows[1].next_state == 4
    expressions["J1"] = "__import__('os').system('echo unsafe')"
    with pytest.raises(ValueError):
        analyze_sequential_circuit(3, expressions)
    expressions["J1"] = "Q3"
    with pytest.raises(ValueError, match="indisponível"):
        analyze_sequential_circuit(3, expressions)


def test_schemdraw_parser_logic_functions_and_symbols():
    expressions = {
        "J0": "Q0 NAND Q1",
        "K0": "¬Q2",
        "J1": "Q0 ⊕ Q1",
        "K1": "Q0 ∧ Q1",
        "J2": "Q0 NOR Q1",
        "K2": "Q0 XNOR Q1",
    }
    rows = analyze_sequential_circuit(3, expressions)
    assert rows[0].next_state == 5
    assert render_logic_expression_svg("Q0 NAND Q1", "J0").startswith(b"<svg")


def test_invalid_project_values_and_wire_references_are_rejected():
    with pytest.raises(ValueError):
        circuit_app.CircuitProjectComponent(
            name="R1\n.end", comp_type="R", value=1000, unit="Ω", x=1, y=1
        )
    with pytest.raises(ValueError):
        circuit_app.CircuitProjectComponent(
            name="R1", comp_type="R", value=float("inf"), unit="Ω", x=1, y=1
        )
    with pytest.raises(ValueError):
        circuit_app.CircuitProjectModel(
            components=[],
            wires=[
                circuit_app.CircuitProjectWire(
                    start_component=0,
                    start_terminal=1,
                    end_component=1,
                    end_terminal=2,
                )
            ],
        )


def test_json_project_round_trip_and_spice_export(main_window, tmp_path):
    main_window.load_preset("RLC")
    project = circuit_app.CircuitProjectModel(
        circuit_type=main_window.circuit_type,
        components=[
            circuit_app.CircuitProjectComponent(**item.model.model_dump())
            for item in main_window.components
        ],
        wires=[
            circuit_app.CircuitProjectWire(
                start_component=main_window.components.index(wire.item1),
                start_terminal=wire.term1,
                end_component=main_window.components.index(wire.item2),
                end_terminal=wire.term2,
            )
            for wire in main_window.wires
        ],
    )
    project_path = tmp_path / "circuit.json"
    project_path.write_text(project.model_dump_json(), encoding="utf-8")
    loaded = circuit_app.CircuitProjectModel.model_validate_json(
        project_path.read_text(encoding="utf-8")
    )
    main_window.load_project_model(loaded)
    main_window.generate_spice_netlist()

    netlist = main_window.txtSpiceOutput.toPlainText()
    assert main_window.circuit_type == "RLC"
    assert "L1 2 3 0.01" in netlist
    assert "C1 3 0 1e-05" in netlist
    assert netlist.endswith(".end")


def test_main_app_has_distinct_analog_and_jk_screens(_qt_app):
    window = MainWindow()
    assert window.mainStack.count() == 2
    assert window.btnAnalogNav.text().endswith("Circuitos analógicos")
    assert window.btnJKNav.text().endswith("Contador FF JK")

    window.analog_page.load_preset("RLC")
    assert [item.model.comp_type for item in window.analog_page.components] == [
        "V", "R", "L", "C"
    ]
    assert len(window.analog_page.engine.current) == 600

    window.jk_page.comboBits.setCurrentIndex(1)
    window.jk_page.comboDirection.setCurrentIndex(0)
    window.jk_page.clock_counter()
    assert window.jk_page.counter.bits == "0001"
    assert window.jk_page.counterTruthTable.rowCount() == 16
    assert window.jk_page.jkTruthTable.rowCount() == 8
    assert "FF0:" in window.jk_page.lblEquations.text()
    assert len(window.jk_page.scene.items()) > 4
    assert window.jk_page.jkTablesTabs.count() == 8
    assert window.jk_page.simulationResult.rowCount() == 0
    window.jk_page.initialStateSpin.setValue(0)
    window.jk_page.clockCountSpin.setValue(16)
    window.jk_page.simulate_sequence()
    assert window.jk_page.counter.bits == "0000"
    assert window.jk_page.simulationResult.rowCount() == 17
    assert len(window.jk_page.findChildren(QtSvgWidgets.QSvgWidget)) >= 15
    window.jk_page.comboBits.setCurrentIndex(0)
    for key, expression in {
        "J0": "0", "K0": "1",
        "J1": "1", "K1": "1",
        "J2": "0", "K2": "1",
    }.items():
        window.jk_page._expression_edits[key].setText(expression)
    window.jk_page.initialStateSpin.setValue(0)
    window.jk_page.clockCountSpin.setValue(1)
    window.jk_page.simulate_sequence()
    assert window.jk_page.counter.bits == "010"
    assert window.jk_page.simulationResult.item(1, 3).text() == "010"
    window.set_active_page(1)
    assert window.mainStack.currentIndex() == 1
    window.close()


def test_manual_switch_charges_and_discharges_reactive_component(_qt_app):
    window = MainWindow()
    page = window.analog_page
    page.load_preset("RC")
    page.comboWave.setCurrentText("Chave manual (carga/descarga)")
    page.btnSwitch.setChecked(True)
    page.run_simulation()
    charged_voltage = float(page.scope.v_out[-1])

    page.btnSwitch.setChecked(False)

    assert page.btnSwitch.isEnabled()
    assert charged_voltage > 4.0
    assert page.scope.v_in.max() == 0.0
    assert page.scope.v_out[0] > page.scope.v_out[-1]
    assert page.scope.v_out[-1] < 0.1
    window.close()


def test_pyspice_netlist_is_built_from_real_circuit_objects(_qt_app):
    window = MainWindow()
    page = window.analog_page
    page.load_preset("RLC")
    page.generate_spice_netlist()

    netlist = page.spiceOutput.toPlainText()
    assert ".title Circuito RLC" in netlist
    assert "V1 1 0 PULSE(" in netlist
    assert "R1 1 2 1000" in netlist
    assert "L1 2 3 0.01" in netlist
    assert "C1 3 0 1e-05" in netlist
    assert netlist.endswith(".end")
    window.close()


def test_sidebar_collapses_at_narrow_window_width(_qt_app):
    window = MainWindow()
    window.resize(850, 700)
    window._update_sidebar()
    assert window.sidebar.width() == 72
    assert window.btnAnalogNav.text() == "◉"
    window.resize(1200, 800)
    window._update_sidebar()
    assert window.sidebar.width() == 224
    window.close()
