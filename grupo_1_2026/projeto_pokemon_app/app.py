import sys
import threading
import time
from dataclasses import dataclass, asdict
from flask import Flask, render_template, request, redirect, url_for
from PyQt6.QtCore import QUrl
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt6.QtWebEngineWidgets import QWebEngineView

# 1. Definição do Modelo com dataclass
@dataclass
class Pokemon:
    id: int
    nome: str
    tipo: str

# Banco de dados temporário em memória
banco_pokemon: list[Pokemon] = [
    Pokemon(id=1, nome="Pikachu", tipo="Elétrico"),
    Pokemon(id=2, nome="Charmander", tipo="Fogo")
]
id_counter = 3

# 2. Configuração do Flask (Rotas CRUD)
flask_app = Flask(__name__)

@flask_app.route('/', methods=['GET'])
def listar_pokemons():
    # R do CRUD: Read (Listar)
    return render_template('index.html', pokemons=banco_pokemon)

@flask_app.route('/adicionar', methods=['POST'])
def adicionar_pokemon():
    # C do CRUD: Create (Criar)
    global id_counter
    nome = request.form.get('nome')
    tipo = request.form.get('tipo')
    
    if nome and tipo:
        novo_pokemon = Pokemon(id=id_counter, nome=nome, tipo=tipo)
        banco_pokemon.append(novo_pokemon)
        id_counter += 1
        
    return redirect(url_for('listar_pokemons'))

@flask_app.route('/deletar/<int:id>', methods=['POST'])
def deletar_pokemon(id):
    # D do CRUD: Delete (Deletar)
    global banco_pokemon
    banco_pokemon = [p for p in banco_pokemon if p.id != id]
    return redirect(url_for('listar_pokemons'))

def run_flask():
    flask_app.run(port=5000, debug=False, use_reloader=False)

# 3. Interface Gráfica PyQt6
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PokeCRUD - Flask + PyQt6")
        self.resize(900, 700)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        self.browser = QWebEngineView()
        layout.addWidget(self.browser)
        
        # Aponta para o servidor local do Flask
        self.browser.setUrl(QUrl("http://127.0.0"))

if __name__ == "__main__":
    # Inicializa o Flask em segundo plano
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    time.sleep(0.5)

    # Inicializa o PyQt6
    qt_app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(qt_app.exec())


