"""Numerical models for series RC, RL, RLC circuits and binary JK counters."""

from __future__ import annotations

import ast
import math
from dataclasses import dataclass
from itertools import product
from os import PathLike
from pathlib import Path
from typing import Literal, Mapping, Sequence

import numpy as np
import sympy as sp
from PySpice.Logging.Logging import setup_logging
from PySpice.Spice.Netlist import Circuit
from PySpice.Unit import u_F, u_H, u_Ohm, u_V, u_s
from scipy.integrate import solve_ivp

CircuitKind = Literal["RC", "RL", "RLC"]
Direction = Literal["UP", "DOWN"]
SwitchEvent = tuple[float, bool]


setup_logging()


@dataclass(frozen=True)
class TransientResult:
    time: np.ndarray
    source_voltage: np.ndarray
    resistor_voltage: np.ndarray
    capacitor_voltage: np.ndarray
    inductor_voltage: np.ndarray
    current: np.ndarray
    capacitor_energy: np.ndarray
    inductor_energy: np.ndarray


@dataclass(frozen=True)
class SeriesCircuitConfig:
    circuit: CircuitKind
    resistance: float
    inductance: float = 1.0
    capacitance: float = 1e-3
    source_voltage: float = 5.0
    duration: float = 1.0
    samples: int = 1200

    def __post_init__(self) -> None:
        if self.circuit not in ("RC", "RL", "RLC"):
            raise ValueError(f"Unsupported circuit: {self.circuit}")
        object.__setattr__(
            self, "resistance", _positive_finite("resistance", self.resistance)
        )
        object.__setattr__(
            self, "source_voltage", _finite("source_voltage", self.source_voltage)
        )
        object.__setattr__(
            self, "duration", _positive_finite("duration", self.duration)
        )
        if (
            isinstance(self.samples, bool)
            or not isinstance(self.samples, int)
            or self.samples < 2
        ):
            raise ValueError("samples must be an integer of at least 2.")
        if self.circuit in ("RL", "RLC"):
            value = _positive_finite("inductance", self.inductance)
        else:
            value = _finite("inductance", self.inductance)
        object.__setattr__(self, "inductance", value)
        if self.circuit in ("RC", "RLC"):
            value = _positive_finite("capacitance", self.capacitance)
        else:
            value = _finite("capacitance", self.capacitance)
        object.__setattr__(self, "capacitance", value)


@dataclass(frozen=True)
class TruthTableRow:
    inputs: tuple[int, ...]
    outputs: tuple[int, ...]


@dataclass(frozen=True)
class KarnaughMap:
    row_variables: tuple[str, ...]
    column_variables: tuple[str, ...]
    row_labels: tuple[str, ...]
    column_labels: tuple[str, ...]
    values: tuple[tuple[int, ...], ...]


@dataclass(frozen=True)
class LogicFunctionAnalysis:
    name: str
    expression: str
    simplified: str
    minterms: tuple[int, ...]
    karnaugh_map: KarnaughMap


@dataclass(frozen=True)
class CombinationalAnalysis:
    input_names: tuple[str, ...]
    output_names: tuple[str, ...]
    truth_table: tuple[TruthTableRow, ...]
    functions: tuple[LogicFunctionAnalysis, ...]


