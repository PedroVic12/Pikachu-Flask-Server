import google.generativeai as genai
import PIL
import os

GEMINI_KEY = "AIzaSyDV_TzW4k3dqapFmDLha2jh9BARbeUIWos"
genai.configure(api_key=GEMINI_KEY)


class C3PoAssisstente:
    def __init__(self):
        pass

    def modeloTextoGenerativo(self, txt):
        model_TextGenerator = genai.GenerativeModel("gemini-pro")
        response = model_TextGenerator.generate_content(txt)
        return response.text

    def c3poCorrigeTexto(self, texto_ocr, texto_vision):
        texto_completo = texto_ocr + texto_vision

        _prompt = """ 
        Corriga o texto para extrair informacões necessarias, gere um markdown simples caso tenha informações sobre contrato de empresa:
            """

        texto_corrigido = self.modeloTextoGenerativo(
            texto_completo + "\n\n\n\n" + _prompt
        )

        print("\n\nC3PO: Responde\n")
        return texto_corrigido

    def modeloVisaoComputacional(self, img_path, prompt_cliente):
        model_VisaoComputacional = genai.GenerativeModel("gemini-pro-vision")

        imagem = PIL.Image.open(img_path)

        response = model_VisaoComputacional.generate_content(imagem)
        print("IMG= ", response.text)
        response_text = model_VisaoComputacional.generate_content(
            [prompt_cliente, imagem]
        )
        result = response_text.resolve()
        return response.text


def main():
    assiste = C3PoAssisstente()
    assiste.modeloTextoGenerativo("Qual sua função em 2024?")

main()