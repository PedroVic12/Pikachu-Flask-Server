#  Abre um novo terminal
# Exemplos: "brave", "code" (para VSCode), "spotify",
APLICATIVOS_PARA_ABRIR = [
    "brave",
    "nemo",
]

VIDEOS_YOUTUBE_ESPIRITUALIDADE = [
    "https://www.youtube.com/watch?v=8b1k2a3X96c",
    "https://www.youtube.com/watch?v=ajga91x79Ms&t=1s",
    "https://www.youtube.com/watch?v=7I4_qsY-Uhg",
    "https://www.youtube.com/watch?v=1jmQYIkef9E",
    "https://www.youtube.com/@PadreManzottiOficial/videos",
]

VIDEOS_YOUTUBE_PRODUTIVIDADE = [
    "https://www.youtube.com/watch?v=8b1k2a3X96c",
    "https://www.youtube.com/watch?v=ajga91x79Ms&t=1s",
    "https://www.youtube.com/watch?v=Zmv2zulCphc&list=PL3CYy6s0NrgUrrZwxMU7uVAayuh2OB5gJ",
]
tarefas_ONS_PLC_file = "/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/planilhas/Tarefas_PLC_ONS (13-02-26).xlsx"


PROJETOS_EM_PRODUCAO = [
    "Quizz APP com IA",
    "Batcaverna + Astro System Pikachu web server",
    "Blog Astro pedrov12",
    "NextJS SEP para leigos ONS",
    "Gohan Treinamentos Web app antigo",
]

# Configure seus projetos aqui.
# Para cada projeto, informe o caminho absoluto, o comando e a porta.
PROJETOS = [
    {
        "nome": "App Flutter Controle Financeiro",
        "caminho": "/home/pedrov12/Documentos/GitHub/my-flutter-getx-template-app/my_template_app/",
        "comando": "flutter run",
        "porta_env": None,
        "porta": 8080,  # Porta padr\00o para web
    },
    {
        "nome": "Pikachu Rest API",
        "caminho": "/home/pedrov12/Documentos/GitHub/astro-blog-pedrov12/PVRV/flask_api_project/",
        "comando": "python main.py",
        "porta_env": None,
        "porta": 5555,  # Porta padrão do Flask Pikachu
    },
    {
        "nome": "Desktop Tauri PLC ONS",
        "caminho": "/home/pedrov12/Documentos/GitHub/dashboard-website-template/dashboard-must-tauri-app",
        "comando": "cargo tauri dev",
        "porta_env": None,
        "porta": 5556,
    },
    # {
    #     "nome": "DISCOVER THE UNIVERSE - ASTRO-SYSTEM",
    #     "caminho": "/home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/pikachu-API/astro-system/src",
    #     "comando": "python main.py",
    #     "porta_env": "FLASK_APP=app.py FLASK_ENV=development FLASK_RUN_PORT=5000",
    #     "porta": 5000 # Porta padrão Astro-Sytem flask
    # }
]


NOME_USUARIO = "Pedro Victor"
MENSAGEM_BOM_DIA = f"Olá, Bom dia, {NOME_USUARIO}! Iniciando sua estação de trabalho."