def simulate_series_circuit(
    circuit: CircuitKind,
    *,
    resistance: float,
    inductance: float = 1.0,
    capacitance: float = 1e-3,
    source_voltage: float = 5.0,
    duration: float = 1.0,
    samples: int = 1200,
    switch_events: Sequence[SwitchEvent] | None = None,
    initial_state: Sequence[float] | None = None,
) -> TransientResult:
    """Solve a series circuit with a piecewise-constant, ideal source switch.

    The state is capacitor voltage for RC, inductor current for RL, and
    (inductor current, capacitor voltage) for RLC. Switch events are
    ``(time_seconds, is_closed)`` pairs and must begin at time zero.
    """
    if circuit not in ("RC", "RL", "RLC"):
        raise ValueError(f"Unsupported circuit: {circuit}")

    resistance = _positive_finite("resistance", resistance)
    source_voltage = _finite("source_voltage", source_voltage)
    duration = _positive_finite("duration", duration)
    if isinstance(samples, bool) or not isinstance(samples, int) or samples < 2:
        raise ValueError("samples must be an integer of at least 2.")

    if circuit in ("RL", "RLC"):
        inductance = _positive_finite("inductance", inductance)
    else:
        inductance = _finite("inductance", inductance)
    if circuit in ("RC", "RLC"):
        capacitance = _positive_finite("capacitance", capacitance)
    else:
        capacitance = _finite("capacitance", capacitance)

    events = _validate_switch_events(switch_events, duration)
    state_length = 2 if circuit == "RLC" else 1
    state = (
        np.zeros(state_length, dtype=float)
        if initial_state is None
        else np.asarray(initial_state, dtype=float)
    )
    if state.shape != (state_length,) or not np.all(np.isfinite(state)):
        raise ValueError(
            f"{circuit} initial_state must contain {state_length} finite value(s)."
        )
    state = state.copy()

    characteristic_times = []
    if circuit in ("RC", "RLC"):
        characteristic_times.append(resistance * capacitance)
    if circuit in ("RL", "RLC"):
        characteristic_times.append(inductance / resistance)
    if circuit == "RLC":
        characteristic_times.append(math.sqrt(inductance * capacitance))
    minimum_step = duration / 200_000
    max_step = max(
        minimum_step,
        min(
            duration / max(samples, 200),
            min(characteristic_times) / 30,
        ),
    )

    def derivatives(_time: float, values: np.ndarray, voltage: float) -> list[float]:
        del _time
        if circuit == "RC":
            capacitor_v = values[0]
            return [(voltage - capacitor_v) / (resistance * capacitance)]
        if circuit == "RL":
            inductor_i = values[0]
            return [(voltage - resistance * inductor_i) / inductance]
        inductor_i, capacitor_v = values
        return [
            (voltage - resistance * inductor_i - capacitor_v) / inductance,
            inductor_i / capacitance,
        ]

    base_time = np.linspace(0.0, duration, samples)
    boundaries = sorted(
        {0.0, duration, *(event[0] for event in events if 0 < event[0] < duration)}
    )
    all_times: list[np.ndarray] = []
    all_states: list[np.ndarray] = []
    event_index = 0
    switch_closed = False

    for segment_index, (start, end) in enumerate(zip(boundaries, boundaries[1:])):
        while event_index < len(events) and events[event_index][0] <= start:
            switch_closed = events[event_index][1]
            event_index += 1
        segment_times = base_time[(base_time >= start) & (base_time < end)]
        evaluation_times = np.unique(
            np.concatenate((segment_times, np.array([start, end])))
        )
        segment_voltage = source_voltage if switch_closed else 0.0
        solution = solve_ivp(
            lambda time, values: derivatives(time, values, segment_voltage),
            (start, end),
            state,
            t_eval=evaluation_times,
            method="LSODA",
            rtol=1e-8,
            atol=1e-10,
            max_step=max_step,
        )
        if not solution.success or solution.y.shape[1] != len(evaluation_times):
            raise RuntimeError(f"Transient solver failed: {solution.message}")
        state = solution.y[:, -1]
        if segment_index < len(boundaries) - 2:
            all_times.append(solution.t[:-1])
            all_states.append(solution.y[:, :-1])
        else:
            all_times.append(solution.t)
            all_states.append(solution.y)

    time = np.concatenate(all_times)
    states = np.concatenate(all_states, axis=1)
    event_times = np.asarray([event[0] for event in events])
    event_closed = np.asarray([event[1] for event in events])
    active_events = np.searchsorted(event_times, time, side="right") - 1
    source = np.where(event_closed[active_events], source_voltage, 0.0)

    if circuit == "RC":
        capacitor_v = states[0]
        current = (source - capacitor_v) / resistance
        resistor_v = resistance * current
        inductor_v = np.zeros_like(time)
        capacitor_energy = 0.5 * capacitance * capacitor_v**2
        inductor_energy = np.zeros_like(time)
    elif circuit == "RL":
        current = states[0]
        resistor_v = resistance * current
        inductor_v = source - resistor_v
        capacitor_v = np.zeros_like(time)
        capacitor_energy = np.zeros_like(time)
        inductor_energy = 0.5 * inductance * current**2
    else:
        current, capacitor_v = states
        resistor_v = resistance * current
        inductor_v = source - resistor_v - capacitor_v
        capacitor_energy = 0.5 * capacitance * capacitor_v**2
        inductor_energy = 0.5 * inductance * current**2

    return TransientResult(
        time=time,
        source_voltage=source,
        resistor_voltage=resistor_v,
        capacitor_voltage=capacitor_v,
        inductor_voltage=inductor_v,
        current=current,
        capacitor_energy=capacitor_energy,
        inductor_energy=inductor_energy,
    )


