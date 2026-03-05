import requests  
from deep_translator import GoogleTranslator

def curl_test_horoscopo(sign):
    """Obtém o horóscopo do dia para um signo específico"""
    try:
        # Usando uma API de horóscopo gratuita
        url = f"https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(e)


request = curl_test_horoscopo("pisces")
data_atual =request["data"]["date"]
horoscopo = request["data"]["horoscope"]
traducao = GoogleTranslator(source='en', target='pt').translate(horoscopo)

print(data_atual + "\n\n"  + traducao)