import sys
import os
import pandas as pd
import matplotlib

# --- CORREÇÃO DO ERRO ---
# Forçamos o matplotlib a usar o backend compatível com o binding Qt atual (PySide6)
matplotlib.use("QtAgg")

import matplotlib.pyplot as plt

# Alterado de 'backend_qt5agg' para 'backend_qtagg' para suportar PySide6
try:
    from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
except ImportError:
    # Fallback caso esteja usando uma versão muito antiga do Matplotlib
    from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

from matplotlib.figure import Figure
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QWidget,
    QTabWidget,
    QLabel,
    QPushButton,
    QHBoxLayout,
)
from PySide6.QtCore import Qt

# --- CONFIGURAÇÃO ---
# Ajuste para o caminho do seu arquivo real ou use o dummy para teste
FILE_PATH = "/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/planilhas/Projeto_Tarefas_04_02_2026.xlsx"


# --- CLASSE DO GRÁFICO (MATPLOTLIB DENTRO DO QT) ---
class MplCanvas(FigureCanvas):
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        # Cria a figura do Matplotlib
        self.fig = Figure(figsize=(width, height), dpi=dpi)
        self.axes = self.fig.add_subplot(111)
        super(MplCanvas, self).__init__(self.fig)


# --- JANELA PRINCIPAL ---
class BatcavernaDashboard(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Batcaverna PV - Dashboard Tático")
        self.setGeometry(100, 100, 1000, 700)

        # Estilo Dark Mode Básico
        self.setStyleSheet(
            """
            QMainWindow { background-color: #2b2b2b; color: #ffffff; }
            QTabWidget::pane { border: 1px solid #444; }
            QTabBar::tab { background: #3c3c3c; color: #fff; padding: 10px; }
            QTabBar::tab:selected { background: #505050; border-bottom: 2px solid #3498db; }
            QLabel { color: #ffffff; font-size: 14px; }
        """
        )

        # Carregar Dados
        self.df = self.carregar_dados()

        # Layout Principal com Abas
        self.main_widget = QWidget()
        self.setCentralWidget(self.main_widget)
        self.layout = QVBoxLayout(self.main_widget)

        # Cabeçalho
        header_layout = QHBoxLayout()
        title = QLabel(f"📊 Análise de Tarefas - Total: {len(self.df)}")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #3498db;")
        header_layout.addWidget(title)

        btn_refresh = QPushButton("Atualizar Dados")
        btn_refresh.setStyleSheet(
            "background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 4px;"
        )
        btn_refresh.clicked.connect(self.atualizar_tudo)
        header_layout.addWidget(btn_refresh)

        self.layout.addLayout(header_layout)

        # Sistema de Abas
        self.tabs = QTabWidget()
        self.layout.addWidget(self.tabs)

        # Criar as 3 Abas
        self.tab1 = QWidget()
        self.tab2 = QWidget()
        self.tab3 = QWidget()

        self.tabs.addTab(self.tab1, "📈 Status Geral")
        self.tabs.addTab(self.tab2, "⚡ Carga por Categoria")
        self.tabs.addTab(self.tab3, "📅 Linha do Tempo")

        # Inicializar Gráficos
        self.plot_status_geral()
        self.plot_categorias()
        self.plot_timeline()

    def carregar_dados(self):
        """Lê o Excel ou cria dados dummy se não existir"""
        if not os.path.exists(FILE_PATH):
            print("⚠️ Arquivo não encontrado, gerando dados de teste...")
            data = {
                "Tarefa": [
                    "Estudar PySide6",
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
                    "2026-02-07",
                    "2026-02-06",
                    "2026-02-07",
                    "2026-02-08",
                    "2026-02-06",
                    "2026-02-09",
                ],
            }
            return pd.DataFrame(data)

        try:
            # Tenta ler CSV ou Excel
            if FILE_PATH.endswith(".csv"):
                df = pd.read_csv(FILE_PATH)
            else:
                df = pd.read_excel(FILE_PATH)

            # Normalização de Nomes de Colunas (strip espaços)
            df.columns = df.columns.str.strip()

            # Normalização do Status (Sim/Não/True/False)
            df["Status"] = df["Concluído"].apply(
                lambda x: (
                    "Feito"
                    if str(x).lower() in ["sim", "true", "1", "yes"]
                    else "Pendente"
                )
            )

            # Converter Data
            if "Data" in df.columns:
                df["Data"] = pd.to_datetime(df["Data"], errors="coerce")

            return df
        except Exception as e:
            print(f"Erro ao ler arquivo: {e}")
            return pd.DataFrame()  # Retorna vazio em caso de erro crítico

    def atualizar_tudo(self):
        self.df = self.carregar_dados()
        # Limpa layouts antigos para redesenhar
        self.limpar_layout(self.tab1)
        self.limpar_layout(self.tab2)
        self.limpar_layout(self.tab3)

        self.plot_status_geral()
        self.plot_categorias()
        self.plot_timeline()

    def limpar_layout(self, widget):
        if widget.layout() is not None:
            old_layout = widget.layout()
            while old_layout.count():
                child = old_layout.takeAt(0)
                if child.widget():
                    child.widget().deleteLater()
            del old_layout

    # --- ABA 1: PIZZA (Feito vs Pendente) ---
    def plot_status_geral(self):
        layout = QVBoxLayout()
        sc = MplCanvas(self, width=5, height=4, dpi=100)

        contagem = self.df["Status"].value_counts()

        # Cores: Verde para Feito, Laranja para Pendente
        colors = ["#2ecc71", "#f39c12"] if "Feito" in contagem else ["#f39c12"]

        sc.axes.pie(
            contagem,
            labels=contagem.index,
            autopct="%1.1f%%",
            startangle=90,
            colors=colors,
            textprops={"color": "w"},
        )
        sc.axes.set_title("Eficiência Atual", color="white")
        sc.fig.patch.set_facecolor("#2b2b2b")  # Fundo Dark

        layout.addWidget(sc)
        self.tab1.setLayout(layout)

    # --- ABA 2: BARRAS (Por Categoria) ---
    def plot_categorias(self):
        layout = QVBoxLayout()
        sc = MplCanvas(self, width=5, height=4, dpi=100)

        if "Categoria" in self.df.columns:
            contagem = self.df["Categoria"].value_counts()
            bars = sc.axes.bar(contagem.index, contagem.values, color="#3498db")

            sc.axes.set_title("Volume de Tarefas por Área", color="white")
            sc.axes.tick_params(colors="white", axis="x", rotation=15)
            sc.axes.tick_params(colors="white", axis="y")
            sc.axes.spines["bottom"].set_color("white")
            sc.axes.spines["left"].set_color("white")
            sc.axes.set_facecolor("#2b2b2b")
            sc.fig.patch.set_facecolor("#2b2b2b")
        else:
            sc.axes.text(
                0.5, 0.5, "Coluna 'Categoria' não encontrada", color="red", ha="center"
            )

        layout.addWidget(sc)
        self.tab2.setLayout(layout)

    # --- ABA 3: LINHA (Tarefas por Data) ---
    def plot_timeline(self):
        layout = QVBoxLayout()
        sc = MplCanvas(self, width=5, height=4, dpi=100)

        if "Data" in self.df.columns and not self.df["Data"].isna().all():
            timeline = self.df.groupby(self.df["Data"].dt.date).size()

            sc.axes.plot(
                timeline.index,
                timeline.values,
                marker="o",
                linestyle="-",
                color="#e74c3c",
            )
            sc.axes.set_title("Distribuição de Tarefas no Tempo", color="white")
            sc.axes.tick_params(colors="white", rotation=45)
            sc.axes.set_facecolor("#2b2b2b")
            sc.fig.patch.set_facecolor("#2b2b2b")
            sc.fig.autofmt_xdate()  # Ajusta datas no eixo X
        else:
            sc.axes.text(
                0.5, 0.5, "Sem dados de Data válidos", color="yellow", ha="center"
            )

        layout.addWidget(sc)
        self.tab3.setLayout(layout)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = BatcavernaDashboard()
    window.show()
    sys.exit(app.exec())
