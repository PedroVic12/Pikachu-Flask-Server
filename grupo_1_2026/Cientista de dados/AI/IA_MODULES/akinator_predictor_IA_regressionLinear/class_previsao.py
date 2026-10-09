import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split


import sveetviz as sv


# Carrega o dataset
df_dsa = pd.read_csv('dataset.csv')


#https://github.com/infoslack/ml-book-exemplos/blob/main/analise_exploratoria_de_dados.ipynb


class DataScienceAnalises:
    def __init__():
        pass
    
    def analise_inicial(self,df_dsa):
        print(f"Tamanho: {df_dsa.shape}")
        print(f"Colunas: {df_dsa.columns}")
        df_dsa.head()
        print(f"Info: {df_dsa.info()}")
        print(f"Valores ausentes?: {df_dsa.isnull().sum()}")
        print(f"Correlação entre colunas: {df_dsa.corr()}")
        print(f"Analise descritiva simples : {df_dsa.describe()}")
        
        
    def dashboard_inicial(self,df):
        my_report = sv.analyze(df)
        my_report.show_html()
        
    def _compararTabelas(self,df1,df2,nomes):
        print(df1.shape)
        print(df2.shape)
        report = sv.compare(df1,nomes[0],df2,nomes[1])
        report.show_html()
    
    def analise_exploratoria(self,df):
        pass
        
    def plots(self,df,coluna_alvo,col,tipo = None):
    
        #barras 
        #mean, sum, count  como tipo da plotagem
        plt.bar(x = df.groupby(coluna_alvo)[col].mean().index,
            height = df.groupby(coluna_alvo)[col].mean()
        )
        plt.grid()
        plt.show()
        
        # var categorias
        sns.catplot(x = coluna_alvo, kind = "count", data = df)
        
        # dispersao com reg linear
        #sns.reqplot()
        
        plt.scatter(df[coluna_alvo] , df [col])
        
        #box_plot
        
        #histograma
        sns.histplot(data = df, x = coluna_alvo, kde = True)


class DataSciencePrevisao:
    def __init__():
        self.dsa = DataScienceAnalises()

        # Cria o modelo de regressão linear simples
        self.modelo = LinearRegression()


    def train_linear_regression(self,X_treino,y_treino,X_teste,y_teste):
        # Treina o modelo
        self.modelo.fit(X_treino, y_treino)

        # Avalia o modelo nos dados de teste
        score = self.modelo.score(X_teste, y_teste)
        print(f"Coeficiente R^2: {score:.2f}")

        # Intercepto - parâmetro w0
        print("WO = ",self.modelo.intercept_)

        # Slope - parâmetro w1
        print("W1 = ",self.modelo.coef_)

    def generative_results(self,value,X, y):
        # Define um novo valor para horas de estudo
        horas_estudo_novo = np.array([[value]]) 

        # Faz previsão com o modelo treinado
        salario_previsto = self.modelo.predict(horas_estudo_novo)

        print(f"Se você estudar cerca de", horas_estudo_novo, "horas por mês seu salário pode ser igual a", salario_previsto)

        # Visualiza a reta de regressão linear (previsões) e os dados reais usados no treinamento
        plt.scatter(X, y, color = "blue", label = "Dados Reais Históricos")
        plt.plot(X, self.modelo.predict(X), color = "red", label = "Reta de Regressão com as Previsões do Modelo")
        plt.xlabel("Horas de Estudo")
        plt.ylabel("Salário")
        plt.legend()
        plt.show()

    def scatter_plot(self,X,y,x_label,y_label,_label = "",):
        # Gráfico de dispersão entre X e y
        plt.scatter(X, y, color = "blue", label = _label)
        plt.xlabel(x_label)
        plt.ylabel(y_label)
        plt.legend()
        plt.show()

    def histograma_variavel_preditora(self,df_dsa,coluna):
        # Histograma da variável preditora
        sns.histplot(data = df_dsa, x = coluna, kde = True)
        
        
        