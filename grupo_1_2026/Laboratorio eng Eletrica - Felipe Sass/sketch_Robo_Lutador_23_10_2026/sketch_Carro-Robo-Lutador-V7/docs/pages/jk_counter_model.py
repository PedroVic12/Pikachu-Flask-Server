from typing import Literal, Sequence

from pydantic import BaseModel, Field


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

    def model_post_init(self, context):
        del context
        self._validate_state(self.state)
        self._sync_flip_flops()

    @property
    def bits(self) -> str:
        return format(self.state, f"0{self.bit_count}b")

    def _validate_state(self, state: int):
        if not isinstance(state, int) or isinstance(state, bool):
            raise TypeError("O estado inicial deve ser inteiro.")
        if state < 0 or state >= (1 << self.bit_count):
            raise ValueError(
                "O estado inicial excede a quantidade de bits do contador."
            )

    def _sync_flip_flops(self):
        self.flip_flops = [self._make_flip_flop(bit) for bit in range(self.bit_count)]

    def _make_flip_flop(self, bit: int) -> JKFlipFlopState:
        lower_mask = (1 << bit) - 1
        lower_bits = self.state & lower_mask
        should_toggle = bit == 0 or (
            lower_bits == lower_mask if self.direction == "UP" else lower_bits == 0
        )
        q_value = (self.state >> bit) & 1
        return JKFlipFlopState(
            j=int(should_toggle),
            k=int(should_toggle),
            q=q_value,
            q_bar=1 - q_value,
        )

    def reset(self):
        self.set_state(0)

    def set_state(self, state: int):
        self._validate_state(state)
        self.state = state
        self._sync_flip_flops()

    def clock(self) -> str:
        self._sync_flip_flops()
        return self.clock_with_inputs(
            [flip_flop.j for flip_flop in self.flip_flops],
            [flip_flop.k for flip_flop in self.flip_flops],
        )

    def clock_with_inputs(
        self, j_values: Sequence[int], k_values: Sequence[int]
    ) -> str:
        if len(j_values) != self.bit_count or len(k_values) != self.bit_count:
            raise ValueError(
                "É necessário informar um valor J e K para cada flip-flop."
            )
        if any(
            not isinstance(value, int) or isinstance(value, bool) or value not in (0, 1)
            for value in (*j_values, *k_values)
        ):
            raise ValueError("As entradas J e K devem ser binárias (0 ou 1).")

        next_state = 0
        for bit, (j_value, k_value, flip_flop) in enumerate(
            zip(j_values, k_values, self.flip_flops)
        ):
            q_value = (self.state >> bit) & 1
            q_next = int((j_value and not q_value) or (not k_value and q_value))
            next_state |= q_next << bit
            flip_flop.j = j_value
            flip_flop.k = k_value
            flip_flop.q = q_next
            flip_flop.q_bar = 1 - q_next
        self.state = next_state
        return self.bits
