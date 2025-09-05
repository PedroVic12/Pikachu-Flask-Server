from flask import Blueprint, jsonify
import requests
from datetime import datetime
import os

astro_bp = Blueprint('astro', __name__)

# NASA API Key - você pode obter uma em https://api.nasa.gov/
NASA_API_KEY = os.environ.get('NASA_API_KEY', 'DEMO_KEY')

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
    """Obtém informações sobre a fase da lua atual usando Astronomy API"""
    try:
        # Coordenadas do Rio de Janeiro
        latitude = -22.9068
        longitude = -43.1729
        
        # Data atual
        from datetime import datetime
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Dados para a requisição
        payload = {
            "format": "png",
            "style": {
                "moonStyle": "default",
                "backgroundStyle": "stars",
                "backgroundColor": "#000000",
                "headingColor": "#ffffff",
                "textColor": "#ffffff"
            },
            "observer": {
                "latitude": latitude,
                "longitude": longitude,
                "date": current_date
            },
            "view": {
                "type": "portrait-simple",
                "orientation": "south-up"
            }
        }
        
        # Headers com autenticação básica (usando credenciais demo)
        headers = {
            "Authorization": "Basic YWRtaW46YWRtaW4=",  # admin:admin em base64 para demo
            "Content-Type": "application/json"
        }
        
        url = "https://api.astronomyapi.com/api/v2/studio/moon-phase"
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "location": "Rio de Janeiro",
                "date": current_date,
                "imageUrl": data["data"]["imageUrl"],
                "latitude": latitude,
                "longitude": longitude
            })
        else:
            # Fallback para API alternativa se a principal falhar
            fallback_url = "https://api.farmsense.net/v1/moonphases/"
            fallback_response = requests.get(fallback_url)
            fallback_response.raise_for_status()
            fallback_data = fallback_response.json()
            
            if fallback_data:
                latest_phase = fallback_data[0]
                return jsonify({
                    "location": "Rio de Janeiro",
                    "phase": latest_phase["Phase"],
                    "date": latest_phase["Date"],
                    "time": latest_phase["Time"],
                    "source": "fallback"
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

