from functools import lru_cache

import schemdraw
from schemdraw import logic
from schemdraw.parsing import logicparse

from pages.sequential_logic import (
    BooleanExpression,
    SequentialTruthRow,
    parse_boolean_expression,
)

_LOGIC_OPERATORS = {
    "AND": "and",
    "NAND": "nand",
    "OR": "or",
    "NOR": "nor",
    "XOR": "xor",
    "XNOR": "xnor",
}


def _schemdraw_expression(expression: str) -> str:
    tree = parse_boolean_expression(expression)

    def render(node: BooleanExpression) -> str:
        if isinstance(node, str):
            return node
        if isinstance(node, int):
            return str(node)
        if len(node) == 2:
            return f"not ({render(node[1])})"
        operator, left, right = node
        return f"({render(left)} {_LOGIC_OPERATORS[operator]} {render(right)})"

    return render(tree)


@lru_cache(maxsize=64)
def render_logic_svg(expression: str, output_label: str) -> bytes:
    parser_expression = _schemdraw_expression(expression)
    if parser_expression in ("0", "1"):
        parser_expression = (
            "(Q0 and not Q0)" if parser_expression == "0" else "(Q0 or not Q0)"
        )
    drawing = logicparse(
        parser_expression,
        outlabel=output_label,
        gateH=0.8,
        gateW=1.1,
    )
    drawing.draw(show=False, canvas="svg")
    return drawing.get_imagedata("svg")


@lru_cache(maxsize=16)
def render_table_svg(markdown_table: str, column_format: str) -> bytes:
    drawing = schemdraw.Drawing(show=False, canvas="svg")
    drawing += logic.Table(markdown_table, colfmt=column_format)
    return drawing.get_imagedata("svg")


def render_kmap_svg(
    bit_count: int,
    truth_values: list[tuple[str, str]],
    groups: dict[str, dict[str, str]] | None = None,
) -> bytes:
    return _render_kmap_svg(
        bit_count,
        tuple(truth_values),
        tuple(
            sorted(
                (key, tuple(sorted(value.items())))
                for key, value in (groups or {}).items()
            )
        ),
    )


@lru_cache(maxsize=64)
def _render_kmap_svg(
    bit_count: int,
    truth_values: tuple[tuple[str, str], ...],
    groups: tuple[tuple[str, tuple[tuple[str, str], ...]], ...],
) -> bytes:
    names = "DCBA"[-bit_count:]
    drawing = schemdraw.Drawing(show=False, canvas="svg")
    drawing += logic.Kmap(
        names=names,
        truthtable=truth_values,
        groups={key: dict(style) for key, style in groups},
    )
    return drawing.get_imagedata("svg")


def logic_diagrams(
    bit_count: int, expressions: dict[str, str]
) -> list[tuple[str, bytes]]:
    return [
        (
            f"{kind}{bit} = {expressions[f'{kind}{bit}']}",
            render_logic_svg(expressions[f"{kind}{bit}"], f"{kind}{bit}"),
        )
        for bit in reversed(range(bit_count))
        for kind in ("J", "K")
    ]


def truth_table_diagrams(
    bit_count: int, rows: list[SequentialTruthRow]
) -> list[tuple[str, bytes]]:
    characteristic = [
        "| J | K | Q(t) | Q(t+1) |",
        "|---|---|------|--------|",
        "| 0 | 0 | 0 | 0 |",
        "| 0 | 0 | 1 | 1 |",
        "| 0 | 1 | 0 | 0 |",
        "| 0 | 1 | 1 | 0 |",
        "| 1 | 0 | 0 | 1 |",
        "| 1 | 0 | 1 | 1 |",
        "| 1 | 1 | 0 | 1 |",
        "| 1 | 1 | 1 | 0 |",
    ]
    excitation = [
        "| Q(t) | Q(t+1) | J | K |",
        "|------|--------|---|---|",
        "| 0 | 0 | 0 | X |",
        "| 0 | 1 | 1 | X |",
        "| 1 | 0 | X | 1 |",
        "| 1 | 1 | X | 0 |",
    ]
    headers = (
        [f"Q{bit}" for bit in reversed(range(bit_count))]
        + [f"J{bit}" for bit in reversed(range(bit_count))]
        + [f"K{bit}" for bit in reversed(range(bit_count))]
        + [f"Q{bit}+" for bit in reversed(range(bit_count))]
    )
    transitions = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        values = (
            list(map(str, reversed(row.current_bits)))
            + list(map(str, reversed(row.j_values)))
            + list(map(str, reversed(row.k_values)))
            + list(map(str, reversed(row.next_bits)))
        )
        transitions.append("| " + " | ".join(values) + " |")
    bit_format = "c" * bit_count
    transitions_format = f"{bit_format}|{bit_format}|{bit_format}||{bit_format}"
    tables = (
        ("Tabela característica JK", "\n".join(characteristic), "cccc"),
        ("Tabela de excitação JK", "\n".join(excitation), "cc||cc"),
        (
            "Tabela-verdade: estado atual, J/K e próximo estado",
            "\n".join(transitions),
            transitions_format,
        ),
    )
    return [
        (title, render_table_svg(markdown, column_format))
        for title, markdown, column_format in tables
    ]


def karnaugh_diagrams(
    bit_count: int,
    expressions: dict[str, str],
    rows: list[SequentialTruthRow],
) -> list[tuple[str, bytes]]:
    diagrams = []
    for bit in reversed(range(bit_count)):
        for kind in ("J", "K"):
            key = f"{kind}{bit}"
            values = [
                (
                    "".join(map(str, reversed(row.current_bits))),
                    str((row.j_values if kind == "J" else row.k_values)[bit]),
                )
                for row in rows
            ]
            diagrams.append(
                (
                    f"Mapa de {key}: {expressions[key]}",
                    render_kmap_svg(bit_count, values),
                )
            )
    return diagrams
