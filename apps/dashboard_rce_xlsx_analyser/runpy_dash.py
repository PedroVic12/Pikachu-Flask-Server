import pandas as pd
import json

def main(params):
    # Lê o arquivo CSV enviado
    file = params['uploaded_file']
    data = pd.read_csv(file)
    
    # Retorna os dados como JSON
    return {
        "columns": list(data.columns),
        "data": data.to_dict(orient='records')
    }
