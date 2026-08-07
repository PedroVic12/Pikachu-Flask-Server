import sys
from pathlib import Path
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import sounddevice as sd
import os

# uv pip install kokoro>=0.9.4 soundfile sounddevice numpy  

#! rode no terminal

# uv run kokoro_tts_voz_local.py texto_entrada.txt

VOICES = [
    "af_heart", # default
    "pf_dora", # voz em pt br
    "pm_alex", # voz em pt br
    "pm_santa" # voz em pt br
]

VOICE = VOICES[2]  
LANGUAGE = "p"
sample_rate = 24 * 1000  # 24kHz


pipeline = KPipeline(
    lang_code=LANGUAGE,
)


def carregar_texto(texto_entrada):
    if isinstance(texto_entrada, (str, os.PathLike)):
        caminho = Path(texto_entrada)
        if caminho.exists() and caminho.is_file():
            return caminho.read_text(encoding="utf-8")
    return str(texto_entrada)


def falar_tts_local(texto, voice, playback=False, output_path="fala_completa.wav"):
    texto_final = carregar_texto(texto)
    print(f"Texto de entrada carregado: {texto_final[:120]}...")
    generator = pipeline(texto_final, voice=voice)
    results = list(generator)

    # gerando audios
    for i, (gs, ps, audio) in enumerate(results):
        os.system("clear")
        print(f"Gerando audio {i + 1} de {len(results)}")
        print(f"[{i}] graphemes: {gs}")
        print(f"\n[{i}] phonemes: {ps}")

    if results:
        stream = np.concatenate([audio for _, _, audio in results])

        if playback:
            sd.play(stream, samplerate=sample_rate)
            sd.wait()

        output_file = Path(output_path)
        sf.write(str(output_file), stream, sample_rate)
        print(f"Áudio completo salvo como {output_file}")
    else:
        print("Nenhum áudio foi gerado.")

    return [audio for _, _, audio in results]


def main():
    print("\n\nIniciando o Kokoro TTS local...\n\n")

    if len(sys.argv) < 2:
        print("Informe o caminho do arquivo .txt para gerar a fala.")
        return

    caminho = Path(sys.argv[1])
    if not caminho.exists() or not caminho.is_file():
        print(f"Arquivo não encontrado: {caminho}")
        return

    print(f"Lendo texto do arquivo: {caminho}")
    falar_tts_local(caminho, VOICE, playback=True, output_path="fala_completa.wav")


if __name__ == "__main__":
    main()