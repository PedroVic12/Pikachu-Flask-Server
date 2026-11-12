

from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd
from ml_framework import TratamentoDeDados, AnaliseDeDados, ModelosMLAI, DashboardApp


# Passo a passo
# Passo 0 - Entender a empresa e o desafio da empresa
# Passo 1 - Importar a base de dados
import pandas as pd


SCORE_CREDIT_CLIENTES_DATASET = r"C:\Users\Pedro Victor R V\Documents\GitHub\developer-engenheiro-cientista\CIENCIA_DE_DADOS\AI\IA_MODULES\machine_learning\notebooks\assets\clientes.csv"

tabela = pd.read_csv(SCORE_CREDIT_CLIENTES_DATASET)

print(tabela)

# Score de crédito = Nota de crédito
# Good = Boa
# Standard = OK
# Poor = Ruim

# Passo 2 - Preparar a base de dados para a Inteligência Artificial
print(tabela.info())

# int -> numero inteiro
# float -> numero com casa decimal
# object -> texto

# LabelEncoder
from sklearn.preprocessing import LabelEncoder

# profissao

# cientista - 1
# bombeiro - 2
# engenheiro - 3
# dentista - 4
# artista - 5


tabela = pd.read_csv(SCORE_CREDIT_CLIENTES_DATASET)

tratamento = TratamentoDeDados(tabela)
x_treino, x_teste, y_treino, y_teste = tratamento.preparar_dados()

analise = AnaliseDeDados(tabela)
analise.mostrar_correlacao()
print(analise.descrever_dados())

modelos = ModelosMLAI()
modelos.adicionar_modelo("Random Forest", RandomForestClassifier())
modelos.adicionar_modelo("KNN", KNeighborsClassifier())
modelos.treinar_modelos(x_treino, y_treino)
resultados = modelos.avaliar_modelos(x_teste, y_teste)

dashboard = DashboardApp(resultados)
dashboard.mostrar_resultados()
