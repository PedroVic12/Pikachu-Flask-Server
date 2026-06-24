# -*- coding: utf-8 -*-
import sys
import os
import subprocess
from datetime import datetime, timedelta
import unicodedata
from dataclasses import dataclass
from typing import Optional, Tuple

import pandas as pd

# Plotly + QtWebEngine
import plotly.graph_objects as go
import plotly.io as pio
from plotly.subplots import make_subplots

pio.templates.default = "plotly_dark"

from PySide6.QtCore import Qt
from PySide6.QtGui import QColor
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QTabWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QLineEdit,
    QFileDialog,
    QMessageBox,
    QTextEdit,
    QFormLayout,
    QColorDialog,
)
from PySide6.QtWebEngineWidgets import QWebEngineView


# pip install PySide6 PySide6-QtWebEngine pandas plotly openpyxl


# =========================
# Configs iniciais
# =========================
DEFAULT_XLSX = "/home/pedrov12/Documentos/GitHub/Tarefas_PLC_ONS_2026-02-14.xlsx"
CONCLUIDO_COL = "Concluído"

DEFAULT_PIE_TITLE = "Status de Conclusão da Sprint"
DEFAULT_BAR_TITLE = "Carga de Trabalho por Área"
DEFAULT_LINE_TITLE = "Evolução Temporal das Entregas"

DEFAULT_COLOR_FEITO = "#2ecc71"  # verde
DEFAULT_COLOR_PEND = "#e74c3c"  # vermelho

# =========================
# Configurações e Helpers do Git
# =========================
CATEGORIAS_GIT = {
    "ONS-PLC-PV-CONTROLE-E-AUTOMACAO": "CLT (Trabalho ONS)",
    "Jedi-CyberPunk": "UFF (Estudos)",
    "Repopulation-With-Elite-Set": "UFF (Estudos)",
    "calistenia-app-saiyajin-workout": "Projetos Pessoais",
    "getx-for-qt6": "Projetos Pessoais",
    "Portfolio-Pedro-Victor": "Projetos Pessoais",
    "Pikachu-Flask-Server": "Projetos Pessoais",
    "C3PO-Assistente-Virtual-BR": "Projetos Pessoais",
    "astro-blog-pedrov12": "Projetos Pessoais",
    "Websites-Astro-Templates": "Projetos Pessoais",
    "mvp-projects-freelancer": "Projetos Pessoais"
}

def get_projeto_categoria_git(nome_projeto):
    return CATEGORIAS_GIT.get(nome_projeto, "Projetos Pessoais")

def formatar_tempo(minutos):
    h = int(minutos // 60)
    m = int(minutos % 60)
    if h > 0 and m > 0:
        return f"{h}h {m}m"
    elif h > 0:
        return f"{h}h"
    else:
        return f"{m}m"

def obter_commits_git(root_dir):
    commits_list = []
    if not os.path.exists(root_dir):
        return pd.DataFrame()

    try:
        items = os.listdir(root_dir)
    except Exception as e:
        print(f"Erro ao listar root_dir {root_dir}: {e}")
        return pd.DataFrame()

    for item in items:
        item_path = os.path.join(root_dir, item)
        if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path, ".git")):
            try:
                cmd = ["git", "-C", item_path, "log", "-n", "100", "--pretty=format:%h|%cI|%an|%s"]
                output = subprocess.check_output(cmd, stderr=subprocess.STDOUT).decode("utf-8").strip()
                if not output:
                    continue
                for line in output.split("\n"):
                    parts = line.split("|")
                    if len(parts) >= 4:
                        hash_val = parts[0]
                        timestamp_str = parts[1]
                        author = parts[2]
                        msg = "|".join(parts[3:])
                        try:
                            dt = datetime.fromisoformat(timestamp_str)
                            commits_list.append({
                                "Projeto": item,
                                "Categoria": get_projeto_categoria_git(item),
                                "Hash": hash_val,
                                "DataHora": dt,
                                "Data": dt.date(),
                                "Autor": author,
                                "Mensagem": msg
                            })
                        except ValueError:
                            continue
            except Exception as e:
                print(f"Erro ao processar {item}: {e}")
                
    return pd.DataFrame(commits_list)

