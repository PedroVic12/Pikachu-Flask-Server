import sys
from dataclasses import dataclass
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QPlainTextEdit, QTableWidget, QTableWidgetItem,
    QTabWidget, QSlider, QGroupBox, QSplitter, QHeaderView, QMessageBox
)
from PyQt6.QtCore import Qt, QTimer, QPointF
from PyQt6.QtGui import QPainter, QColor, QPen, QBrush, QFont

# Matplotlib + Schemdraw para renderização das Tabelas e Circuitos Lógicos
import matplotlib
matplotlib.use("QtAgg")
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
import matplotlib.pyplot as plt

import schemdraw
from schemdraw import logic
import schemdraw.elements as elm
from schemdraw.parsing import logicparse


# ==============================================================================
# 1. STRUCTS DE DADOS (POO + DATACLASS)
# ==============================================================================
@dataclass
class JKFlipFlopState:
    """Struct que representa um único Flip-Flop JK com entrada assíncrona CLEAR."""
    name: str
    j: int = 1
    k: int = 1
    q: int = 0
    q_bar: int = 1
    clr: int = 0  # Clear assíncrono (1 = reseta para 000 imediatamente)

    def apply_clear(self, clear_signal: int) -> None:
        self.clr = clear_signal
        if self.clr == 1:
            self.q = 0
            self.q_bar = 1

    def clock_edge(self) -> None:
        """Transição na borda do clock segundo a tabela característica do FF JK."""
        if self.clr == 1:
            self.q = 0
        else:
            if self.j == 0 and self.k == 0:
                pass  # Mantém estado
            elif self.j == 0 and self.k == 1:
                self.q = 0  # Reset síncrono
            elif self.j == 1 and self.k == 0:
                self.q = 1  # Set síncrono
            elif self.j == 1 and self.k == 1:
                self.q ^= 1  # Comutação (Toggle)
        self.q_bar = 1 - self.q


@dataclass
class CounterStateStruct:
    """Struct global do contador de 3 bits."""
    up_down: int = 1       # 1 = Crescente (UP), 0 = Decrescente (DOWN)
    clear_async: int = 0   # 1 = Clear ativo (vai para 000)
    clk_level: int = 0     # Nível atual do clock (para animação piscante)


# ==============================================================================
# 2. PARSER DE EQUAÇÕES BOOLEANAS PURO (SEM SYMPY)
# ==============================================================================
class PureBooleanEngine:
    """
    Avalia equações booleanas escritas no editor sem usar SymPy.
    Aceita variáveis: M, Q0, Q1, Q2, NOT_M, NOT_Q0, NOT_Q1, NOT_Q2
    e operadores lógicos: AND (&), OR (|), XOR (^), NOT (~).
    """
    DEFAULT_CODE = """# Equações de Excitação dos Flip-Flops JK (Modo Comutação no MSB)
# Variáveis disponíveis: M (1=UP, 0=DOWN), Q0, Q1, Q2
# Complementares: NOT_M, NOT_Q0, NOT_Q1, NOT_Q2

# FF0 (LSB): Comuta em todos os pulsos
J0 = 1
K0 = 1

# FF1: Comuta quando (M e Q0) ou (NOT_M e NOT_Q0)
J1 = (M & Q0) | (NOT_M & NOT_Q0)
K1 = (M & Q0) | (NOT_M & NOT_Q0)

# FF2 (MSB em Comutação): Comuta no estouro de Q1 e Q0
J2 = (M & Q1 & Q0) | (NOT_M & NOT_Q1 & NOT_Q0)
K2 = (M & Q1 & Q0) | (NOT_M & NOT_Q1 & NOT_Q0)
"""

    @staticmethod
    def evaluate_equations(code_str: str, m: int, q2: int, q1: int, q0: int):
        env = {
            "M": int(bool(m)),
            "Q0": int(bool(q0)),
            "Q1": int(bool(q1)),
            "Q2": int(bool(q2)),
            "NOT_M": 1 - int(bool(m)),
            "NOT_Q0": 1 - int(bool(q0)),
            "NOT_Q1": 1 - int(bool(q1)),
            "NOT_Q2": 1 - int(bool(q2)),
        }
        local_ns = {}
        exec(code_str, {"__builtins__": {}}, env)
        for key in ("J0", "K0", "J1", "K1", "J2", "K2"):
            local_ns[key] = int(bool(env.get(key, 0)))
        return local_ns


