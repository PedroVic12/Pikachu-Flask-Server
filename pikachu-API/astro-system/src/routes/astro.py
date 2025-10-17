from flask import Blueprint, jsonify, request
import requests
from datetime import datetime
import os

from deep_translator import GoogleTranslator
from langdetect import detect

astro_bp = Blueprint('astro', __name__)

# NASA API Key - você pode obter uma em https://api.nasa.gov/
#NASA_API_KEY = os.environ.get('NASA_API_KEY', 'DEMO_KEY')
# https://api.nasa.gov/#gibs
NASA_API_KEY = "SqO4btBXshwmDO8tZTbfOxIKLpeShuX3d4SdCJbH"

#! Metodos de tradução
def traduzirTexto(self, texto_em_ingles):
    texto_traduzido = GoogleTranslator(source='en', target='pt').translate(texto_em_ingles) # use translate_text here
    return texto_traduzido

def is_english(self, text):
    try:
        # Se detectar que o idioma é inglês, retorna True
        return detect(text) == 'en'
    except:
        return False

def maybe_translate(self, text):
    # Verifica se o texto é em inglês
    if self.is_english(text):
        
        # Traduz o texto
        print('\n\n\nTraduzindo texto...')
        return self.traduzirTexto(text)
        
    # Retorna o texto original se não for inglês
    return text

@astro_bp.route('/nasa/apod', methods=['GET'])
def get_nasa_apod():
    """Obtém a Foto Astronômica do Dia da NASA"""
    try:
        url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/pokemon/<pokemon_name>', methods=['GET'])
def get_pokemon(pokemon_name):
    """Obtém informações de um Pokémon específico"""
    try:
        url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_name.lower()}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Simplificando os dados retornados
        simplified_data = {
            "id": data["id"],
            "name": data["name"],
            "height": data["height"],
            "weight": data["weight"],
            "types": [type_info["type"]["name"] for type_info in data["types"]],
            "abilities": [ability["ability"]["name"] for ability in data["abilities"]],
            "sprite": data["sprites"]["front_default"]
        }
        return jsonify(simplified_data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/pokemon/random', methods=['GET'])
def get_random_pokemon():
    """Obtém um Pokémon aleatório"""
    try:
        import random
        pokemon_id = random.randint(1, 1010)  # Existem cerca de 1010 Pokémon
        url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        simplified_data = {
            "id": data["id"],
            "name": data["name"],
            "height": data["height"],
            "weight": data["weight"],
            "types": [type_info["type"]["name"] for type_info in data["types"]],
            "abilities": [ability["ability"]["name"] for ability in data["abilities"]],
            "sprite": data["sprites"]["front_default"]
        }
        return jsonify(simplified_data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/horoscope/<sign>', methods=['GET'])
def get_horoscope(sign):
    """Obtém o horóscopo do dia para um signo específico"""
    try:
        # Usando uma API de horóscopo gratuita
        url = f"https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign={sign}&day=today"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/moon-phase', methods=['GET'])
def get_moon_phase():
    """Obtém informações sobre a fase da lua atual"""
    try:
        # Usando uma API gratuita para fases da lua
        url = "https://api.farmsense.net/v1/moonphases/"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Pega a fase mais recente
        if data:
            latest_phase = data[0]
            return jsonify({
                "phase": latest_phase["Phase"],
                "date": latest_phase["Date"],
                "time": latest_phase["Time"]
            })
        else:
            return jsonify({"error": "Nenhuma informação de fase lunar encontrada"}), 404
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/iss-location', methods=['GET'])
def get_iss_location():
    """Obtém a localização atual da Estação Espacial Internacional"""
    try:
        url = "http://api.open-notify.org/iss-now.json"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/people-in-space', methods=['GET'])
def get_people_in_space():
    """Obtém informações sobre pessoas atualmente no espaço"""
    try:
        url = "http://api.open-notify.org/astros.json"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@astro_bp.route('/astronomy/exoplanets/kepler', methods=['GET'])
def get_kepler_exoplanets():
    """Obtém planetas confirmados no campo Kepler."""
    try:
        url = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?&table=exoplanets&format=json&where=pl_kepflag=1"
        response = requests.get(url)
        response.raise_for_status()
        try:
            return jsonify(response.json())
        except requests.exceptions.JSONDecodeError:
            return jsonify({"error": "Failed to decode JSON from response", "content": response.text}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/exoplanets/transiting', methods=['GET'])
def get_transiting_exoplanets():
    """Obtém planetas confirmados que transitam em suas estrelas hospedeiras."""
    try:
        url = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?&table=exoplanets&format=json&where=pl_tranflag=1"
        response = requests.get(url)
        response.raise_for_status()
        try:
            return jsonify(response.json())
        except requests.exceptions.JSONDecodeError:
            return jsonify({"error": "Failed to decode JSON from response", "content": response.text}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/exoplanets/candidates', methods=['GET'])
def get_candidate_exoplanets():
    """Obtém todos os candidatos planetários menores que 2Re com temperaturas de equilíbrio entre 180-303K."""
    try:
        url = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=cumulative&format=json&where=koi_prad<2 and koi_teq>180 and koi_teq<303 and koi_disposition like 'CANDIDATE'"
        response = requests.get(url)
        response.raise_for_status()
        try:
            return jsonify(response.json())
        except requests.exceptions.JSONDecodeError:
            return jsonify({"error": "Failed to decode JSON from response", "content": response.text}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/mars-rover/photos', methods=['GET'])
def get_mars_rover_photos():
    """Obtém fotos de rovers em Marte."""
    try:
        rover = request.args.get('rover', 'curiosity')
        sol = request.args.get('sol', '1000')
        camera = request.args.get('camera', '')
        page = request.args.get('page', '1')

        url = f"https://api.nasa.gov/mars-photos/api/v1/rovers/{rover}/photos?sol={sol}&page={page}&api_key={NASA_API_KEY}"
        if camera:
            url += f"&camera={camera}"

        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@astro_bp.route('/astronomy/mars-weather', methods=['GET'])
def get_mars_weather():
    """Obtém o clima em Marte (InSight)."""
    try:
        url = f"https://api.nasa.gov/insight_weather/?api_key={NASA_API_KEY}&feedtype=json&ver=1.0"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
