import os
import subprocess
import time
import pyautogui
from gtts import gTTS
import random
from headers import *

#! pip install google-generativeai pyttsx3 colorama python-dotenv pyautogui gTTS 

def falar(texto):
    try:
        print(f"Gerando audio: '{texto}'")
        tts = gTTS(text=texto, lang='pt-br')
        nome_arquivo = "/tmp/saudacao.mp3"
        tts.save(nome_arquivo)
        
        print("Executando audio...")
        subprocess.run(["mpg123", nome_arquivo], check=True, capture_output=True)
        os.remove(nome_arquivo)
    except FileNotFoundError:
        print("Erro: 'mpg123' nao encontrado. Por favor, instale-o (ex: sudo apt-get install mpg123).")
    except Exception as e:
        print(f"Ocorreu um erro ao tentar falar: {e}")

def abrir_aplicativos():

    print("\n--- Abrindo Aplicativos ---")

    todos_os_videos = VIDEOS_YOUTUBE_ESPIRITUALIDADE + VIDEOS_YOUTUBE_PRODUTIVIDADE
    video_aleatorio = random.choice(todos_os_videos) if todos_os_videos else None
    dashboard_path = "file:/home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/painel.html"

    for app in APLICATIVOS_PARA_ABRIR:
        try:
            comando = [app]
            print(f"Abrindo {app}...")
            if app == "brave":
                if video_aleatorio:
                    comando.extend([dashboard_path, video_aleatorio])
                else:
                    comando.append(dashboard_path)
            
            subprocess.Popen(comando)

            if app == "brave":
                print("Aguardando 5 segundos para o conteudo carregar...")
                time.sleep(1)
            else:
                time.sleep(2)  # um tempo para o sistema respirar entre cada app
        except FileNotFoundError:
            print(f"Erro: Comando '{app}' nao encontrado. Verifique o nome do aplicativo.")
        except Exception as e:
            print(f"Nao foi possivel abrir {app}: {e}")

def iniciar_projetos():

    print("\n--- Iniciando Projetos ---")
    for projeto in PROJETOS:
        print(f"Iniciando '{projeto['nome']}' em '{projeto['caminho']}'")
        falar(f"Iniciando {projeto['nome']} em segundo plano")
        
        
        if not os.path.isdir(projeto['caminho']):
            print(f"AVISO: O diretorio '{projeto['caminho']}' nao existe. Pulando este projeto.")
            continue

        try:
            env = os.environ.copy()
            comando_final = projeto['comando']
            
            if projeto.get("porta_env"):
                comando_final = f"{projeto['porta_env']} {comando_final}"

            subprocess.Popen(
                comando_final,
                cwd=projeto['caminho'],
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            porta = projeto.get('porta')
            if porta:
                print(f"'{projeto['nome']}' iniciado. Acesse em http://localhost:{porta}")
            else:
                print(f"'{projeto['nome']}' iniciado em segundo plano.")

            time.sleep(1)  # Tempo para o projeto iniciar
        except Exception as e:
            print(f"Erro ao iniciar o projeto '{projeto['nome']}': {e}")


def abrir_programa(name_program):
    pyautogui.press('win')
    time.sleep(1)
    pyautogui.write(name_program)
    time.sleep(1)
    pyautogui.press('enter')
    time.sleep(1) 


def automacao_com_teclado():

    print("\n--- Executando Automacao de Teclado ---")
    
    try:        
        def lauch_googleAgenda():
            falar("Abrindo seu Google Agenda e Analisando os projetos do dia...")
            time.sleep(2)
    
            abrir_programa("Calendar")

            # Altere os valores de x e y para a posi\00\00o desejada na tela.
            x_coord = 800
            y_coord = 600
            print(f"Movendo o mouse para ({x_coord}, {y_coord}) e clicando...")
            pyautogui.moveTo(x_coord, y_coord, duration=1.5)
            pyautogui.click()
        
        lauch_googleAgenda()

        abrir_programa("monitor do sistema")
        
        print("Automacao com pyautogui finalizada.")

    except Exception as e:
        print(f"Ocorreu um erro durante pyautogui: {e}")

comando_hibernar_Pc = "systemctl suspend-then-hibernate"


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