def _finite(name: str, value: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} must be a finite number.") from exc
    if not math.isfinite(number):
        raise ValueError(f"{name} must be a finite number.")
    return number


def _positive_finite(name: str, value: float) -> float:
    number = _finite(name, value)
    if number <= 0:
        raise ValueError(f"{name} must be greater than zero.")
    return number


def _validate_switch_events(
    events: Sequence[SwitchEvent] | None, duration: float
) -> list[SwitchEvent]:
    validated = list(events) if events is not None else [(0.0, True)]
    if not validated:
        raise ValueError("switch_events must start with an event at time zero.")
    result: list[SwitchEvent] = []
    previous_time = -1.0
    for event in validated:
        if not isinstance(event, (tuple, list)) or len(event) != 2:
            raise ValueError("Each switch event must be a (time, closed) pair.")
        event_time = _finite("switch event time", event[0])
        if event_time < 0 or event_time > duration or event_time <= previous_time:
            raise ValueError(
                "Switch event times must be strictly increasing within the simulation."
            )
        if not isinstance(event[1], (bool, np.bool_)):
            raise ValueError(
                "Switch event state must be True (closed) or False (open)."
            )
        result.append((event_time, bool(event[1])))
        previous_time = event_time
    if result[0][0] != 0:
        raise ValueError("switch_events must start with an event at time zero.")
    return result


# Divisor de tens~ao e rodar operando analise de malhas e analise nodal como em


class JKCounter:
    """Synchronous binary JK counter represented as a finite-state machine."""

    def __init__(
        self,
        bit_count: int,
        direction: Direction = "UP",
        initial_state: int = 0,
    ):
        if (
            isinstance(bit_count, bool)
            or not isinstance(bit_count, int)
            or bit_count < 1
        ):
            raise ValueError("bit_count must be a positive integer.")
        if direction not in ("UP", "DOWN"):
            raise ValueError("direction must be 'UP' or 'DOWN'.")
        if (
            isinstance(initial_state, bool)
            or not isinstance(initial_state, int)
            or not 0 <= initial_state < 1 << bit_count
        ):
            raise ValueError("initial_state does not fit in bit_count bits.")
        self.bit_count = bit_count
        self.direction: Direction = direction
        self.state = initial_state

    @property
    def modulus(self) -> int:
        return 1 << self.bit_count

    @property
    def bits(self) -> str:
        return format(self.state, f"0{self.bit_count}b")

    def reset(self) -> str:
        self.state = 0
        return self.bits

    def clock(self) -> str:
        increment = 1 if self.direction == "UP" else -1
        self.state = (self.state + increment) % self.modulus
        return self.bits

    def transition_table(self) -> list[dict[str, str | int]]:
        """Return every state transition and JK excitation in MSB-first order."""
        increment = 1 if self.direction == "UP" else -1
        rows = []
        for current in range(self.modulus):
            following = (current + increment) % self.modulus
            current_bits = format(current, f"0{self.bit_count}b")
            next_bits = format(following, f"0{self.bit_count}b")
            j_values = []
            k_values = []
            for old, new in zip(current_bits, next_bits):
                if old == "0":
                    j_values.append(new)
                    k_values.append("X")
                else:
                    j_values.append("X")
                    k_values.append("0" if new == "1" else "1")
            rows.append(
                {
                    "state": current_bits,
                    "J": "".join(j_values),
                    "K": "".join(k_values),
                    "next_state": next_bits,
                    "decimal": following,
                }
            )
        return rows


