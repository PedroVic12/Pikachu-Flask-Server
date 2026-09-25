"""
===================================================================================
GERADOR DE TABELA VERDADE E SOMA DE PRODUTOS (SOP) PARA O ROBÔ LUTADOR
UFF - ENG. ELÉTRICA (LABORATÓRIO DE ENG. ELÉTRICA - PROF. FELIPE SASS)
===================================================================================
"""

import pandas as pd

# Entradas do Sistema (4 Variáveis Lógicas Digitais):
# E0: Sensor QRE1113 Borda Branca (0 = Arena Preta, 1 = Borda Branca)
# E1: Sensor Ultrassônico HC-SR04 (0 = Oponente Longe >= 20cm, 1 = Oponente Perto < 20cm)
# E2: IR Sony Botão 2 / Start (0 = Desativado, 1 = Pressionado)
# E3: IR Sony Botão 3 / Stop (0 = Desativado, 1 = Pressionado)

linhas = []

for E3 in [0, 1]:
    for E2 in [0, 1]:
        for E1 in [0, 1]:
            for E0 in [0, 1]:
                # Lógica de Saída do Robô Lutador
                if E3 == 1:
                    # Trava de Emergência / Parar Definitivo
                    frente, re, parar = 0, 0, 1
                    estado = "ESTADO_PARADO_DEFINITIVO (FIM)"
                elif E0 == 1:
                    # Detecção de Borda Branca -> Segurança Esquiva (Ré)
                    frente, re, parar = 0, 1, 0
                    estado = "ESTADO_ESQUIVAR_BORDA"
                elif E2 == 1 and E1 == 1:
                    # Ataque Carga Total (Oponente Perto < 20cm)
                    frente, re, parar = 1, 0, 0
                    estado = "ESTADO_ATACAR"
                elif E2 == 1 and E1 == 0:
                    # Varredura / Ré de busca
                    frente, re, parar = 0, 1, 0
                    estado = "ESTADO_BUSCAR"
                else:
                    # Repouso / Desligado
                    frente, re, parar = 0, 0, 1
                    estado = "ESTADO_PARADO"

                linhas.append({
                    "E3_Stop": E3,
                    "E2_Start": E2,
                    "E1_Inimigo": E1,
                    "E0_Borda": E0,
                    "S_Frente": frente,
                    "S_Re": re,
                    "S_Parar": parar,
                    "Estado_Robo": estado
                })

df_tabela = pd.DataFrame(linhas)






print("===================================================================================")
print("              TABELA VERDADE DAS VARIÁVEIS DE ENTRADA DO ROBÔ LUTADOR               ")
print("===================================================================================")
print(df_tabela.to_string(index=False))

# Expressões de Soma de Produtos (SOP - Sum of Products)
sop_frente = df_tabela[df_tabela["S_Frente"] == 1]
sop_re = df_tabela[df_tabela["S_Re"] == 1]
sop_parar = df_tabela[df_tabela["S_Parar"] == 1]

print("\n--- SOMA DE PRODUTOS (SOP - EQUAÇÕES BOOLEANAS) ---")
print("S_Frente (Ataque) = E3' . E2 . E1 . E0'")
print("S_Re (Busca/Esquiva) = E3' . E0 + E3' . E2 . E1'")
print("S_Parar (Emergência/Repouso) = E3 + E2' . E0'")

# Salvando a tabela verdade em Markdown para compilação Quarto
df_tabela.to_markdown("tabela_verdade_robo.md", index=False)