def calcular_horas_desenvolvimento(df):
    if df.empty:
        return pd.DataFrame()

    df = df.sort_values(by=["Projeto", "DataHora"], ascending=True).reset_index(drop=True)
    registros_tempo = []
    grouped = df.groupby(["Projeto", "Data"])
    
    for (projeto, data), group in grouped:
        group = group.sort_values(by="DataHora")
        timestamps = group["DataHora"].tolist()
        
        tempo_estimado_minutos = 0
        default_session_minutes = 45
        
        if len(timestamps) == 1:
            tempo_estimado_minutos = default_session_minutes
        else:
            tempo_estimado_minutos += default_session_minutes
            for i in range(1, len(timestamps)):
                gap = (timestamps[i] - timestamps[i-1]).total_seconds() / 60.0
                if gap <= 120:
                    tempo_estimado_minutos += gap
                else:
                    tempo_estimado_minutos += default_session_minutes
                    
        horas = tempo_estimado_minutos / 60.0
        categoria = get_projeto_categoria_git(projeto)
        
        registros_tempo.append({
            "Projeto": projeto,
            "Categoria": categoria,
            "Data": data,
            "Horas": horas,
            "Minutos": int(tempo_estimado_minutos)
        })
        
    return pd.DataFrame(registros_tempo)

def gerar_graficos_plotly_git(df_tempo):
    if df_tempo.empty:
        return go.Figure()

    df_tempo["Data"] = pd.to_datetime(df_tempo["Data"])
    
    hoje = datetime.now()
    inicio_semana = hoje - timedelta(days=hoje.weekday())
    inicio_semana = inicio_semana.replace(hour=0, minute=0, second=0, microsecond=0)
    
    df_semana = df_tempo[df_tempo["Data"] >= inicio_semana]
    
    resumo_semana = df_semana.groupby("Categoria")["Minutos"].sum().to_dict()
    minutos_clt = resumo_semana.get("CLT (Trabalho ONS)", 0)
    minutos_uff = resumo_semana.get("UFF (Estudos)", 0)
    minutos_pessoais = resumo_semana.get("Projetos Pessoais", 0)
    minutos_estudos = minutos_uff + minutos_pessoais
    
    horas_clt = minutos_clt / 60.0
    horas_estudos = minutos_estudos / 60.0
    
    resumo_projetos_semana = df_semana.groupby("Projeto")["Minutos"].sum().reset_index()
    resumo_projetos_semana["Horas"] = resumo_projetos_semana["Minutos"] / 60.0
    resumo_projetos_semana = resumo_projetos_semana.sort_values(by="Horas", ascending=True)

    df_diario_proj = df_tempo.groupby(["Data", "Projeto"])["Minutos"].sum().unstack().fillna(0)
    df_diario_proj = df_diario_proj.tail(14)

    fig = make_subplots(
        rows=2, cols=2,
        specs=[
            [{"type": "indicator"}, {"type": "indicator"}],
            [{"type": "xy"}, {"type": "xy"}]
        ],
        subplot_titles=(
            "Meta Semanal CLT (40 Horas)",
            "Meta Semanal UFF / Estudos & Pessoais (20 Horas)",
            "Evolução Diária por Projeto (Últimos Dias)",
            "Total por Projeto nesta Semana"
        ),
        vertical_spacing=0.18,
        horizontal_spacing=0.15
    )

    fig.add_trace(
        go.Indicator(
            mode="gauge+number+delta",
            value=horas_clt,
            delta={'reference': 40, 'position': 'bottom'},
            title={'text': f"Horas CLT<br><span style='font-size:0.85em;color:#a6adc8'>{formatar_tempo(minutos_clt)} / 40h</span>"},
            gauge={
                'axis': {'range': [0, 50], 'tickwidth': 1, 'tickcolor': "#cdd6f4"},
                'bar': {'color': "#89b4fa"},
                'steps': [
                    {'range': [0, 30], 'color': "#313244"},
                    {'range': [30, 40], 'color': "#f9e2af"},
                    {'range': [40, 50], 'color': "#a6e3a1"}
                ],
                'threshold': {'line': {'color': "#f38ba8", 'width': 4}, 'thickness': 0.75, 'value': 40}
            }
        ),
        row=1, col=1
    )

    fig.add_trace(
        go.Indicator(
            mode="gauge+number+delta",
            value=horas_estudos,
            delta={'reference': 20, 'position': 'bottom'},
            title={'text': f"Estudos / Projetos<br><span style='font-size:0.85em;color:#a6adc8'>{formatar_tempo(minutos_estudos)} / 20h</span>"},
            gauge={
                'axis': {'range': [0, 30], 'tickwidth': 1, 'tickcolor': "#cdd6f4"},
                'bar': {'color': "#a6e3a1"},
                'steps': [
                    {'range': [0, 15], 'color': "#313244"},
                    {'range': [15, 20], 'color': "#f9e2af"},
                    {'range': [20, 30], 'color': "#a6e3a1"}
                ],
                'threshold': {'line': {'color': "#f38ba8", 'width': 4}, 'thickness': 0.75, 'value': 20}
            }
        ),
        row=1, col=2
    )

    cores_projetos = ["#89b4fa", "#a6e3a1", "#f9e2af", "#f5c2e7", "#cba6f7", "#94e2d5", "#f2cdcd", "#cdd6f4"]
    for idx, proj in enumerate(df_diario_proj.columns):
        minutos_serie = df_diario_proj[proj]
        horas_decimal = minutos_serie / 60.0
        
        if minutos_serie.sum() > 0:
            text_labels = [formatar_tempo(m) if m > 0 else "" for m in minutos_serie]
            hover_labels = [f"<b>{proj}</b><br>Data: {d.strftime('%d/%m')}<br>Tempo: {formatar_tempo(m)}" for d, m in zip(minutos_serie.index, minutos_serie)]
            
            fig.add_trace(
                go.Bar(
                    x=minutos_serie.index.strftime('%d/%m'),
                    y=horas_decimal,
                    name=proj,
                    text=text_labels,
                    textposition='inside',
                    hovertext=hover_labels,
                    hoverinfo="text",
                    marker_color=cores_projetos[idx % len(cores_projetos)]
                ),
                row=2, col=1
            )

    if not resumo_projetos_semana.empty:
        text_semana = [formatar_tempo(m) for m in resumo_projetos_semana["Minutos"]]
        hover_semana = [f"<b>{row['Projeto']}</b><br>Tempo na Semana: {formatar_tempo(row['Minutos'])}" for _, row in resumo_projetos_semana.iterrows()]
        
        fig.add_trace(
            go.Bar(
                y=resumo_projetos_semana["Projeto"],
                x=resumo_projetos_semana["Horas"],
                orientation='h',
                text=text_semana,
                textposition='auto',
                hovertext=hover_semana,
                hoverinfo="text",
                marker_color="#89b4fa"
            ),
            row=2, col=2
        )

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#252526",
        plot_bgcolor="#252526",
        height=680,
        showlegend=True,
        barmode='stack',
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.22,
            xanchor="center",
            x=0.5
        ),
        font=dict(
            family="Inter, Roboto, sans-serif",
            size=12,
            color="#cdd6f4"
        )
    )

    fig.update_xaxes(title_text="Data", row=2, col=1, gridcolor="#313244")
    fig.update_yaxes(title_text="Horas", row=2, col=1, gridcolor="#313244")
    fig.update_xaxes(title_text="Horas Desenvolvidas", row=2, col=2, gridcolor="#313244")
    fig.update_yaxes(title_text="Projeto", row=2, col=2, gridcolor="#313244")

    return fig