def simulate_config(
    config: SeriesCircuitConfig,
    *,
    backend: Literal["scipy", "pyspice"] = "pyspice",
    switch_events: Sequence[SwitchEvent] | None = None,
) -> TransientResult:
    """Run with PySpice/NgSpice by default; SciPy remains an explicit option."""
    if backend == "pyspice":
        return simulate_series_circuit_pyspice(config, switch_events=switch_events)
    if backend == "scipy":
        return simulate_series_circuit(
            config.circuit,
            resistance=config.resistance,
            inductance=config.inductance,
            capacitance=config.capacitance,
            source_voltage=config.source_voltage,
            duration=config.duration,
            samples=config.samples,
            switch_events=switch_events,
        )
    raise ValueError("backend must be 'scipy' or 'pyspice'.")


def simulate_series_circuit_pyspice(
    config: SeriesCircuitConfig,
    *,
    switch_events: Sequence[SwitchEvent] | None = None,
) -> TransientResult:
    """Simulate a series RC, RL, or RLC circuit with PySpice and NgSpice.

    Switching transitions use a short finite rise time, bounded by the sample
    interval and the distance between events.
    """
    events = _validate_switch_events(switch_events, config.duration)
    gaps = [
        right[0] - left[0]
        for left, right in zip(events, events[1:])
        if right[0] > left[0]
    ]
    edge_time = config.duration / (config.samples * 10)
    if gaps:
        edge_time = min(edge_time, min(gaps) / 4)

    source_points: list[tuple[float, float]] = [(0.0, 0.0)]
    switch_closed = events[0][1]
    current_voltage = config.source_voltage if switch_closed else 0.0
    source_points.append((edge_time, current_voltage))
    for event_time, switch_closed in events[1:]:
        if event_time >= config.duration:
            continue
        next_voltage = config.source_voltage if switch_closed else 0.0
        source_points.extend(
            ((event_time, current_voltage), (event_time + edge_time, next_voltage))
        )
        current_voltage = next_voltage
    if source_points[-1][0] < config.duration:
        source_points.append((config.duration, current_voltage))

    circuit = Circuit(f"Series {config.circuit} circuit")
    circuit.PieceWiseLinearVoltageSource(
        "input",
        "n0",
        circuit.gnd,
        values=[(time @ u_s, voltage @ u_V) for time, voltage in source_points],
    )
    circuit.R("1", "n0", "n1", config.resistance @ u_Ohm)
    if config.circuit == "RC":
        circuit.C("1", "n1", circuit.gnd, config.capacitance @ u_F)
        capacitor_node = "n1"
    elif config.circuit == "RL":
        circuit.L("1", "n1", circuit.gnd, config.inductance @ u_H)
        capacitor_node = None
    else:
        circuit.L("1", "n1", "n2", config.inductance @ u_H)
        circuit.C("1", "n2", circuit.gnd, config.capacitance @ u_F)
        capacitor_node = "n2"

    simulator = circuit.simulator(temperature=25, nominal_temperature=25)
    analysis = simulator.transient(
        step_time=config.duration / (config.samples - 1) @ u_s,
        end_time=config.duration @ u_s,
        use_initial_condition=True,
    )
    time = np.asarray(analysis.time, dtype=float)
    source = np.asarray(analysis["n0"], dtype=float)
    current = -np.asarray(analysis["vinput"], dtype=float)
    resistor_voltage = config.resistance * current
    capacitor_voltage = (
        np.asarray(analysis[capacitor_node], dtype=float)
        if capacitor_node is not None
        else np.zeros_like(time)
    )
    inductor_voltage = source - resistor_voltage - capacitor_voltage
    capacitor_energy = 0.5 * config.capacitance * capacitor_voltage**2
    inductor_energy = 0.5 * config.inductance * current**2
    if config.circuit == "RC":
        inductor_voltage = np.zeros_like(time)
        inductor_energy = np.zeros_like(time)
    elif config.circuit == "RL":
        capacitor_energy = np.zeros_like(time)

    return TransientResult(
        time=time,
        source_voltage=source,
        resistor_voltage=resistor_voltage,
        capacitor_voltage=capacitor_voltage,
        inductor_voltage=inductor_voltage,
        current=current,
        capacitor_energy=capacitor_energy,
        inductor_energy=inductor_energy,
    )


