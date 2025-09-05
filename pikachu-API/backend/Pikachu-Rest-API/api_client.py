import requests
import json
from datetime import datetime

# --- NASA APOD API ---
def get_nasa_apod():
    url = "http://localhost:5000/api/nasa/apod"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# --- PokeAPI ---
def get_pokemon_by_name(name):
    url = f"http://localhost:5000/api/pokemon/{name}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def get_random_pokemon():
    url = "http://localhost:5000/api/pokemon/random"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# --- Horoscope API ---
def get_horoscope(sign):
    url = f"http://localhost:5000/api/horoscope/{sign}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# --- Astronomy APIs ---
def get_moon_phase():
    url = "http://localhost:5000/api/astronomy/moon-phase"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def get_iss_location():
    url = "http://localhost:5000/api/astronomy/iss-location"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def get_people_in_space():
    url = "http://localhost:5000/api/astronomy/people-in-space"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


if __name__ == "__main__":
    print("\n--- Testando NASA APOD ---")
    apod_data = get_nasa_apod()
    print(json.dumps(apod_data, indent=2, ensure_ascii=False))

    print("\n--- Testando Pokémon por nome (pikachu) ---")
    pikachu_data = get_pokemon_by_name("pikachu")
    print(json.dumps(pikachu_data, indent=2, ensure_ascii=False))

    print("\n--- Testando Pokémon Aleatório ---")
    random_pokemon_data = get_random_pokemon()
    print(json.dumps(random_pokemon_data, indent=2, ensure_ascii=False))

    print("\n--- Testando Horóscopo (aries) ---")
    horoscope_data = get_horoscope("aries")
    print(json.dumps(horoscope_data, indent=2, ensure_ascii=False))

    print("\n--- Testando Fase da Lua ---")
    moon_phase_data = get_moon_phase()
    print(json.dumps(moon_phase_data, indent=2, ensure_ascii=False))

    print("\n--- Testando Localização da ISS ---")
    iss_location_data = get_iss_location()
    print(json.dumps(iss_location_data, indent=2, ensure_ascii=False))

    print("\n--- Testando Pessoas no Espaço ---")
    people_in_space_data = get_people_in_space()
    print(json.dumps(people_in_space_data, indent=2, ensure_ascii=False))


