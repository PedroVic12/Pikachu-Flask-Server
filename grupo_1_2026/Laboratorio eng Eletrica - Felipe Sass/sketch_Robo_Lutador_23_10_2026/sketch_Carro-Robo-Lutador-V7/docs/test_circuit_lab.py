import math
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent))

from circuit_lab import JKCounter, simulate_series_circuit


def closest(result, time):
    return int(np.argmin(np.abs(result.time - time)))


def test_rc_step_matches_analytic_charge_and_discharge():
    result = simulate_series_circuit(
        "RC",
        resistance=1000,
        capacitance=100e-6,
        source_voltage=5,
        duration=1,
        samples=1001,
        switch_events=[(0, True), (0.5, False)],
    )
    at_switch = closest(result, 0.5)
    tau = 1000 * 100e-6
    expected_charge = 5 * (1 - math.exp(-0.5 / tau))
    expected_discharge = expected_charge * math.exp(-0.5 / tau)

    assert result.time[at_switch] == pytest.approx(0.5)
    assert result.capacitor_voltage[at_switch] == pytest.approx(
        expected_charge, rel=2e-5
    )
    assert result.capacitor_voltage[-1] == pytest.approx(
        expected_discharge, rel=2e-5
    )
    assert result.source_voltage[at_switch] == 0
    assert result.capacitor_energy[-1] < result.capacitor_energy[at_switch]


def test_rl_step_and_switch_off_show_inductor_current_decay():
    result = simulate_series_circuit(
        "RL",
        resistance=10,
        inductance=2,
        source_voltage=5,
        duration=2,
        samples=1001,
        switch_events=[(0, True), (1, False)],
    )
    at_switch = closest(result, 1)
    tau = 2 / 10
    expected_at_switch = 0.5 * (1 - math.exp(-1 / tau))
    expected_final = expected_at_switch * math.exp(-1 / tau)

    assert result.current[at_switch] == pytest.approx(expected_at_switch, rel=2e-5)
    assert result.current[-1] == pytest.approx(expected_final, rel=2e-5)
    assert result.inductor_voltage[-1] < 0
    assert result.inductor_energy[-1] < result.inductor_energy[at_switch]


def test_rlc_results_are_finite_and_satisfy_kirchhoffs_voltage_law():
    result = simulate_series_circuit(
        "RLC",
        resistance=20,
        inductance=0.1,
        capacitance=100e-6,
        source_voltage=5,
        duration=0.1,
        samples=501,
        switch_events=[(0, True), (0.05, False)],
    )
    assert all(
        np.isfinite(values).all()
        for values in (
            result.current,
            result.capacitor_voltage,
            result.inductor_voltage,
            result.resistor_voltage,
            result.capacitor_energy,
            result.inductor_energy,
        )
    )
    total_voltage = (
        result.resistor_voltage
        + result.inductor_voltage
        + result.capacitor_voltage
    )
    np.testing.assert_allclose(total_voltage, result.source_voltage, atol=1e-9)


@pytest.mark.parametrize(
    ("direction", "expected"),
    [
        ("UP", ["001", "010", "011", "100", "101", "110", "111", "000"]),
        ("DOWN", ["111", "110", "101", "100", "011", "010", "001", "000"]),
    ],
)
def test_three_bit_jk_counter_is_a_wrapping_state_machine(direction, expected):
    counter = JKCounter(bit_count=3, direction=direction)
    assert [counter.clock() for _ in range(8)] == expected


def test_counter_accepts_arbitrary_width_and_exposes_jk_excitation_table():
    counter = JKCounter(bit_count=5, direction="UP", initial_state=30)
    assert counter.bits == "11110"
    assert counter.clock() == "11111"
    assert counter.clock() == "00000"
    rows = counter.transition_table()
    assert len(rows) == 32
    assert rows[-1] == {
        "state": "11111",
        "J": "XXXXX",
        "K": "11111",
        "next_state": "00000",
        "decimal": 0,
    }


def test_counter_reset_and_invalid_configuration():
    counter = JKCounter(bit_count=4, direction="DOWN", initial_state=5)
    assert counter.reset() == "0000"
    with pytest.raises(ValueError):
        JKCounter(bit_count=0)
    with pytest.raises(ValueError):
        JKCounter(bit_count=3, initial_state=8)
    with pytest.raises(ValueError):
        JKCounter(bit_count=3, direction="SIDEWAYS")


@pytest.mark.parametrize(
    "kwargs",
    [
        {"resistance": 0},
        {"resistance": math.inf},
        {"duration": 0},
        {"samples": 1},
        {"switch_events": [(0, True), (0, False)]},
        {"switch_events": [(0.1, True)]},
        {"initial_state": [0, 1]},
    ],
)
def test_circuit_inputs_are_validated(kwargs):
    defaults = {
        "circuit": "RC",
        "resistance": 1000,
        "duration": 1,
        "samples": 100,
    }
    defaults.update(kwargs)
    circuit = defaults.pop("circuit")
    with pytest.raises(ValueError):
        simulate_series_circuit(circuit, **defaults)
