import pandas as pd
import matplotlib.pyplot as plt
import os

# Caminho simulado - ajuste para o caminho real do seu arquivo
# Ex: file_path = "../batcaverna/Projeto_Tarefas_04_02_2026.xlsx"
# Como não tenho o arquivo real aqui, vou criar um dummy para teste
file_path = "/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/planilhas/Projeto_Tarefas_04_02_2026.xlsx"


def criar_dummy_se_nao_existir():
    if not os.path.exists(file_path):
        data = {
            "Tarefa": [
                "Estudar Julia",
                "Refatorar Kanban",
                "Reunião ONS",
                "Criar Script Python",
            ],
            "Categoria": ["Estudos", "Frontend", "Trabalho", "Backend"],
            "Concluído": ["Sim", "Não", "Sim", "Sim"],
        }
        df = pd.DataFrame(data)
        df.to_excel(file_path, index=False)
        print(f"Arquivo de teste criado: {file_path}")


def analisar_tarefas():
    try:
        # Tenta ler o arquivo
        if not os.path.exists(file_path):
            criar_dummy_se_nao_existir()

        df = pd.read_excel(file_path)

        print("--- Resumo das Tarefas ---")
        print(df.head())

        # Normalizar coluna Concluído (caso tenha Sim/Não, True/False)
        df["Status"] = df["Concluído"].apply(
            lambda x: "Feito" if str(x).lower() in ["sim", "true", "1"] else "Pendente"
        )

        # Estatísticas
        total = len(df)
        feitos = len(df[df["Status"] == "Feito"])
        pendentes = total - feitos

        print(f"\nTotal: {total} | Feitos: {feitos} | Pendentes: {pendentes}")
        print(f"Eficiência: {(feitos/total)*100:.1f}%")

        # Gráfico
        plt.figure(figsize=(8, 5))
        counts = df["Status"].value_counts()
        counts.plot(kind="bar", color=["#4caf50", "#f59e0b"])
        plt.title(f"Status das Tarefas - {pd.Timestamp.now().strftime('%d/%m/%Y')}")
        plt.ylabel("Quantidade")
        plt.grid(axis="y", alpha=0.3)
        plt.legend(counts.index)
        plt.show()

        # Salvar gráfico
        output_img = "dashboard_status_hoje.png"
        plt.savefig(output_img)
        print(f"\nGráfico salvo como: {output_img}")

    except Exception as e:
        print(f"Erro ao processar: {e}")


if __name__ == "__main__":
    analisar_tarefas()
