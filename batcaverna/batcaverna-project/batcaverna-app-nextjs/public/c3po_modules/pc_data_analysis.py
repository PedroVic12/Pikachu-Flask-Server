import pandas as pd
import matplotlib.pyplot as plt


def analisar_tarefas_ONS(excel_file):
    # Ler o arquivo
    df = pd.read_excel(excel_file)

    # Contar Status
    status_counts = df["Concluído"].value_counts()

    print(status_counts)

    # Plotar
    status_counts.plot(kind="bar", color=["green", "red"])
    plt.title("Produtividade Diária")
    plt.show()

    return status_counts
