import requests
from bs4 import BeautifulSoup
import json
#mport PyPDF2
import os




def juntar_pdfs():
    merger = PyPDF2.PdfFileMerger()

    arquivos = os.listdir('arquivos_pdf')

    for arquivo in arquivos:
        if arquivo.endswith('.pdf'):
            caminho =f"arquivos_pdf/{arquivo}"
            merger.append(caminho)


    merger.write("arquivo_unico.pdf")


def scrape_url(url):
    pagina = requests.get(url)

    dados = BeautifulSoup(pagina.text, 'html.parser')


    def filtro(class_css):
        return class_css is not None and len(class_css) > 4


    frases = dados.find_all('div', class_=filtro)

    for div in frases:
        texto = div.find('span', class_='text').get_text()
        print(div.text)




scrape_url("https://quotes.toscrape.com")