from itertools import product

import sympy as sp


def jk_truth_table_rows() -> list[tuple[int, int, int, int]]:
    j, k, q = sp.symbols("J K Q", boolean=True)
    q_next = sp.simplify_logic(
        sp.Or(sp.And(j, sp.Not(q)), sp.And(sp.Not(k), q)),
        form="dnf",
    )
    rows = []
    for j_value, k_value, q_value in product((0, 1), repeat=3):
        result = q_next.subs(
            {j: bool(j_value), k: bool(k_value), q: bool(q_value)}
        )
        rows.append((j_value, k_value, q_value, int(bool(result))))
    return rows


def jk_counter_equations(bit_count: int, direction: str) -> list[str]:
    if bit_count not in (3, 4):
        raise ValueError("O contador deve ter 3 ou 4 bits.")
    if direction not in ("UP", "DOWN"):
        raise ValueError("A direção deve ser UP ou DOWN.")

    q_values = sp.symbols(f"Q0:{bit_count}", boolean=True)
    equations = []
    for bit, q_value in enumerate(q_values):
        if bit == 0:
            toggle = sp.true
        elif direction == "UP":
            toggle = sp.And(*q_values[:bit])
        else:
            toggle = sp.And(*(sp.Not(value) for value in q_values[:bit]))
        q_next = sp.simplify_logic(sp.Xor(q_value, toggle), force=True)
        enable = sp.sstr(sp.simplify_logic(toggle, force=True))
        next_state = sp.sstr(q_next)
        for symbol, replacement in (("~", "¬"), ("&", " ∧ "), ("|", " ∨ "), ("^", " ⊕ ")):
            enable = enable.replace(symbol, replacement)
            next_state = next_state.replace(symbol, replacement)
        equations.append(
            f"FF{bit}: J{bit} = K{bit} = {enable}; "
            f"Q{bit}(t+1) = {next_state}"
        )
    return equations
