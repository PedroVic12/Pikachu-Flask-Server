class DataScience():
    def __init__(self):
        pass

    def agrupar_dados(self, data, coluna):
        return data.groupby(coluna).sum()
    
    def rankear_valores():
        pass

    def entender_dados(self, data):
        print(data.head())
        print(data.describe())
        print(data.info())
        print(data.columns)
        print(data.isnull().sum())

    def juntar_dataframes_colunaID(self, df1, df2, id):
        return pd.merge(df1, df2, on=id)

    def renomear_colunas(self, data, colunas):
        return data.rename(columns=colunas)