def symbolic_transfer_function(config: SeriesCircuitConfig) -> sp.Expr:
    """Return Vc/Vin for RC/RLC, or I/Vin for RL, in the Laplace domain."""
    resistance, inductance, capacitance, s = sp.symbols("R L C s", positive=True)
    if config.circuit == "RC":
        return 1 / (1 + resistance * capacitance * s)
    if config.circuit == "RL":
        return 1 / (resistance + inductance * s)
    return 1 / (1 + resistance * capacitance * s + inductance * capacitance * s**2)


def plot_transient(
    result: TransientResult,
    *,
    output_path: str | PathLike[str] | None = None,
    show: bool = False,
):
    """Plot circuit voltages, current, and stored energy; return the figure."""
    import matplotlib.pyplot as plt

    figure, axes = plt.subplots(3, 1, sharex=True, figsize=(10, 8))
    axes[0].plot(result.time, result.source_voltage, label="Fonte")
    axes[0].plot(result.time, result.resistor_voltage, label="Resistor")
    axes[0].plot(result.time, result.inductor_voltage, label="Indutor")
    axes[0].plot(result.time, result.capacitor_voltage, label="Capacitor")
    axes[0].set_ylabel("Tensão (V)")
    axes[0].legend()
    axes[1].plot(result.time, result.current, color="tab:purple")
    axes[1].set_ylabel("Corrente (A)")
    axes[2].plot(result.time, result.capacitor_energy, label="Capacitor")
    axes[2].plot(result.time, result.inductor_energy, label="Indutor")
    axes[2].set_ylabel("Energia (J)")
    axes[2].set_xlabel("Tempo (s)")
    axes[2].legend()
    figure.tight_layout()
    if output_path is not None:
        figure.savefig(Path(output_path))
    if show:
        plt.show()
    return figure, axes


def draw_series_circuit(config: SeriesCircuitConfig) -> bytes:
    """Render a labeled series-circuit schematic as SVG bytes."""
    import schemdraw
    import schemdraw.elements as elm

    drawing = schemdraw.Drawing(show=False, canvas="svg")
    drawing += elm.SourceV().up().label(f"Vin {config.source_voltage:g} V")
    drawing += elm.Resistor().right().label(f"R {config.resistance:g} ohm")
    if config.circuit in ("RL", "RLC"):
        drawing += elm.Inductor().right().label(f"L {config.inductance:g} H")
    if config.circuit in ("RC", "RLC"):
        drawing += elm.Capacitor().right().label(f"C {config.capacitance:g} F")
    drawing += elm.Ground()
    drawing.draw(show=False)
    return drawing.get_imagedata("svg")


