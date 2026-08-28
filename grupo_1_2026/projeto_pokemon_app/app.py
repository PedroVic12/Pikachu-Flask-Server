import sys
import threading
import time
import requests
from dataclasses import dataclass
from flask import Flask, render_template, request, redirect, url_for, flash
from PyQt6.QtCore import QUrl
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt6.QtWebEngineWidgets import QWebEngineView

# Modelo estruturado com dataclass para armazenar os Favoritos
@dataclass
class PokemonFavorito:
    id: int
    nome: str
    tipo: str
    hp: int
    attack: int
    defense: int
    speed: int
    altura: float  # em metros
    peso: float    # em kg
    imc: float     # Peso / (Altura²)

# Banco de dados fictício na memória do App
lista_favoritos: list[PokemonFavorito] = []

flask_app = Flask(__name__)
flask_app.secret_key = "poke_secret_key" # Necessário para mensagens flash no Flask

def buscar_dados_pokeapi(nome_ou_id: str):
    """Busca dados brutos na PokeAPI e formata os atributos e cálculos solicitados."""
    try:
        url = f"https://pokeapi.co/api/v2/pokemon/{nome_ou_id.lower().strip()}"
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return None

        dados = response.json()

        # Mapeamento dos Atributos Principais obtidos na API
        stats_map = {s['stat']['name']: s['base_stat'] for s in dados['stats']}

        # Conversão das unidades de medida padrão da PokeAPI:
        # Altura vem em decímetros (dividir por 10 para metros)
        # Peso vem em hectogramas (dividir por 10 para quilogramas)
        altura_m = dados['height'] / 10.0
        peso_kg = dados['weight'] / 10.0

        # Cálculo matemático do IMC: Peso / Altura²
        imc = round(peso_kg / (altura_m ** 2), 2) if altura_m > 0 else 0.0

        return {
            "id": dados['id'],
            "nome": dados['name'].capitalize(),
            "tipo": ", ".join([t['type']['name'].capitalize() for t in dados['types']]),
            "hp": stats_map.get("hp", 0),
            "attack": stats_map.get("attack", 0),
            "defense": stats_map.get("defense", 0),
            "speed": stats_map.get("speed", 0),
            "altura": altura_m,
            "peso": peso_kg,
            "imc": imc,
            "sprite": dados['sprites']['front_default']
        }
    except Exception:
        return None

# ROTA PRINCIPAL: Exibe busca e favoritos
@flask_app.route('/', methods=['GET'])
def index():
    query = request.args.get('search', '').strip()
    pokemon_resultado = None

    if query:
        pokemon_resultado = buscar_dados_pokeapi(query)
        if not pokemon_resultado:
            flash(f"Pokémon '{query}' não encontrado na base de dados global.", "error")

    return render_template('index.html', pokemon=pokemon_resultado, favoritos=lista_favoritos)

# ROTA POST: Adicionar Pokémon aos objetos Dataclasses de Favoritos
@flask_app.route('/favoritar', methods=['POST'])
def favoritar():
    poke_id = int(request.form.get('id'))

    # Verifica se já está favoritado para evitar duplicatas
    if any(p.id == poke_id for p in lista_favoritos):
        return redirect(url_for('index'))

    # Busca rápida para recriar o objeto estruturado em dataclass
    dados = buscar_dados_pokeapi(str(poke_id))
    if dados:
        novo_favorito = PokemonFavorito(
            id=dados['id'],
            nome=dados['nome'],
            tipo=dados['tipo'],
            hp=dados['hp'],
            attack=dados['attack'],
            defense=dados['defense'],
            speed=dados['speed'],
            altura=dados['altura'],
            peso=dados['peso'],
            imc=dados['imc']
        )
        lista_favoritos.append(novo_favorito)

    return redirect(url_for('index'))

# ROTA POST: Remover Pokémon da lista de favoritos
@flask_app.route('/desfavoritar/<int:id>', methods=['POST'])
def desfavoritar(id):
    global lista_favoritos
    lista_favoritos = [p for p in lista_favoritos if p.id != id]
    return redirect(url_for('index'))

def run_flask():
    flask_app.run(port=5000, debug=False, use_reloader=False)

# CONTAINER PYQT6 COM WEBENGINE INTERNO
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PokéAPI Desktop Engine")
        self.resize(1100, 850)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        # Renderizador HTML interno embutido no app nativo
        self.browser = QWebEngineView()
        layout.addWidget(self.browser)
        self.browser.setUrl(QUrl("http://127.0.0"))

if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    time.sleep(0.5)

    qt_app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(qt_app.exec())
