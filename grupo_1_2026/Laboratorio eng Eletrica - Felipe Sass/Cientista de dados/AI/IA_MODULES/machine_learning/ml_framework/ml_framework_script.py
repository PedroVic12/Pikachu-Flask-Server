# ml_framework.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

class TratamentoDeDados:
    def __init__(self, dataframe: pd.DataFrame):
        self.df = dataframe

    def preparar_dados(self):
        x = self.df.drop(["score_credito", "id_cliente"], axis=1)
        y = self.df["score_credito"]
        return train_test_split(x, y, test_size=0.3, random_state=1)

class AnaliseDeDados:
    def __init__(self, dataframe: pd.DataFrame):
        self.df = dataframe

    def mostrar_correlacao(self):
        plt.figure(figsize=(10, 8))
        sns.heatmap(self.df.corr(), annot=True, cmap='coolwarm')
        plt.title("Mapa de Correlação")
        plt.show()

    def descrever_dados(self):
        return self.df.describe()

class ModelosMLAI:
    def __init__(self):
        self.modelos = {}

    def adicionar_modelo(self, nome: str, modelo):
        self.modelos[nome] = modelo

    def treinar_modelos(self, x_treino, y_treino):
        for nome, modelo in self.modelos.items():
            modelo.fit(x_treino, y_treino)

    def avaliar_modelos(self, x_teste, y_teste):
        resultados = {}
        for nome, modelo in self.modelos.items():
            previsoes = modelo.predict(x_teste)
            acuracia = accuracy_score(y_teste, previsoes)
            resultados[nome] = acuracia
        return resultados

class DashboardApp:
    def __init__(self, resultados):
        self.resultados = resultados

    def mostrar_resultados(self):
        nomes = list(self.resultados.keys())
        scores = list(self.resultados.values())

        plt.figure(figsize=(8, 5))
        #sns.barplot(x=nomes, y=scores)
        plt.ylim(0, 1)
        plt.title("Acurácia dos Modelos")
        plt.ylabel("Acurácia")
        plt.xlabel("Modelo")
        plt.show()