def analyze_combinational_circuit(
    inputs: Sequence[str],
    expressions: Mapping[str, str],
) -> CombinationalAnalysis:
    """Build truth tables, simplified SOP expressions, and Karnaugh maps.

    Expressions accept names, 0/1, parentheses, ``~``/NOT, ``&``/AND,
    ``|``/OR, and ``^``/XOR. Parsing is restricted to Boolean syntax.
    """
    input_names = tuple(inputs)
    output_names = tuple(expressions)
    if not 1 <= len(input_names) <= 4:
        raise ValueError("Karnaugh maps support between 1 and 4 inputs.")
    if len(set(input_names)) != len(input_names) or any(
        len(name) != 1 or not name.isalpha() or not name.isupper()
        for name in input_names
    ):
        raise ValueError("Input names must be unique uppercase letters.")
    if not output_names or any(not name.isidentifier() for name in output_names):
        raise ValueError("Provide at least one output with a valid identifier name.")
    symbols = {name: sp.Symbol(name) for name in input_names}
    parsed = {
        name: _parse_boolean_expression(expression, symbols)
        for name, expression in expressions.items()
    }

    assignments = tuple(product((0, 1), repeat=len(input_names)))
    evaluated = {
        assignment: tuple(
            int(
                bool(
                    expression.subs(dict(zip(symbols.values(), map(bool, assignment))))
                )
            )
            for expression in parsed.values()
        )
        for assignment in assignments
    }
    truth_table = tuple(
        TruthTableRow(inputs=assignment, outputs=evaluated[assignment])
        for assignment in assignments
    )

    functions: list[LogicFunctionAnalysis] = []
    split = len(input_names) // 2
    row_variables = input_names[:split]
    column_variables = input_names[split:]
    row_labels = _gray_labels(len(row_variables))
    column_labels = _gray_labels(len(column_variables))
    for output_index, (name, expression) in enumerate(parsed.items()):
        simplified = sp.simplify_logic(expression, form="dnf")
        minterms = tuple(
            index
            for index, assignment in enumerate(assignments)
            if evaluated[assignment][output_index]
        )
        values = tuple(
            tuple(
                evaluated[
                    _kmap_assignment(
                        input_names, row_variables, row, column_variables, column
                    )
                ][output_index]
                for column in column_labels
            )
            for row in row_labels
        )
        functions.append(
            LogicFunctionAnalysis(
                name=name,
                expression=str(expressions[name]),
                simplified=str(simplified),
                minterms=minterms,
                karnaugh_map=KarnaughMap(
                    row_variables=row_variables,
                    column_variables=column_variables,
                    row_labels=row_labels,
                    column_labels=column_labels,
                    values=values,
                ),
            )
        )
    return CombinationalAnalysis(
        input_names=input_names,
        output_names=output_names,
        truth_table=truth_table,
        functions=tuple(functions),
    )


def draw_logic_circuit(analysis: CombinationalAnalysis, output_name: str) -> bytes:
    """Render one minimized combinational function as an SVG logic diagram."""
    from schemdraw.parsing import logicparse

    function = _get_logic_function(analysis, output_name)
    expression = _schemdraw_boolean_expression(
        _parse_boolean_expression(
            function.simplified,
            {name: sp.Symbol(name) for name in analysis.input_names},
        ),
        analysis.input_names[0],
    )
    drawing = logicparse(
        expression,
        outlabel=output_name,
        gateH=0.8,
        gateW=1.1,
    )
    drawing.draw(show=False, canvas="svg")
    return drawing.get_imagedata("svg")


