import pandas as pd
import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from IPython.display import display

file_path = "/home/pedrov12/Documentos/GitHub/historico-projetos.csv"


def analisar():
    if not os.path.exists(file_path):
        print(f"Erro: O arquivo {file_path} não foi encontrado.")
        return

    try:
        # 1. Carregar Dados
        df = pd.read_csv(file_path)

        # 2. Converter Data e Ordenar
        df["Data"] = pd.to_datetime(df["Data"], errors="coerce")
        df = df.dropna(subset=["Data"])  # Remove datas inválidas
        df = df.sort_values(by="Data", ascending=True)  # Mais antigo para o mais novo

        print("-" * 60)
        print("🔍 1. AMOSTRA DOS DADOS (ORDENADOS POR DATA)")
        print("-" * 60)
        # Mostra as colunas principais das últimas 10 linhas (mais recentes)
        display(df[["Data", "Projeto", "Mensagem"]])

        # 3. Análise Mensal (Agrupamento)
        df["Periodo"] = df["Data"].dt.to_period(
            "M"
        )  # Cria coluna Jan-2025, Fev-2025...

        # Tabela Cruzada: Linhas = Mês, Colunas = Projeto, Valores = Contagem de Commits
        pivot_mensal = pd.crosstab(df["Periodo"], df["Projeto"])

        print("\n" + "-" * 60)
        print("📅 2. HISTÓRICO DE ATIVIDADE MENSAL (QTD COMMITS)")
        print("-" * 60)
        display(pivot_mensal)

        # 4. Total Geral por Mês (Acumulado do mês)
        total_por_mes = df.groupby("Periodo").size()

        print("\n" + "-" * 60)
        print("📈 3. EVOLUÇÃO TOTAL (SOMA DE TODOS OS PROJETOS)")
        print("-" * 60)
        display(total_por_mes)

        return df

    except Exception as e:
        print(f"Ocorreu um erro na análise: {e}")
        return None


def plotar_serie_temporal(df):
    """Plota série temporal com commits por projeto"""
    if df is None or df.empty:
        print("Erro: DataFrame vazio ou inválido.")
        return

    try:
        # Agrupa por data e projeto, contando commits
        df_temporal = df.groupby(["Data", "Projeto"]).size().reset_index(name="Commits")

        # Cria figura com tamanho maior
        plt.figure(figsize=(14, 7))

        # Plota cada projeto como uma linha
        for projeto in df_temporal["Projeto"].unique():
            dados_projeto = df_temporal[df_temporal["Projeto"] == projeto].sort_values(
                "Data"
            )
            plt.plot(
                dados_projeto["Data"],
                dados_projeto["Commits"],
                marker="o",
                label=projeto,
                linewidth=2,
            )

        plt.xlabel("Data", fontsize=12, fontweight="bold")
        plt.ylabel("Quantidade de Commits", fontsize=12, fontweight="bold")
        plt.title("Série Temporal: Commits por Projeto", fontsize=14, fontweight="bold")
        plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left", fontsize=9)
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()

        # Salva a figura
        plt.savefig(
            "/home/pedrov12/Documentos/GitHub/serie_temporal_commits.png",
            dpi=300,
            bbox_inches="tight",
        )
        print(
            "\n✅ Gráfico de série temporal salvo em: /home/pedrov12/Documentos/GitHub/serie_temporal_commits.png"
        )

        plt.show()

    except Exception as e:
        print(f"Erro ao plotar série temporal: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("ANÁLISE DE HISTÓRICO DE PROJETOS GIT")
    print("=" * 60)

    df = analisar()

    print("\n" + "=" * 60)
    print("GERANDO GRÁFICO DE SÉRIE TEMPORAL")
    print("=" * 60)
    plotar_serie_temporal(df)