# =========================
# Utilitários de normalização
# =========================
def strip_accents_lower(s: str) -> str:
    if s is None:
        return ""
    s = str(s).strip()
    s_norm = unicodedata.normalize("NFKD", s)
    s_no_acc = "".join(ch for ch in s_norm if not unicodedata.combining(ch))
    return s_no_acc.lower()


def to_bool_concluido(x):
    if pd.isna(x):
        return None
    s = strip_accents_lower(x)

    truthy = {"sim", "s", "true", "1", "yes", "y", "concluido", "feito", "ok"}
    falsy = {"nao", "n", "false", "0", "no", "pendente"}

    if s in truthy:
        return True
    if s in falsy:
        return False

    if s.isdigit():
        return bool(int(s))
    if "sim" in s:
        return True
    if "nao" in s or "não" in s:
        return False
    return None


# =========================
# Model
# =========================
@dataclass
class StatusCounts:
    feitos: int
    pendentes: int

    @property
    def total_validos(self) -> int:
        return self.feitos + self.pendentes

    @property
    def eficiencia(self) -> float:
        t = self.total_validos
        return (100.0 * self.feitos / t) if t else 0.0


class ProductivityModel:
    def __init__(self, excel_path: str, col_concluido: str = CONCLUIDO_COL):
        self.excel_path = excel_path
        self.col_concluido = col_concluido
        self.df: Optional[pd.DataFrame] = None
        self.counts = StatusCounts(0, 0)
        self.git_df = pd.DataFrame()

    def load_git(self, root_dir="/home/pedrov12/Documentos/GitHub"):
        try:
            commits = obter_commits_git(root_dir)
            self.git_df = calcular_horas_desenvolvimento(commits)
        except Exception as e:
            print(f"Erro ao carregar métricas Git: {e}")
            self.git_df = pd.DataFrame()

    def load(self, path: Optional[str] = None):
        if path:
            self.excel_path = path
        if not self.excel_path:
            raise FileNotFoundError("Caminho do arquivo Excel não informado.")

        if not os.path.exists(self.excel_path):
            # modo demo
            data = {
                "Tarefa": [
                    "Estudar Plotly",
                    "Relatório ONS",
                    "Treino",
                    "Python Scripts",
                    "Reunião",
                    "Rust Basics",
                ],
                "Categoria": [
                    "Estudo",
                    "Trabalho",
                    "Saúde",
                    "TI",
                    "Trabalho",
                    "Estudo",
                ],
                "Concluído": ["Não", "Sim", "Sim", "Não", "Sim", "Não"],
                "Data": [
                    "07/02/2026",
                    "06/02/2026",
                    "07/02/2026",
                    "08/02/2026",
                    "06/02/2026",
                    "09/02/2026",
                ],
            }
            df = pd.DataFrame(data)
        else:
            # lê Excel/CSV
            if self.excel_path.lower().endswith(".csv"):
                df = pd.read_csv(self.excel_path)
            else:
                df = pd.read_excel(self.excel_path, engine="openpyxl")

        df.columns = df.columns.str.strip()

        # Normaliza Data (BR): dayfirst=True, drop NaT, sort
        if "Data" in df.columns:
            df["Data"] = pd.to_datetime(df["Data"], errors="coerce", dayfirst=True)

        # Normaliza status a partir da coluna Concluído
        if self.col_concluido in df.columns:
            b = df[self.col_concluido].map(to_bool_concluido)
            df["Status"] = b.map(
                lambda v: (
                    "Feito"
                    if v is True
                    else ("Pendente" if v is False else "Indefinido")
                )
            )
        elif "Status" not in df.columns:
            df["Status"] = "Pendente"

        # Atualiza contagens (desconsiderando Indefinido)
        feitos = int((df["Status"] == "Feito").sum())
        pend = int((df["Status"] == "Pendente").sum())
        self.counts = StatusCounts(feitos=feitos, pendentes=pend)

        self.df = df

    # Agregações auxiliares
    def category_counts(self) -> pd.Series:
        if self.df is None or "Categoria" not in self.df.columns:
            return pd.Series(dtype=int)
        return self.df["Categoria"].value_counts()

    def timeline_counts(self) -> pd.Series:
        if self.df is None or "Data" not in self.df.columns:
            return pd.Series(dtype=int)
        s = self.df["Data"].dropna()
        if s.empty:
            return pd.Series(dtype=int)
        series = self.df.loc[s.index].groupby(s.dt.date).size()
        if not series.empty:
            series = series.sort_index()
        return series