# ==============================================================================
# 3. CANVAS INTERATIVO (DIAGRAMA FUNCIONAL JK + MÁQUINA DE ESTADOS PISCANTE)
# ==============================================================================
class InteractiveDiagramWidget(QWidget):
    """Desenha os 3 FFs JK com Clear assíncrono, LEDs e a FSM piscando."""

    def __init__(self, state: CounterStateStruct, ffs: list[JKFlipFlopState]):
        super().__init__()
        self.state = state
        self.ffs = ffs
        self.setMinimumSize(680, 480)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        # Fundo escuro estilo EDA / Osciloscópio Digital
        painter.fillRect(self.rect(), QColor("#12161f"))

        # Cores dinâmicas para Nível Alto (1 - Piscando/Brilhante) e Baixo (0)
        c_high = QColor("#00ff88")
        c_low = QColor("#3a4659")
        c_clk = QColor("#ffcc00") if self.state.clk_level else QColor("#4a3f15")
        c_clr = QColor("#ff4444") if self.state.clear_async else QColor("#4a2020")

        # ----------------------------------------------------------------------
        # A. DESENHO DOS 3 FLIP-FLOPS JK (FF0, FF1, FF2 - MSB)
        # ----------------------------------------------------------------------
        painter.setFont(QFont("Monospace", 10, QFont.Weight.Bold))
        painter.setPen(QColor("#ffffff"))
        painter.drawText(20, 25, f"DIAGRAMA FUNCIONAL: 3x FLIP-FLOP JK (Apenas CLEAR Assíncrono | Modo: {'CRESCENTE [UP=1]' if self.state.up_down else 'DECRESCENTE [DOWN=0]'})")

        ff_y = 65
        ff_w, ff_h = 135, 140
        spacing = 210

        for idx, ff in enumerate(self.ffs):
            fx = 40 + idx * spacing

            # Caixa do Flip-Flop JK
            border_color = c_high if ff.q == 1 else QColor("#5c7080")
            painter.setPen(QPen(border_color, 2.5))
            painter.setBrush(QBrush(QColor("#1c2430")))
            painter.drawRoundedRect(fx, ff_y, ff_w, ff_h, 8, 8)

            # Título do FF
            role = "LSB" if idx == 0 else ("MSB (Comutação)" if idx == 2 else "Bit 1")
            painter.setPen(QColor("#a0c4ff"))
            painter.drawText(fx + 10, ff_y - 8, f"{ff.name} ({role})")

            # Pinos J e K (Esquerda)
            painter.setPen(QPen(c_high if ff.j else c_low, 2.5))
            painter.drawLine(fx - 25, ff_y + 30, fx, ff_y + 30)
            painter.drawText(fx + 8, ff_y + 35, f"J{idx}={ff.j}")

            painter.setPen(QPen(c_high if ff.k else c_low, 2.5))
            painter.drawLine(fx - 25, ff_y + 110, fx, ff_y + 110)
            painter.drawText(fx + 8, ff_y + 115, f"K{idx}={ff.k}")

            # Pino de Clock (Meio Esquerda)
            painter.setPen(QPen(c_clk, 2.5))
            painter.drawLine(fx - 25, ff_y + 70, fx, ff_y + 70)
            painter.drawText(fx + 8, ff_y + 75, ">CLK")

            # Saídas Q e ~Q (Direita)
            painter.setPen(QPen(c_high if ff.q else c_low, 3))
            painter.drawLine(fx + ff_w, ff_y + 35, fx + ff_w + 25, ff_y + 35)
            painter.drawText(fx + ff_w - 42, ff_y + 40, f"Q{idx}={ff.q}")

            painter.setPen(QPen(c_high if ff.q_bar else c_low, 2))
            painter.drawLine(fx + ff_w, ff_y + 105, fx + ff_w + 25, ff_y + 105)
            painter.drawText(fx + ff_w - 48, ff_y + 110, f"~Q{idx}={ff.q_bar}")

            # Pino Assíncrono exclusivo CLEAR na base
            painter.setPen(QPen(c_clr, 2.5))
            painter.drawLine(fx + ff_w // 2, ff_y + ff_h, fx + ff_w // 2, ff_y + ff_h + 25)
            painter.drawText(fx + ff_w // 2 - 18, ff_y + ff_h - 8, "CLR")

            # LED Indicador Digital Acima de cada FF
            led_center = QPointF(fx + ff_w - 20, ff_y - 22)
            if ff.q == 1:
                painter.setBrush(QBrush(QColor("#00ff66")))
                painter.setPen(QPen(QColor("#ffffff"), 2))
            else:
                painter.setBrush(QBrush(QColor("#1e2d24")))
                painter.setPen(QPen(QColor("#3a4659"), 1.5))
            painter.drawEllipse(led_center, 11, 11)

        # Barramento Comum de CLEAR Assíncrono
        painter.setPen(QPen(c_clr, 2.5, Qt.PenStyle.DashLine))
        painter.drawLine(40 + ff_w // 2, ff_y + ff_h + 25, 40 + 2 * spacing + ff_w // 2, ff_y + ff_h + 25)
        painter.drawText(40, ff_y + ff_h + 42, f"BARRAMENTO CLEAR ASSÍNCRONO (ATIVO = {self.state.clear_async})")

        # ----------------------------------------------------------------------
        # B. MÁQUINA DE ESTADOS FINITOS (FSM) INTERATIVA PISCANTE
        # ----------------------------------------------------------------------
        fsm_cy = 365
        painter.setPen(QColor("#ffffff"))
        painter.drawText(20, 275, "MÁQUINA DE ESTADOS (FSM): 000 ↔ 111 (Pisca em Verde no Estado Atual)")

        current_val = (self.ffs[2].q << 2) | (self.ffs[1].q << 1) | self.ffs[0].q
        next_val = (current_val + 1) % 8 if self.state.up_down == 1 else (current_val - 1) % 8
        if self.state.clear_async == 1:
            next_val = 0

        node_spacing = 78
        start_x = 55

        for s in range(8):
            nx = start_x + s * node_spacing
            ny = fsm_cy
            is_current = (s == current_val)
            is_next = (s == next_val)

            # Efeito piscante sincronizado com o Clock no estado ativo
            if is_current:
                fill = QColor("#00ff88") if self.state.clk_level else QColor("#00b862")
                pen = QPen(QColor("#ffffff"), 3)
                txt_color = QColor("#000000")
            elif is_next:
                fill = QColor("#2b3a55")
                pen = QPen(QColor("#ffcc00"), 2, Qt.PenStyle.DotLine)
                txt_color = QColor("#ffcc00")
            else:
                fill = QColor("#1c2430")
                pen = QPen(QColor("#4a5568"), 1.5)
                txt_color = QColor("#a0aec0")

            painter.setBrush(QBrush(fill))
            painter.setPen(pen)
            painter.drawEllipse(QPointF(nx, ny), 26, 26)

            painter.setPen(txt_color)
            painter.setFont(QFont("Monospace", 10, QFont.Weight.Bold))
            painter.drawText(nx - 14, ny - 2, f"{s:03b}")
            painter.setFont(QFont("Monospace", 8))
            painter.drawText(nx - 10, ny + 14, f"({s})")

        # Indicador textual do estado e transição
        painter.setPen(QColor("#00ff88"))
        painter.setFont(QFont("Monospace", 11, QFont.Weight.Bold))
        painter.drawText(
            20, 445,
            f"ESTADO ATUAL (Q2 Q1 Q0): {current_val:03b} (Dec: {current_val})   |   "
            f"PRÓXIMO ESTADO: {next_val:03b} (Dec: {next_val})"
        )


# ==============================================================================
# 4. RENDERIZADOR SCHEMDRAW (TABELA-VERDADE + CIRCUITO LÓGICO JK)
# ==============================================================================
class SchemdrawCanvas(FigureCanvas):
    """Renderiza a Tabela-Verdade e os Flip-Flops JK usando schemdraw.logic."""

    def __init__(self):
        self.fig, (self.ax_circuit, self.ax_table) = plt.subplots(1, 2, figsize=(11, 5), facecolor="#f8f9fa")
        super().__init__(self.fig)
        self.draw_schemdraw_views()

    def draw_schemdraw_views(self):
        self.ax_circuit.clear()
        self.ax_table.clear()

        # 1. Desenha o Esquema Lógico da Equação de Comutação do MSB (J2 = K2) via logicparse
        with schemdraw.Drawing(canvas=self.ax_circuit, show=False) as d:
            d.config(unit=0.6, fontsize=10)
            logicparse(
                "(M and Q1 and Q0) or ((not M) and (not Q1) and (not Q0))",
                outlabel=r"$J_2 = K_2 \text{ (MSB)}$"
            )
        self.ax_circuit.set_title("Schemdraw Logic: Excitação do MSB em Comutação (J2 = K2)", fontweight="bold")
        self.ax_circuit.axis("off")

        # 2. Desenha a Tabela-Verdade Completa no schemdraw.logic.Table
        md_table = (
            " M | Q2 Q1 Q0 | Q2+ Q1+ Q0+ | J2 K2 | J1 K1 | J0 K0 \n"
            "---|----------|-------------|-------|-------|-------\n"
            " 1 |  0  0  0 |   0   0   1 |  0  0 |  0  0 |  1  1 \n"
            " 1 |  0  0  1 |   0   1   0 |  0  0 |  1  1 |  1  1 \n"
            " 1 |  0  1  0 |   0   1   1 |  0  0 |  0  0 |  1  1 \n"
            " 1 |  0  1  1 |   1   0   0 |  1  1 |  1  1 |  1  1 \n"
            " 1 |  1  0  0 |   1   0   1 |  0  0 |  0  0 |  1  1 \n"
            " 1 |  1  1  1 |   0   0   0 |  1  1 |  1  1 |  1  1 \n"
            " 0 |  0  0  0 |   1   1   1 |  1  1 |  1  1 |  1  1 \n"
            " 0 |  1  1  1 |   1   1   0 |  0  0 |  0  0 |  1  1 \n"
            " 0 |  1  0  0 |   0   1   1 |  1  1 |  1  1 |  1  1 "
        )
        with schemdraw.Drawing(canvas=self.ax_table, show=False) as d_tab:
            d_tab.config(fontsize=8.5)
            d_tab += logic.Table(md_table, colfmt="c|c|c||c|c|c")
        self.ax_table.set_title("Schemdraw logic.Table: Tabela de Excitação JK (Comutação)", fontweight="bold")
        self.ax_table.axis("off")

        self.fig.tight_layout()
        self.draw()


# ==============================================================================
# 5. JANELA PRINCIPAL PYQT6 (EDITOR PYTHON + TABELAS + SIMULADOR INTERATIVO)
# ==============================================================================
class JKCounterMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Simulador PyQt6 - Contador 3-Bits Flip-Flop JK (Comutação MSB + Schemdraw)")
        self.resize(1320, 820)

        # Inicializa Structs do Estado e dos 3 Flip-Flops JK
        self.state = CounterStateStruct()
        self.ffs = [
            JKFlipFlopState(name="FF0"),
            JKFlipFlopState(name="FF1"),
            JKFlipFlopState(name="FF2"),
        ]

        # Timer para o Clock piscante automático
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.step_clock_phase)
        self.timer_interval_ms = 500

        self._build_ui()
        self.recalculate_jk_inputs()
        self.populate_truth_tables()

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)

        # Barra de Controle Superior
        ctrl_group = QGroupBox("Controles de Operação em Tempo Real (Sem Reiniciar na Troca de Sentido)")
        ctrl_layout = QHBoxLayout(ctrl_group)

        self.btn_clock_auto = QPushButton("▶ Iniciar Clock Automático")
        self.btn_clock_auto.setCheckable(True)
        self.btn_clock_auto.clicked.connect(self.toggle_auto_clock)

        self.btn_step = QPushButton("⚡ Pulso Manual de Clock")
        self.btn_step.clicked.connect(self.manual_clock_pulse)

        self.btn_mode = QPushButton("Sentido Atual: CRESCENTE (UP = 1)")
        self.btn_mode.setStyleSheet("background-color: #1b4332; color: white; font-weight: bold; padding: 6px;")
        self.btn_mode.clicked.connect(self.toggle_direction)

        self.btn_clear = QPushButton("🔴 Acionar CLEAR Assíncrono (000)")
        self.btn_clear.setCheckable(True)
        self.btn_clear.setStyleSheet("background-color: #641220; color: white; font-weight: bold; padding: 6px;")
        self.btn_clear.clicked.connect(self.toggle_clear_async)

        lbl_speed = QLabel("Velocidade do Clock:")
        self.slider_speed = QSlider(Qt.Orientation.Horizontal)
        self.slider_speed.setRange(100, 1200)
        self.slider_speed.setValue(500)
        self.slider_speed.valueChanged.connect(self.change_speed)

        ctrl_layout.addWidget(self.btn_clock_auto)
        ctrl_layout.addWidget(self.btn_step)
        ctrl_layout.addWidget(self.btn_mode)
        ctrl_layout.addWidget(self.btn_clear)
        ctrl_layout.addWidget(lbl_speed)
        ctrl_layout.addWidget(self.slider_speed)
        main_layout.addWidget(ctrl_group)

        # Divisor Central: Esquerda (Editor Python de Equações) | Direita (Abas de Simulação)
        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Painel Esquerdo: Editor Python de Equações Sem SymPy
        editor_widget = QWidget()
        ed_layout = QVBoxLayout(editor_widget)
        ed_label = QLabel("<b>Editor Python de Equações Booleanas (Sem SymPy):</b>")
        self.code_editor = QPlainTextEdit()
        self.code_editor.setFont(QFont("Monospace", 10))
        self.code_editor.setPlainText(PureBooleanEngine.DEFAULT_CODE)

        btn_apply_code = QPushButton("✔ Compilar Equações e Atualizar Tabelas-Verdade")
        btn_apply_code.setStyleSheet("background-color: #005f73; color: white; font-weight: bold; padding: 8px;")
        btn_apply_code.clicked.connect(self.apply_custom_equations)

        ed_layout.addWidget(ed_label)
        ed_layout.addWidget(self.code_editor)
        ed_layout.addWidget(btn_apply_code)
        splitter.addWidget(editor_widget)

        # Painel Direito: Abas (Diagrama Piscante | Schemdraw | Tabela-Verdade Completa 16 Estados)
        self.tabs = QTabWidget()

        # Aba 1: Diagrama Funcional + FSM Piscante
        self.diagram_widget = InteractiveDiagramWidget(self.state, self.ffs)
        self.tabs.addTab(self.diagram_widget, "1. Diagrama Funcional JK & Máquina de Estados (Ao Vivo)")

        # Aba 2: Schemdraw (Circuito Lógico + logic.Table)
        self.schemdraw_canvas = SchemdrawCanvas()
        self.tabs.addTab(self.schemdraw_canvas, "2. Circuito Lógico e Tabela (schemdraw.logic)")

        # Aba 3: Todas as Tabelas-Verdade Interativas (Destaca a linha atual ao vivo)
        self.table_widget = QTableWidget(16, 12)
        headers = [
            "M (UP/DOWN)", "Q2 (MSB)", "Q1", "Q0 (LSB)",
            "Q2+ (Próx)", "Q1+ (Próx)", "Q0+ (Próx)",
            "J2 = K2 (MSB)", "J1 = K1", "J0 = K0", "CLEAR Assínc.", "Estado Decimal"
        ]
        self.table_widget.setHorizontalHeaderLabels(headers)
        self.table_widget.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.tabs.addTab(self.table_widget, "3. Tabela-Verdade Completa (16 Transições + Destaque Dinâmico)")

        splitter.addWidget(self.tabs)
        splitter.setSizes([430, 890])
        main_layout.addWidget(splitter)

    # ==========================================================================
    # LÓGICA DE SIMULAÇÃO E ATUALIZAÇÃO
    # ==========================================================================
    def recalculate_jk_inputs(self):
        """Avalia as equações do editor Python para definir J0..K2 sem SymPy."""
        try:
            res = PureBooleanEngine.evaluate_equations(
                self.code_editor.toPlainText(),
                self.state.up_down,
                self.ffs[2].q,
                self.ffs[1].q,
                self.ffs[0].q
            )
            self.ffs[0].j, self.ffs[0].k = res["J0"], res["K0"]
            self.ffs[1].j, self.ffs[1].k = res["J1"], res["K1"]
            self.ffs[2].j, self.ffs[2].k = res["J2"], res["K2"]
        except Exception as e:
            self.timer.stop()
            self.btn_clock_auto.setChecked(False)
            QMessageBox.critical(self, "Erro de Sintaxe nas Equações", f"Verifique a equação no editor:\n{e}")

        self.highlight_active_truth_table_row()
        self.diagram_widget.update()

    def step_clock_phase(self):
        """Alterna o nível do clock (0 -> 1 -> 0) para fazer o diagrama piscar."""
        self.state.clk_level ^= 1
        if self.state.clk_level == 1:  # Borda de subida atualiza os Flip-Flops JK
            for ff in self.ffs:
                ff.clock_edge()
            self.recalculate_jk_inputs()
        else:
            self.diagram_widget.update()

    def manual_clock_pulse(self):
        """Executa um pulso completo de clock manualmente."""
        self.state.clk_level = 1
        for ff in self.ffs:
            ff.clock_edge()
        self.recalculate_jk_inputs()
        QTimer.singleShot(180, self._reset_clk_visual)

    def _reset_clk_visual(self):
        self.state.clk_level = 0
        self.diagram_widget.update()

    def toggle_auto_clock(self, checked: bool):
        if checked:
            self.btn_clock_auto.setText("⏸ Pausar Clock Automático")
            self.timer.start(self.timer_interval_ms)
        else:
            self.btn_clock_auto.setText("▶ Iniciar Clock Automático")
            self.timer.stop()

    def toggle_direction(self):
        """Altera o sentido UP/DOWN em tempo de execução sem resetar os FFs."""
        self.state.up_down ^= 1
        if self.state.up_down == 1:
            self.btn_mode.setText("Sentido Atual: CRESCENTE (UP = 1)")
            self.btn_mode.setStyleSheet("background-color: #1b4332; color: white; font-weight: bold; padding: 6px;")
        else:
            self.btn_mode.setText("Sentido Atual: DECRESCENTE (DOWN = 0)")
            self.btn_mode.setStyleSheet("background-color: #3c096c; color: white; font-weight: bold; padding: 6px;")
        self.recalculate_jk_inputs()

    def toggle_clear_async(self, checked: bool):
        """Ativa/desativa a entrada assíncrona CLEAR."""
        self.state.clear_async = 1 if checked else 0
        for ff in self.ffs:
            ff.apply_clear(self.state.clear_async)
        self.recalculate_jk_inputs()

    def change_speed(self, val: int):
        self.timer_interval_ms = max(80, 1300 - val)
        if self.timer.isActive():
            self.timer.start(self.timer_interval_ms)

    def apply_custom_equations(self):
        self.recalculate_jk_inputs()
        self.populate_truth_tables()

    def populate_truth_tables(self):
        """Gera todas as 16 linhas da tabela-verdade a partir do código do editor."""
        code = self.code_editor.toPlainText()
        row_idx = 0
        for m in (1, 0):
            for val in range(8):
                q2, q1, q0 = (val >> 2) & 1, (val >> 1) & 1, val & 1
                res = PureBooleanEngine.evaluate_equations(code, m, q2, q1, q0)

                # Calcula próximo estado simulando a comutação JK
                q0_next = q0 ^ res["J0"] if (res["J0"] and res["K0"]) else q0
                q1_next = q1 ^ res["J1"] if (res["J1"] and res["K1"]) else q1
                q2_next = q2 ^ res["J2"] if (res["J2"] and res["K2"]) else q2
                next_val = (q2_next << 2) | (q1_next << 1) | q0_next

                row_data = [
                    f"{m} ({'UP' if m else 'DOWN'})",
                    str(q2), str(q1), str(q0),
                    str(q2_next), str(q1_next), str(q0_next),
                    f"{res['J2']} / {res['K2']}",
                    f"{res['J1']} / {res['K1']}",
                    f"{res['J0']} / {res['K0']}",
                    "0 (Inativo)",
                    f"{val} → {next_val}"
                ]
                for col, text in enumerate(row_data):
                    item = QTableWidgetItem(text)
                    item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                    self.table_widget.setItem(row_idx, col, item)
                row_idx += 1
        self.highlight_active_truth_table_row()

    def highlight_active_truth_table_row(self):
        """Pisca/destaca na tabela-verdade a linha correspondente ao estado atual."""
        current_val = (self.ffs[2].q << 2) | (self.ffs[1].q << 1) | (self.ffs[0].q)
        active_row = (0 if self.state.up_down == 1 else 8) + current_val

        for r in range(self.table_widget.rowCount()):
            bg = QColor("#00ff88") if r == active_row else QColor("#ffffff")
            fg = QColor("#000000")
            for c in range(self.table_widget.columnCount()):
                item = self.table_widget.item(r, c)
                if item:
                    item.setBackground(bg)
                    item.setForeground(fg)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = JKCounterMainWindow()
    window.show()
    sys.exit(app.exec())
