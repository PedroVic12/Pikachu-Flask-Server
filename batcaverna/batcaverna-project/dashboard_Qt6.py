import sys
import os
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio

# Configuração do Tema Dark para Plotly
pio.templates.default = "plotly_dark"

from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QWidget,
    QTabWidget,
    QLabel,
    QPushButton,
    QHBoxLayout,
    QLineEdit,
    QFileDialog,
    QFrame,
    QMessageBox,
    QTextEdit,
)
from PySide6.QtWebEngineWidgets import (
    QWebEngineView,
)  # Necessário para renderizar Plotly
from PySide6.QtCore import Qt, QUrl


# --- CLASSE GERADORA DE GRÁFICOS (POO / LÓGICA PURA) ---
class GraphGenerator:
    """
    Classe responsável por fabricar figuras do Plotly baseadas em inputs genéricos.
    Isso desacopla a lógica de dados da lógica de exibição.
    """

    @staticmethod
    def criar_grafico(tipo_grafico, x, y, z=None, titulo="", x_label="", y_label=""):
        """
        Gera um objeto go.Figure do Plotly.

        Args:
            tipo_grafico (str): 'pizza', 'barras', 'linha', 'scatter'
            x (list/series): Dados do eixo X ou Labels (para pizza)
            y (list/series): Dados do eixo Y ou Values (para pizza)
            z (list/series, opcional): Dados do eixo Z (para 3D)
            titulo (str): Título do gráfico
        """
        fig = go.Figure()

        # Lógica de Seleção de Gráfico
        if tipo_grafico == "pizza":
            # Cores personalizadas para status
            colors = ["#2ecc71", "#f39c12", "#e74c3c"]
            fig.add_trace(
                go.Pie(
                    labels=x,
                    values=y,
                    hole=0.4,  # Donut chart
                    marker=dict(colors=colors),
                    textinfo="label+percent",
                )
            )

        elif tipo_grafico == "barras":
            fig.add_trace(
                go.Bar(x=x, y=y, marker_color="#3498db", text=y, textposition="auto")
            )

        elif tipo_grafico == "linha":
            fig.add_trace(
                go.Scatter(
                    x=x,
                    y=y,
                    mode="lines+markers",
                    line=dict(color="#e74c3c", width=3),
                    marker=dict(size=8),
                )
            )

        elif tipo_grafico == "scatter_3d" and z is not None:
            fig.add_trace(
                go.Scatter3d(
                    x=x,
                    y=y,
                    z=z,
                    mode="markers",
                    marker=dict(size=5, color=z, colorscale="Viridis"),
                )
            )

        # Layout Comum (Estilo Batcaverna)
        fig.update_layout(
            title={
                "text": titulo,
                "y": 0.95,
                "x": 0.5,
                "xanchor": "center",
                "yanchor": "top",
                "font": dict(size=20, color="white"),
            },
            paper_bgcolor="rgba(0,0,0,0)",  # Fundo transparente para mesclar com App
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#cccccc"),
            margin=dict(l=20, r=20, t=50, b=20),
            xaxis_title=x_label,
            yaxis_title=y_label,
        )

        return fig


# --- WIDGET DE VISUALIZAÇÃO (INTERFACE) ---
class PlotlyWidget(QWebEngineView):
    """Widget customizado para exibir HTML do Plotly dentro do Qt"""

    def __init__(self, parent=None):
        super().__init__(parent)
        # Configurações para deixar o fundo transparente/mesclado
        self.page().setBackgroundColor(Qt.transparent)

    def set_figure(self, fig):
        """Converte a figura Plotly para HTML e renderiza"""
        # include_plotlyjs='cdn' deixa o HTML mais leve carregando JS da web
        # Se for usar offline total, mude para True (aumenta o peso)
        html = fig.to_html(include_plotlyjs="cdn", config={"displayModeBar": False})
        self.setHtml(html)


