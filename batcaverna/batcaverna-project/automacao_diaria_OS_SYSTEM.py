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

if __name__ == "__main__":
    try:

        abrir_aplicativos()

        falar(MENSAGEM_BOM_DIA)

        iniciar_projetos()

        automacao_com_teclado()

        print("\n---------------------------------")
        falar("Automação de Jarvis concluida! Tenha um ótimo dia, mestre Pedro!")

    except Exception as e:
        print(f"Ocorreu um erro durante {e}")
