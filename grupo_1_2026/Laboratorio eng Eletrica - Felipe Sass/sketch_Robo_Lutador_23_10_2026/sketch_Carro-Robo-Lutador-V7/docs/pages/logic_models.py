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