# =========================
# Plotly (View helper)
# =========================
class PlotlyWidget(QWebEngineView):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.page().setBackgroundColor(Qt.transparent)

    def set_figure(self, fig: go.Figure, include_js=False):
        plotly_js = True if include_js else "cdn"
        html = fig.to_html(include_plotlyjs=plotly_js, config={"displayModeBar": False})
        self.setHtml(html)


class GraphFactory:
    @staticmethod
    def pie_status(
        counts: StatusCounts, color_feito: str, color_pend: str, title: str
    ) -> go.Figure:
        labels = ["Feito", "Pendente"]
        values = [counts.feitos, counts.pendentes]
        colors = [color_feito, color_pend]
        fig = go.Figure(
            go.Pie(
                labels=labels,
                values=values,
                hole=0.55,
                marker=dict(colors=colors),
                textinfo="label+percent",
            )
        )
        fig.update_layout(
            title=dict(text=title, x=0.5), margin=dict(l=10, r=10, t=50, b=10)
        )
        return fig

    @staticmethod
    def gauge_eficiencia(value: float) -> go.Figure:
        fig = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=value,
                number={"suffix": "%"},
                gauge={
                    "axis": {"range": [0, 100]},
                    "bar": {"color": "#2ecc71"},
                    "steps": [
                        {"range": [0, 50], "color": "#8e2f2f"},
                        {"range": [50, 80], "color": "#a9822a"},
                        {"range": [80, 100], "color": "#1f5f2f"},
                    ],
                },
                domain={"x": [0, 1], "y": [0, 1]},
            )
        )
        fig.update_layout(
            margin=dict(l=10, r=10, t=50, b=10),
            title=dict(text="Eficiência Geral", x=0.5),
        )
        return fig

    @staticmethod
    def bar_categorias(series_counts: pd.Series, title: str) -> go.Figure:
        fig = go.Figure(
            go.Bar(
                x=series_counts.index,
                y=series_counts.values,
                marker_color="#3498db",
                text=series_counts.values,
                textposition="auto",
            )
        )
        fig.update_layout(
            title=dict(text=title, x=0.5),
            yaxis_title="Quantidade de Tarefas",
            margin=dict(l=20, r=20, t=50, b=20),
        )
        return fig

    @staticmethod
    def line_timeline(series_counts: pd.Series, title: str) -> go.Figure:
        # Formata datas como dd/MM/yyyy
        x_vals = [
            pd.to_datetime(str(d)).strftime("%d/%m/%Y") for d in series_counts.index
        ]
        fig = go.Figure(
            go.Scatter(
                x=x_vals,
                y=series_counts.values,
                mode="lines+markers",
                line=dict(color="#e67e22", width=3),
                marker=dict(size=8),
            )
        )
        fig.update_layout(
            title=dict(text=title, x=0.5),
            xaxis_title="Data",
            yaxis_title="Tarefas",
            margin=dict(l=20, r=20, t=50, b=20),
        )
        return fig