def draw_karnaugh_map(analysis: CombinationalAnalysis, output_name: str) -> bytes:
    """Render an output's Karnaugh map as SVG."""
    import schemdraw
    from schemdraw import logic

    function = _get_logic_function(analysis, output_name)
    table_values = [
        (
            "".join(map(str, row.inputs)),
            str(row.outputs[analysis.output_names.index(output_name)]),
        )
        for row in analysis.truth_table
    ]
    drawing = schemdraw.Drawing(show=False, canvas="svg")
    drawing += logic.Kmap(
        names="".join(analysis.input_names),
        truthtable=table_values,
    )
    drawing.draw(show=False)
    return drawing.get_imagedata("svg")


def _parse_boolean_expression(
    expression: str,
    symbols: Mapping[str, sp.Symbol],
) -> sp.logic.boolalg.Boolean:
    import re

    operators = {"AND": "&", "OR": "|", "XOR": "^", "NOT": "~"}
    normalized = re.sub(
        r"\b(?:AND|OR|XOR|NOT)\b",
        lambda match: operators[match.group().upper()],
        expression,
        flags=re.IGNORECASE,
    )
    try:
        root = ast.parse(normalized, mode="eval").body
    except SyntaxError as exc:
        raise ValueError(f"Invalid Boolean expression: {expression!r}.") from exc

    def convert(node: ast.AST) -> sp.logic.boolalg.Boolean:
        if isinstance(node, ast.Name):
            if node.id not in symbols:
                raise ValueError(f"Unknown input {node.id!r} in {expression!r}.")
            return symbols[node.id]
        if isinstance(node, ast.Constant) and node.value in (0, 1, False, True):
            return sp.true if bool(node.value) else sp.false
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.Invert, ast.Not)):
            return sp.Not(convert(node.operand))
        if isinstance(node, ast.BinOp):
            left, right = convert(node.left), convert(node.right)
            if isinstance(node.op, ast.BitAnd):
                return sp.And(left, right)
            if isinstance(node.op, ast.BitOr):
                return sp.Or(left, right)
            if isinstance(node.op, ast.BitXor):
                return sp.Xor(left, right)
        if isinstance(node, ast.BoolOp):
            values = [convert(value) for value in node.values]
            if isinstance(node.op, ast.And):
                return sp.And(*values)
            if isinstance(node.op, ast.Or):
                return sp.Or(*values)
        raise ValueError(f"Unsupported Boolean syntax in {expression!r}.")

    return convert(root)


def _gray_labels(bit_count: int) -> tuple[str, ...]:
    return tuple(
        format(value ^ (value >> 1), f"0{bit_count}b") if bit_count else ""
        for value in range(1 << bit_count)
    )


def _kmap_assignment(
    input_names: tuple[str, ...],
    row_variables: tuple[str, ...],
    row: str,
    column_variables: tuple[str, ...],
    column: str,
) -> tuple[int, ...]:
    values = dict(zip(row_variables, map(int, row)))
    values.update(zip(column_variables, map(int, column)))
    return tuple(values[name] for name in input_names)


def _get_logic_function(
    analysis: CombinationalAnalysis,
    output_name: str,
) -> LogicFunctionAnalysis:
    for function in analysis.functions:
        if function.name == output_name:
            return function
    raise ValueError(f"Unknown output {output_name!r}.")


def _schemdraw_boolean_expression(
    expression: sp.logic.boolalg.Boolean,
    input_name: str,
) -> str:
    if expression is sp.true:
        return f"({input_name} or not {input_name})"
    if expression is sp.false:
        return f"({input_name} and not {input_name})"
    if isinstance(expression, sp.Symbol):
        return str(expression)
    if expression.func == sp.Not:
        return f"not ({_schemdraw_boolean_expression(expression.args[0], input_name)})"
    operator = {
        sp.And: "and",
        sp.Or: "or",
        sp.Xor: "xor",
    }.get(expression.func)
    if operator is None:
        raise ValueError(f"Unsupported SymPy Boolean operation: {expression.func}.")
    rendered = [
        _schemdraw_boolean_expression(argument, input_name)
        for argument in expression.args
    ]
    return "(" + f" {operator} ".join(rendered) + ")"
