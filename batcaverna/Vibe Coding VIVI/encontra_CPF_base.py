"""
SCRIPT - LER CPFS DUPLICADOS
"""

import pandas as pd

arquivo = "Base consolidada.xlsx"  #! planilha na mesma pasta do código


arquivo = "/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/Vibe Coding VIVI/Base consolidada.xlsx"


abas = pd.read_excel(arquivo, sheet_name=None, engine="openpyxl", skiprows=1)

lista_dfs = []

for nome_aba, df in abas.items():
    try:
        # Selecionar apenas as colunas necessárias
        df = df[["Colaborador", "CPF", "Cargo", "Natureza Profissional"]].copy()

        # Adicionar mês/ano
        df["Mes_Ano"] = nome_aba

        # Remover linhas sem CPF
        df = df.dropna(subset=["CPF"])

        print(f"✅ {nome_aba}: {len(df)} registros")
        lista_dfs.append(df)

    except Exception as e:
        print(f"⚠️ Erro em {nome_aba}: {e}")


# Validar e concatenar
if len(lista_dfs) == 0:
    raise ValueError("❌ Nenhuma aba processada")

base_final = pd.concat(lista_dfs, ignore_index=True)

# Contar em quantos meses DIFERENTES cada CPF aparece
cpf_meses = base_final.groupby("CPF")["Mes_Ano"].nunique()

# Filtrar CPFs que aparecem em mais de 1 mês
cpfs_repetidos = cpf_meses[cpf_meses > 1].index.tolist()

# Pegar todos os registros desses CPFs
resultado = base_final[base_final["CPF"].isin(cpfs_repetidos)].sort_values(
    ["CPF", "Mes_Ano"]
)

# Salvar
saida = "cpfs_repetidos_2022_2026.xlsx"
resultado.to_excel(saida, index=False)

print(f"\n✅ FINALIZADO")
print(f"📂 Arquivo: {saida}")
print(f"📊 Total de CPFs únicos repetidos: {len(cpfs_repetidos)}")
print(f"📊 Total de registros: {len(resultado)}")


# Mostrar resumo
def show_resumo():
    print("\n--- RESUMO POR CPF ---")
    for cpf in cpfs_repetidos[:20]:  # primeiros 20
        meses = base_final[base_final["CPF"] == cpf]["Mes_Ano"].unique()
        nome = base_final[base_final["CPF"] == cpf]["Colaborador"].iloc[0]
        print(f"{cpf} ({nome}): {len(meses)} meses - {', '.join(meses)}\n\n")
