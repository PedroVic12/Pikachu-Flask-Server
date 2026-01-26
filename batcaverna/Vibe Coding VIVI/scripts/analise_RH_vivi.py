import pandas as pd

sheetName = "Demostrativo - andamento "
arquivo_excel = r"C:\Users\pedrov12\Documents\GitHub\Pikachu-Flask-Server\batcaverna\Vibe Coding VIVI\Planilhas\Energia_Transversal - 2.xlsx"

df_energia_transversal = pd.read_excel(arquivo_excel,sheet_name=sheetName, skiprows=2)

print(df_energia_transversal)

df_energia_transversal.to_excel("analise_RH_viviane.xlsx")