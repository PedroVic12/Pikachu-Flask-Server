import os
import subprocess
import time
import pyautogui
from gtts import gTTS
import random
from headers import *

#! pip install google-generativeai pyttsx3 colorama python-dotenv pyautogui gTTS

from c3po_modules.pc_tools import (
    falar,
    abrir_aplicativos,
    iniciar_projetos,
    automacao_com_teclado,
)

from c3po_modules.pc_data_analysis import analisar_tarefas_ONS

if __name__ == "__main__":
    try:

        abrir_aplicativos()

        falar(MENSAGEM_BOM_DIA)

        iniciar_projetos()

        falar(
            f"Você tem {len(PROJETOS_EM_PRODUCAO)} em produção rodando online pelo Github!"
        )

        status_counts = analisar_tarefas_ONS(excel_file=tarefas_ONS_PLC_file)

        falar(
            f"Você tem {status_counts.Não} Tarefas ONS pendentes. Você concluiu {status_counts.Sim} tarefas ONS PLC nesta semana"
        )

        automacao_com_teclado()

        print("\n---------------------------------")
        falar("Automação de Jarvis concluida! Tenha um ótimo dia, mestre Pedro!")

    except Exception as e:
        print(f"Ocorreu um erro durante {e}")
