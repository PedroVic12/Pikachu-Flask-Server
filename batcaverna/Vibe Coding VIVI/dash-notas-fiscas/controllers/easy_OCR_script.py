import cv2
import numpy as np
import pypdfium2 as pdfium
import easyocr
import sys
import os
import ssl

# pip install pypdfium2 easyocr opencv-python numpy
# ========================================================
# BYPASS DE REDE CORPORATIVA (Ignora erro de SSL)
# ========================================================
ssl._create_default_https_context = ssl._create_unverified_context


def testar_extracao(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"Erro: O arquivo '{pdf_path}' não foi encontrado.")
        return

    print("[1/3] Inicializando motor de IA do EasyOCR...")
    reader = easyocr.Reader(
        ["pt"], gpu=False
    )  # gpu=False força o uso da CPU para compatibilidade geral

    # 2. Renderiza o PDF com pypdfium2
    print(f"[2/3] Renderizando o PDF '{os.path.basename(pdf_path)}' via pypdfium2...")
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]

    # scale=3 aumenta a resolução da imagem gerada (melhora a precisão do OCR)
    pil_image = page.render(scale=3).to_pil()

    # Converte a imagem PIL (RGB) para o formato nativo do OpenCV (Numpy array BGR)
    img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    # 3. Abre a interface do OpenCV
    print("[3/3] Abrindo interface gráfica do OpenCV...")
    print("\n" + "=" * 50)
    print("INSTRUÇÕES OPENCV:")
    print(" 1. Clique e arraste para desenhar um retângulo azul no texto.")
    print(" 2. Aperte ENTER (ou ESPAÇO) para confirmar o retângulo.")
    print(" 3. Desenhe outros retângulos se quiser.")
    print(" 4. Aperte ESC para fechar a janela e extrair os textos.")
    print("=" * 50 + "\n")

    rois = cv2.selectROIs(
        "Inspecao Manual - Pressione ESC para extrair",
        img,
        fromCenter=False,
        showCrosshair=True,
    )
    cv2.destroyAllWindows()

    if len(rois) == 0:
        print("Nenhuma área foi selecionada. Encerrando.")
        return

    # 4. Extrai o texto de cada retângulo
    print("Iniciando extração do texto...\n")
    for i, rect in enumerate(rois):
        x, y, w, h = rect
        if w > 0 and h > 0:
            recorte = img[y : y + h, x : x + w]

            # O EasyOCR aceita o array numpy diretamente
            # detail=0 retorna apenas o texto, paragraph=True tenta juntar quebras de linha
            resultados = reader.readtext(recorte, detail=0, paragraph=True)
            texto_extraido = "\n".join(map(str, resultados))

            print(f"🎯 --- RETÂNGULO {i+1} ---")
            print(f"📍 Coordenadas : X:{x}, Y:{y}, W:{w}, H:{h}")
            print(
                f"📄 Texto Lido  : {texto_extraido if texto_extraido else '[Nenhum texto detectado]'}"
            )
            print("-" * 40)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        testar_extracao(sys.argv[1])
    else:
        print("Uso correto: python teste_ocr_nativo.py <nome_do_arquivo.pdf>")