# --- JANELA PRINCIPAL ---
class BatcavernaDashboard(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Batcaverna PV - Dashboard Tático v3.0 (Plotly Edition)")
        self.setGeometry(100, 100, 1200, 850)

        self.default_file = "Tarefas_PLC_ONS_27_01_2026.xlsx"

        # Estilo Dark Mode (CSS Global)
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

        # Layout Principal
        self.main_widget = QWidget()
        self.setCentralWidget(self.main_widget)
        self.layout = QVBoxLayout(self.main_widget)
        self.layout.setSpacing(20)
        self.layout.setContentsMargins(30, 30, 30, 30)

        # --- SEÇÃO 1: CONTROLE DE ARQUIVO ---
        self.criar_secao_arquivo()

        # --- SEÇÃO 2: CABEÇALHO ---
        header_layout = QHBoxLayout()
        self.lbl_status = QLabel("📊 Inicializando Sistemas...")
        self.lbl_status.setStyleSheet(
            "font-size: 20px; font-weight: bold; color: #3498db;"
        )
        header_layout.addWidget(self.lbl_status)

        btn_refresh = QPushButton("🔄 Recarregar Dados")
        btn_refresh.setStyleSheet("background-color: #27ae60; color: white;")
        btn_refresh.clicked.connect(self.atualizar_tudo)
        header_layout.addWidget(btn_refresh, alignment=Qt.AlignRight)

        self.layout.addLayout(header_layout)

        # --- SEÇÃO 3: ABAS ---
        self.tabs = QTabWidget()
        self.layout.addWidget(self.tabs)

        self.tab1 = QWidget()
        self.tab2 = QWidget()
        self.tab3 = QWidget()
        self.tab4 = QWidget()

        self.tabs.addTab(self.tab1, "📈 Eficiência")
        self.tabs.addTab(self.tab2, "⚡ Categorias")
        self.tabs.addTab(self.tab3, "📅 Cronograma")
        self.tabs.addTab(self.tab4, "🧠 Agile Insights")

        # Inicialização
        self.df = pd.DataFrame()
        self.atualizar_tudo()

    def criar_secao_arquivo(self):
        file_frame = QFrame()
        file_frame.setStyleSheet(
            "background-color: #252526; border-radius: 8px; border: 1px solid #3e3e42;"
        )
        file_layout = QHBoxLayout(file_frame)
        file_layout.setContentsMargins(15, 10, 15, 10)

        lbl_path = QLabel("Arquivo Base:")
        lbl_path.setStyleSheet("color: #aaa; font-weight: bold;")

        self.txt_path = QLineEdit()
        self.txt_path.setText(self.default_file)
        self.txt_path.setPlaceholderText("Selecione um arquivo .xlsx ou .csv...")

        btn_import = QPushButton("📂 Importar")
        btn_import.setStyleSheet("background-color: #e67e22; color: white;")
        btn_import.clicked.connect(self.importar_arquivo)

        btn_export = QPushButton("💾 Exportar")
        btn_export.setStyleSheet("background-color: #9b59b6; color: white;")
        btn_export.clicked.connect(self.exportar_arquivo)

        file_layout.addWidget(lbl_path)
        file_layout.addWidget(self.txt_path, stretch=1)
        file_layout.addWidget(btn_import)
        file_layout.addWidget(btn_export)

        self.layout.addWidget(file_frame)

    def importar_arquivo(self):
        fname, _ = QFileDialog.getOpenFileName(
            self, "Importar Tarefas", "", "Arquivos de Dados (*.xlsx *.csv)"
        )
        if fname:
            self.txt_path.setText(fname)
            self.atualizar_tudo()

    def exportar_arquivo(self):
        if self.df.empty:
            QMessageBox.warning(self, "Aviso", "Não há dados carregados para exportar.")
            return
        fname, _ = QFileDialog.getSaveFileName(
            self,
            "Exportar Backup",
            "Backup_Tarefas_PVRV.xlsx",
            "Excel Files (*.xlsx);;CSV Files (*.csv)",
        )
        if fname:
            try:
                if fname.endswith(".csv"):
                    self.df.to_csv(fname, index=False)
                else:
                    self.df.to_excel(fname, index=False)
                QMessageBox.information(
                    self, "Sucesso", f"Arquivo exportado com sucesso!\n{fname}"
                )
            except Exception as e:
                QMessageBox.critical(self, "Erro", f"Falha ao exportar:\n{str(e)}")

    def carregar_dados(self):
        path = self.txt_path.text()
        df = pd.DataFrame()

        if not os.path.exists(path):
            self.lbl_status.setText("⚠️ Modo Demo (Plotly Edition)")
            self.lbl_status.setStyleSheet(
                "color: #f39c12; font-size: 18px; font-weight: bold;"
            )
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
                    "2026-02-07",
                    "2026-02-06",
                    "2026-02-07",
                    "2026-02-08",
                    "2026-02-06",
                    "2026-02-09",
                ],
            }
            df = pd.DataFrame(data)
        else:
            try:
                if path.endswith(".csv"):
                    df = pd.read_csv(path)
                else:
                    df = pd.read_excel(path)
                df.columns = df.columns.str.strip()
                self.lbl_status.setText(f"📊 Análise Ativa - Total: {len(df)} Tarefas")
                self.lbl_status.setStyleSheet(
                    "color: #3498db; font-size: 18px; font-weight: bold;"
                )
            except Exception as e:
                self.lbl_status.setText(f"❌ Erro de Leitura: {str(e)}")
                return pd.DataFrame()

        if not df.empty:
            if "Concluído" in df.columns:
                df["Status"] = df["Concluído"].apply(
                    lambda x: (
                        "Feito"
                        if str(x).lower() in ["sim", "true", "1", "yes"]
                        else "Pendente"
                    )
                )
            elif "Status" not in df.columns:
                df["Status"] = "Pendente"

            if "Data" in df.columns:
                df["Data"] = pd.to_datetime(df["Data"], errors="coerce")

        return df

    def atualizar_tudo(self):
        self.df = self.carregar_dados()
        self.limpar_layout(self.tab1)
        self.limpar_layout(self.tab2)
        self.limpar_layout(self.tab3)
        self.limpar_layout(self.tab4)

        if not self.df.empty:
            self.plot_status_geral()
            self.plot_categorias()
            self.plot_timeline()
            self.gerar_agile_insights()

    def limpar_layout(self, widget):
        if widget.layout() is not None:
            old_layout = widget.layout()
            while old_layout.count():
                child = old_layout.takeAt(0)
                if child.widget():
                    child.widget().deleteLater()
            del old_layout
        else:
            widget.setLayout(QVBoxLayout())

    # --- ABA 1: PIZZA (PLOTLY) ---
    def plot_status_geral(self):
        if "Status" in self.df.columns:
            contagem = self.df["Status"].value_counts()

            # Chama a Factory de Gráficos
            fig = GraphGenerator.criar_grafico(
                tipo_grafico="pizza",
                x=contagem.index,
                y=contagem.values,
                titulo="Status de Conclusão da Sprint",
            )

            # Cria o Widget e seta a figura
            plotly_view = PlotlyWidget()
            plotly_view.set_figure(fig)
            self.tab1.layout().addWidget(plotly_view)
        else:
            self.tab1.layout().addWidget(QLabel("Coluna 'Status' não encontrada"))

    # --- ABA 2: BARRAS (PLOTLY) ---
    def plot_categorias(self):
        if "Categoria" in self.df.columns:
            contagem = self.df["Categoria"].value_counts()

            fig = GraphGenerator.criar_grafico(
                tipo_grafico="barras",
                x=contagem.index,
                y=contagem.values,
                titulo="Carga de Trabalho por Área",
                y_label="Quantidade de Tarefas",
            )

            plotly_view = PlotlyWidget()
            plotly_view.set_figure(fig)
            self.tab2.layout().addWidget(plotly_view)
        else:
            self.tab2.layout().addWidget(QLabel("Coluna 'Categoria' não encontrada"))

    # --- ABA 3: LINHA (PLOTLY) ---
    def plot_timeline(self):
        if "Data" in self.df.columns and not self.df["Data"].isna().all():
            timeline = self.df.groupby(self.df["Data"].dt.date).size()

            fig = GraphGenerator.criar_grafico(
                tipo_grafico="linha",
                x=timeline.index,
                y=timeline.values,
                titulo="Evolução Temporal das Entregas",
                x_label="Data",
                y_label="Tarefas",
            )

            plotly_view = PlotlyWidget()
            plotly_view.set_figure(fig)
            self.tab3.layout().addWidget(plotly_view)
        else:
            self.tab3.layout().addWidget(QLabel("Dados de Data inválidos ou ausentes"))

    # --- ABA 4: AGILE INSIGHTS (TEXTO) ---
    def gerar_agile_insights(self):
        if "Status" not in self.df.columns:
            return

        total = len(self.df)
        feitos = len(self.df[self.df["Status"] == "Feito"])
        pendentes = total - feitos
        eficiencia = (feitos / total * 100) if total > 0 else 0
        categorias = self.df["Categoria"].value_counts()
        top_categoria = categorias.idxmax() if not categorias.empty else "N/A"

        report = f"""
        <h2 style="color: #3498db;">🧠 Relatório Agile & IA (Futuro)</h2>
        <hr>
        <div style="background-color: #252526; padding: 15px; border-radius: 8px; border-left: 5px solid #e67e22;">
            <h3 style="color: #e67e22; margin-top: 0;">📋 Diagnóstico Atual</h3>
            <ul>
                <li><b>Total Backlog:</b> {total} itens</li>
                <li><b>Concluído:</b> {feitos} ({eficiencia:.1f}%)</li>
                <li><b>Gargalo Atual:</b> {pendentes} tarefas pendentes</li>
            </ul>
        </div>
        <br>
        <div style="background-color: #252526; padding: 15px; border-radius: 8px; border-left: 5px solid #2ecc71;">
            <h3 style="color: #2ecc71; margin-top: 0;">🤖 Recomendação do Sistema</h3>
        """

        if eficiencia >= 80:
            report += "<p>Velocidade Alta. Você está pronto para tarefas mais complexas de Rust ou Python Avançado.</p>"
        elif eficiencia >= 50:
            report += f"<p>Ritmo Sustentável. Mantenha o foco na categoria <b>{top_categoria}</b> para fechar o ciclo.</p>"
        else:
            report += "<p>Bloqueio Detectado. Sugestão: Aplique técnica Pomodoro e quebre a tarefa 'Eat the Frog' em micro-passos.</p>"

        report += """
        </div>
        <br>
        <p style='color: #888; font-style: italic;'>
            * No futuro, este espaço será conectado à API do Google Gemini para sugerir 
            prioridades baseadas no histórico da semana anterior.
        </p>
        """

        text_edit = QTextEdit()
        text_edit.setHtml(report)
        text_edit.setReadOnly(True)
        self.tab4.layout().addWidget(text_edit)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = BatcavernaDashboard()
    window.show()
    sys.exit(app.exec())
