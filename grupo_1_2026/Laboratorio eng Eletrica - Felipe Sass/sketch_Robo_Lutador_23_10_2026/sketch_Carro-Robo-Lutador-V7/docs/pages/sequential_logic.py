import re
from dataclasses import dataclass

_TOKEN_PATTERN = re.compile(
    r"Q[0-3]|[01]|AND|NAND|OR|NOR|XOR|XNOR|NOT|[&∧+|∨^⊕⊻~!¬()]",
    re.IGNORECASE,
)
_SYMBOL_OPERATORS = {
    "&": "AND",
    "∧": "AND",
    "+": "OR",
    "|": "OR",
    "∨": "OR",
    "^": "XOR",
    "⊕": "XOR",
    "⊻": "XOR",
    "~": "NOT",
    "!": "NOT",
    "¬": "NOT",
}


@dataclass(frozen=True)
class SequentialTruthRow:
    state: int
    current_bits: tuple[int, ...]
    j_values: tuple[int, ...]
    k_values: tuple[int, ...]
    next_bits: tuple[int, ...]
    next_state: int


BooleanExpression = (
    int
    | str
    | tuple[str, "BooleanExpression"]
    | tuple[str, "BooleanExpression", "BooleanExpression"]
)


class _BooleanExpressionParser:
    def __init__(self, expression: str):
        self.expression = expression
        self.tokens: list[str] = []
        cursor = 0
        while cursor < len(expression):
            if expression[cursor].isspace():
                cursor += 1
                continue
            match = _TOKEN_PATTERN.match(expression, cursor)
            if match is None:
                raise ValueError(f"Símbolo não suportado na expressão {expression!r}.")
            token = match.group().upper()
            self.tokens.append(_SYMBOL_OPERATORS.get(token, token))
            cursor = match.end()
        self.position = 0

    def parse(self) -> BooleanExpression:
        if not self.tokens:
            raise ValueError("A expressão booleana não pode estar vazia.")
        node = self._parse_or()
        if self.position != len(self.tokens):
            raise ValueError(f"Expressão booleana inválida: {self.expression!r}.")
        return node

    def _parse_or(self) -> BooleanExpression:
        node = self._parse_xor()
        while self._peek() in ("OR", "NOR"):
            operator = self._consume()
            node = (operator, node, self._parse_xor())
        return node

    def _parse_xor(self) -> BooleanExpression:
        node = self._parse_and()
        while self._peek() in ("XOR", "XNOR"):
            operator = self._consume()
            node = (operator, node, self._parse_and())
        return node

    def _parse_and(self) -> BooleanExpression:
        node = self._parse_unary()
        while self._peek() in ("AND", "NAND"):
            operator = self._consume()
            node = (operator, node, self._parse_unary())
        return node

    def _parse_unary(self) -> BooleanExpression:
        if self._peek() == "NOT":
            self._consume()
            return ("NOT", self._parse_unary())
        return self._parse_primary()

    def _parse_primary(self) -> BooleanExpression:
        token = self._consume()
        if token == "(":
            node = self._parse_or()
            if self._consume() != ")":
                raise ValueError(f"Parênteses não balanceados em {self.expression!r}.")
            return node
        if token in ("0", "1") or token.startswith("Q"):
            return int(token) if token in ("0", "1") else token
        raise ValueError(f"Valor inesperado {token!r} em {self.expression!r}.")

    def _peek(self) -> str | None:
        if self.position == len(self.tokens):
            return None
        return self.tokens[self.position]

    def _consume(self) -> str:
        token = self._peek()
        if token is None:
            raise ValueError(f"Expressão incompleta: {self.expression!r}.")
        self.position += 1
        return token


def default_jk_expressions(bit_count: int, direction: str) -> dict[str, str]:
    if bit_count not in (3, 4):
        raise ValueError("O contador deve ter 3 ou 4 bits.")
    if direction not in ("UP", "DOWN"):
        raise ValueError("A direção deve ser UP ou DOWN.")

    expressions: dict[str, str] = {}
    for bit in range(bit_count):
        if bit == 0:
            expression = "1"
        else:
            terms = [f"Q{lower}" for lower in range(bit)]
            if direction == "DOWN":
                terms = [f"~Q{lower}" for lower in range(bit)]
            expression = " & ".join(terms)
        expressions[f"J{bit}"] = expression
        expressions[f"K{bit}"] = expression
    return expressions


def parse_boolean_expression(expression: str) -> BooleanExpression:
    return _BooleanExpressionParser(expression).parse()


def _evaluate_node(
    node: BooleanExpression,
    values: dict[str, int],
) -> bool:
    if isinstance(node, str):
        return bool(values[node])
    if isinstance(node, int):
        return bool(node)
    if node[0] == "NOT":
        return not _evaluate_node(node[1], values)
    operator, left_node, right_node = node
    left = _evaluate_node(left_node, values)
    right = _evaluate_node(right_node, values)
    if operator == "AND":
        return left and right
    if operator == "NAND":
        return not (left and right)
    if operator == "OR":
        return left or right
    if operator == "NOR":
        return not (left or right)
    if operator == "XOR":
        return left != right
    if operator == "XNOR":
        return left == right
    raise RuntimeError(f"Operador lógico desconhecido: {operator}.")


def analyze_sequential_circuit(
    bit_count: int, expressions: dict[str, str]
) -> list[SequentialTruthRow]:
    if bit_count not in (3, 4):
        raise ValueError("O circuito deve ter 3 ou 4 bits.")

    expected_inputs = {
        f"{kind}{bit}" for bit in range(bit_count) for kind in ("J", "K")
    }
    if set(expressions) != expected_inputs:
        raise ValueError("Informe exatamente uma expressão J e K para cada flip-flop.")
    parsed = {
        f"{kind}{bit}": parse_boolean_expression(expressions[f"{kind}{bit}"])
        for bit in range(bit_count)
        for kind in ("J", "K")
    }
    used_variables = {
        node
        for expression in parsed.values()
        for node in expression_variables(expression)
    }
    unavailable = sorted(
        variable for variable in used_variables if int(variable[1:]) >= bit_count
    )
    if unavailable:
        raise ValueError(
            f"Variável indisponível em um circuito de {bit_count} bits: "
            f"{', '.join(unavailable)}."
        )
    rows = []
    for state in range(1 << bit_count):
        current_bits = tuple((state >> bit) & 1 for bit in range(bit_count))
        values = {f"Q{bit}": value for bit, value in enumerate(current_bits)}
        j_values = tuple(
            int(_evaluate_node(parsed[f"J{bit}"], values)) for bit in range(bit_count)
        )
        k_values = tuple(
            int(_evaluate_node(parsed[f"K{bit}"], values)) for bit in range(bit_count)
        )
        next_bits = tuple(
            int((j and not q) or (not k and q))
            for j, k, q in zip(j_values, k_values, current_bits)
        )
        next_state = sum(value << bit for bit, value in enumerate(next_bits))
        rows.append(
            SequentialTruthRow(
                state=state,
                current_bits=current_bits,
                j_values=j_values,
                k_values=k_values,
                next_bits=next_bits,
                next_state=next_state,
            )
        )
    return rows


def expression_variables(node: BooleanExpression) -> set[str]:
    if isinstance(node, str):
        return {node}
    if isinstance(node, int):
        return set()
    return set().union(*(expression_variables(child) for child in node[1:]))
