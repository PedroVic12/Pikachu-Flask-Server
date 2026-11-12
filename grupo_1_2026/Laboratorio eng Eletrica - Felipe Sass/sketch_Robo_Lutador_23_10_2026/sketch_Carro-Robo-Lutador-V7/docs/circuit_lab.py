"""Numerical models for series RC, RL, RLC circuits and binary JK counters."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Literal, Sequence

import numpy as np
from scipy.integrate import solve_ivp

CircuitKind = Literal["RC", "RL", "RLC"]
Direction = Literal["UP", "DOWN"]
SwitchEvent = tuple[float, bool]


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
            raise ValueError("Switch event state must be True (closed) or False (open).")
        result.append((event_time, bool(event[1])))
        previous_time = event_time
    if result[0][0] != 0:
        raise ValueError("switch_events must start with an event at time zero.")
    return result


class JKCounter:
    """Synchronous binary JK counter represented as a finite-state machine."""

    def __init__(
        self,
        bit_count: int,
        direction: Direction = "UP",
        initial_state: int = 0,
    ):
        if isinstance(bit_count, bool) or not isinstance(bit_count, int) or bit_count < 1:
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