# =========================
# View (Qt)
# =========================
class MiniWindow(QMainWindow):
    """Janela extra simples para demonstrar abertura programática."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Hello Window — PVRV")
        self.setGeometry(300, 300, 360, 160)
        lbl = QLabel("Hello, Pedro! \nEsta é uma janela simples de teste.")
        lbl.setAlignment(Qt.AlignCenter)
        cont = QWidget()
        lay = QVBoxLayout(cont)
        lay.addWidget(lbl)
        self.setCentralWidget(cont)


class DashboardView(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Batcaverna PV - Dashboard Tático v5.0 (Plotly + MVC)")
        self.setGeometry(100, 100, 1280, 900)

        # Estado visual
        self.file_path = DEFAULT_XLSX
        self.color_feito = QColor(DEFAULT_COLOR_FEITO)
        self.color_pend = QColor(DEFAULT_COLOR_PEND)

        # Estilo Dark
        self.setStyleSheet(
            """
            QMainWindow { background-color: #1e1e1e; color: #e0e0e0; }
            QTabWidget::pane { border: 1px solid #444; background-color: #252526; border-radius: 5px; }
            QTabBar::tab { background: #2d2d30; color: #bbb; padding: 12px 20px; border-top-left-radius: 5px; border-top-right-radius: 5px; margin-right: 2px; }
            QTabBar::tab:selected { background: #3e3e42; color: #fff; border-bottom: 2px solid #3498db; font-weight: bold; }
            QTabBar::tab:hover { background: #333337; }
            QLabel { color: #ffffff; font-size: 14px; }
            QLineEdit { background-color: #333; color: white; padding: 8px; border: 1px solid #555; border-radius: 4px; }
            QPushButton { padding: 8px 15px; border-radius: 4px; font-weight: bold; }
            QTextEdit { background-color: #2d2d30; color: #eee; border: 1px solid #444; font-family: Consolas, monospace; font-size: 14px; padding: 10px; }
            """
        )

        # Cabeçalho
        header = QHBoxLayout()
        self.lbl_status = QLabel("📊 Inicializando Sistemas...")
        self.lbl_status.setStyleSheet(
            "font-size: 20px; font-weight: bold; color: #3498db;"
        )
        self.btn_reload = QPushButton("🔄 Recarregar Dados")
        self.btn_reload.setStyleSheet("background-color: #27ae60; color: white;")
        header.addWidget(self.lbl_status)
        header.addWidget(self.btn_reload, alignment=Qt.AlignRight)

        # Tabs
        self.tabs = QTabWidget()
        self.tab_ef = QWidget()  # Eficiência (rich)
        self.tab_cat = QWidget()  # Categorias (barras)
        self.tab_time = QWidget()  # Cronograma (linha)
        self.tab_git = QWidget()  # Git Produtividade
        self.tab_resumo = QWidget()  # Resumo/Eficiência texto
        self.tab_cfg = QWidget()  # Configurações + scripts
        self.tabs.addTab(self.tab_ef, "📈 Eficiência")
        self.tabs.addTab(self.tab_cat, "⚡ Categorias")
        self.tabs.addTab(self.tab_time, "📅 Cronograma")
        self.tabs.addTab(self.tab_git, "⚡ Git Produtividade")
        self.tabs.addTab(self.tab_resumo, "🧾 Resumo")
        self.tabs.addTab(self.tab_cfg, "⚙️ Configurações")

        # Layout raíz
        root = QVBoxLayout()
        root.addLayout(header)
        root.addWidget(self.tabs)
        container = QWidget()
        container.setLayout(root)
        self.setCentralWidget(container)

        # ------- Conteúdos de cada aba -------
        # Eficiência (grid com donut + gauge + markdown)
        ef_main = QHBoxLayout()
        self.tab_ef.setLayout(ef_main)

        left_col = QVBoxLayout()
        self.ef_donut = PlotlyWidget()
        left_col.addWidget(self.ef_donut)
        self.kpi_row = QHBoxLayout()
        self.card_total = self._make_kpi_card("Total Válidos", "0")
        self.card_feito = self._make_kpi_card("Concluídos", "0")
        self.card_pend = self._make_kpi_card("Pendentes", "0")
        self.kpi_row.addWidget(self.card_total)
        self.kpi_row.addWidget(self.card_feito)
        self.kpi_row.addWidget(self.card_pend)
        left_col.addLayout(self.kpi_row)

        right_col = QVBoxLayout()
        self.ef_gauge = PlotlyWidget()
        right_col.addWidget(self.ef_gauge)
        self.mdResumoEf = QTextEdit()
        self.mdResumoEf.setReadOnly(True)
        right_col.addWidget(self.mdResumoEf)

        ef_main.addLayout(left_col, 1)
        ef_main.addLayout(right_col, 1)

        # Categorias
        self.cat_layout = QVBoxLayout()
        self.tab_cat.setLayout(self.cat_layout)
        self.cat_plot = PlotlyWidget()
        self.cat_layout.addWidget(self.cat_plot)

        # Timeline
        self.time_layout = QVBoxLayout()
        self.tab_time.setLayout(self.time_layout)
        self.time_plot = PlotlyWidget()
        self.time_layout.addWidget(self.time_plot)

        # Resumo
        self.txtResumo = QTextEdit()
        self.txtResumo.setReadOnly(True)
        res_layout = QVBoxLayout()
        res_layout.addWidget(self.txtResumo)
        self.tab_resumo.setLayout(res_layout)

        # Git Produtividade Tab Layout
        git_layout = QVBoxLayout()
        self.tab_git.setLayout(git_layout)
        self.git_plot = PlotlyWidget()
        git_layout.addWidget(self.git_plot)

        # Configurações + Scripts
        form = QFormLayout()
        self.editFile = QLineEdit(self.file_path)
        self.btnSelect = QPushButton("Selecionar...")
        row_file = QHBoxLayout()
        row_file.addWidget(self.editFile)
        row_file.addWidget(self.btnSelect)
        form.addRow(QLabel("Arquivo Excel/CSV:"), row_file)

        self.btnColorFeito = QPushButton("Cor 'Feito'")
        self.swatchFeito = QLabel("  ")
        self.swatchFeito.setFixedSize(36, 18)
        self.swatchFeito.setStyleSheet(
            f"background-color: {self.color_feito.name()}; border: 1px solid #666;"
        )
        row_f = QHBoxLayout()
        row_f.addWidget(self.btnColorFeito)
        row_f.addWidget(self.swatchFeito)
        row_f.addStretch(1)
        form.addRow(QLabel("Feito:"), row_f)

        self.btnColorPend = QPushButton("Cor 'Pendente'")
        self.swatchPend = QLabel("  ")
        self.swatchPend.setFixedSize(36, 18)
        self.swatchPend.setStyleSheet(
            f"background-color: {self.color_pend.name()}; border: 1px solid #666;"
        )
        row_p = QHBoxLayout()
        row_p.addWidget(self.btnColorPend)
        row_p.addWidget(self.swatchPend)
        row_p.addStretch(1)
        form.addRow(QLabel("Pendente:"), row_p)

        # Botões de scripts (os.system)
        self.btnHelloOS = QPushButton("Executar Hello World (os.system)")
        self.btnOpenWindow = QPushButton("Abrir Janela Extra")
        form.addRow(self.btnHelloOS)
        form.addRow(self.btnOpenWindow)

        self.btnApply = QPushButton("Aplicar/Atualizar")
        form.addRow(self.btnApply)

        cfg_layout = QVBoxLayout()
        cfg_layout.addLayout(form)
        cfg_layout.addStretch(1)
        self.tab_cfg.setLayout(cfg_layout)

    def _make_kpi_card(self, title: str, value: str) -> QWidget:
        w = QWidget()
        v = QVBoxLayout(w)
        lbl_t = QLabel(title)
        lbl_t.setStyleSheet("color:#aaa; font-size:13px;")
        lbl_v = QLabel(value)
        lbl_v.setObjectName("value")
        lbl_v.setStyleSheet("font-size:24px; font-weight:bold; color:#fff;")
        v.addWidget(lbl_t)
        v.addWidget(lbl_v)
        v.setContentsMargins(12, 8, 12, 8)
        w.setStyleSheet(
            "background-color:#2d2d30; border:1px solid #444; border-radius:8px;"
        )
        return w

    # Helpers View
    def get_config(self) -> Tuple[str, QColor, QColor]:
        self.file_path = self.editFile.text().strip()
        return self.file_path, self.color_feito, self.color_pend

    def pick_color(self, current: QColor) -> Optional[QColor]:
        color = QColorDialog.getColor(current, self, "Escolher cor")
        if color.isValid():
            return color
        return None

    def set_summary(self, counts: StatusCounts):
        eff = counts.eficiencia
        feitos = counts.feitos
        pend = counts.pendentes
        tot = counts.total_validos
        if tot == 0:
            html = (
                "<h3>Eficiência</h3>"
                "<p><b>Sem dados válidos</b> na coluna 'Concluído'. Verifique a planilha.</p>"
            )
            md = "**Eficiência**\n\n- Sem dados válidos na coluna `Concluído`.\n\n> Verifique o arquivo fonte."
        else:
            html = (
                "<h3>Eficiência</h3>"
                f"<p>- Eficiência: <b>{eff:.1f}%</b> ({feitos}/{tot} concluídas)</p>"
                f"<p>- Não concluídas: <b>{pend}</b></p>"
                "<p><i>Cálculo: eficiência = (concluídas / válidas) × 100.</i></p>"
            )
            md = (
                f"### Eficiência\n\n"
                f"- **Eficiência**: **{eff:.1f}%**\n"
                f"- **Concluídas**: **{feitos}**\n"
                f"- **Pendentes**: **{pend}**\n"
                f"- **Válidas**: **{tot}**\n\n"
                "> Fórmula: `eficiência = concluídas / válidas × 100`."
            )
        self.txtResumo.setHtml(html)
        # Também escreve markdown dedicado na aba Eficiência
        self.mdResumoEf.setMarkdown(md)
        # Atualiza cards
        self._set_kpi_value(self.card_total, str(tot))
        self._set_kpi_value(self.card_feito, str(feitos))
        self._set_kpi_value(self.card_pend, str(pend))

    def _set_kpi_value(self, card: QWidget, text: str):
        for ch in card.findChildren(QLabel):
            if ch.objectName() == "value":
                ch.setText(text)
                break


# =========================
# Controller
# =========================
class DashboardController:
    def __init__(self, model: ProductivityModel, view: DashboardView):
        self.model = model
        self.view = view
        self.mini = None  # janela extra

        # Conectar sinais
        self.view.btn_reload.clicked.connect(self.on_reload)
        self.view.btnApply.clicked.connect(self.on_apply)
        self.view.btnSelect.clicked.connect(self.on_select)
        self.view.btnColorFeito.clicked.connect(self.on_pick_feito)
        self.view.btnColorPend.clicked.connect(self.on_pick_pend)
        self.view.btnHelloOS.clicked.connect(self.on_hello_os)
        self.view.btnOpenWindow.clicked.connect(self.on_open_window)

        # Inicializa
        self.bootstrap()

    def bootstrap(self):
        try:
            self.model.load(self.view.file_path)
            self.model.load_git()
            self.render_all()
            self.view.lbl_status.setText(
                f"📊 Análise Ativa - Total: {len(self.model.df)} Tarefas"
            )
            self.view.lbl_status.setStyleSheet(
                "color: #3498db; font-size: 18px; font-weight: bold;"
            )
        except Exception as e:
            self.view.lbl_status.setText(f"⚠️ Modo Demo / Erro: {e}")
            self.view.lbl_status.setStyleSheet(
                "color: #f39c12; font-size: 18px; font-weight: bold;"
            )
            self.render_all()

    def render_all(self):
        # Eficiência (donut + gauge + markdown/cards)
        pie = GraphFactory.pie_status(
            self.model.counts,
            self.view.color_feito.name(),
            self.view.color_pend.name(),
            DEFAULT_PIE_TITLE,
        )
        self.view.ef_donut.set_figure(pie)

        gauge = GraphFactory.gauge_eficiencia(self.model.counts.eficiencia)
        self.view.ef_gauge.set_figure(gauge)

        # Categorias (barras)
        cat_series = self.model.category_counts()
        if not cat_series.empty:
            bar = GraphFactory.bar_categorias(cat_series, DEFAULT_BAR_TITLE)
            self.view.cat_plot.set_figure(bar)
        else:
            self.view.cat_plot.setHtml("<p>Coluna 'Categoria' não encontrada.</p>")

        # Timeline (linha)
        time_series = self.model.timeline_counts()
        if not time_series.empty:
            line = GraphFactory.line_timeline(time_series, DEFAULT_LINE_TITLE)
            self.view.time_plot.set_figure(line)
        else:
            self.view.time_plot.setHtml("<p>Dados de Data inválidos ou ausentes.</p>")

        # Resumo + markdown na aba de Eficiência
        self.view.set_summary(self.model.counts)

        # Git Produtividade
        if not self.model.git_df.empty:
            git_fig = gerar_graficos_plotly_git(self.model.git_df)
            self.view.git_plot.set_figure(git_fig, include_js=True)
        else:
            self.view.git_plot.setHtml("<h3>Nenhum commit encontrado para gerar estatísticas Git.</h3>")

    # ----- Handlers -----
    def on_select(self):
        path, _ = QFileDialog.getOpenFileName(
            self.view,
            "Selecionar arquivo",
            "",
            "Arquivos de Dados (*.xlsx *.csv);;Todos (*.*)",
        )
        if path:
            self.view.editFile.setText(path)

    def on_reload(self):
        file_path, _, _ = self.view.get_config()
        try:
            self.model.load(file_path)
            self.model.load_git()
            self.view.lbl_status.setText(
                f"📊 Análise Ativa - Total: {len(self.model.df)} Tarefas"
            )
            self.view.lbl_status.setStyleSheet(
                "color: #3498db; font-size: 18px; font-weight: bold;"
            )
            self.render_all()
            QMessageBox.information(
                self.view, "Recarregado", "Planilha recarregada com sucesso."
            )
        except FileNotFoundError:
            QMessageBox.warning(
                self.view, "Arquivo", f"Arquivo não encontrado:\n{file_path}"
            )
        except KeyError as e:
            QMessageBox.critical(self.view, "Coluna ausente", str(e))
        except Exception as e:
            QMessageBox.critical(self.view, "Erro", f"Falha ao ler planilha:\n{e}")

    def on_apply(self):
        try:
            self.render_all()
        except Exception as e:
            QMessageBox.critical(self.view, "Erro", f"Falha ao atualizar:\n{e}")

    def on_pick_feito(self):
        color = self.view.pick_color(self.view.color_feito)
        if color:
            self.view.color_feito = color
            self.view.swatchFeito.setStyleSheet(
                f"background-color: {color.name()}; border: 1px solid #666;"
            )
            self.render_all()

    def on_pick_pend(self):
        color = self.view.pick_color(self.view.color_pend)
        if color:
            self.view.color_pend = color
            self.view.swatchPend.setStyleSheet(
                f"background-color: {color.name()}; border: 1px solid #666;"
            )
            self.render_all()

    def on_hello_os(self):
        # Executa comando simples no SO
        try:
            ret = os.system('echo "Hello, PVRV!"')
            QMessageBox.information(
                self.view, "OS", f"Comando executado com código: {ret}"
            )
        except Exception as e:
            QMessageBox.critical(self.view, "OS", f"Falha ao executar comando:\n{e}")

    def on_open_window(self):
        if self.mini is None:
            self.mini = MiniWindow()
        self.mini.show()
        self.mini.raise_()
        self.mini.activateWindow()


# =========================
# __main__
# =========================
if __name__ == "__main__":
    app = QApplication(sys.argv)
    model = ProductivityModel(excel_path=DEFAULT_XLSX, col_concluido=CONCLUIDO_COL)
    view = DashboardView()
    controller = DashboardController(model, view)

    view.show()
    sys.exit(app.exec())
