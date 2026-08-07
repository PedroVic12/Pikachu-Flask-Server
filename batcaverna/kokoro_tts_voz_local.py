from kokoro import KPipeline
import soundfile as sf
import numpy as np
import sounddevice as sd
import os

# uv pip install kokoro>=0.9.4 soundfile sounddevice numpy  

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

def falar_tts_local(texto, voice, playback=False):
    generator = pipeline(texto, voice=voice)
    results = list(generator)

    # gerando audios
    for i, (gs, ps, audio) in enumerate(results):
        os.system("clear")
        print(f"Gerando audio {i + 1} de {len(results)}")
        print(f"[{i}] graphemes: {gs}")
        print(f"\n[{i}] phonemes: {ps}")

    # playback
    if playback and results:
        stream = np.concatenate([audio for _, _, audio in results])
        sd.play(stream, samplerate=sample_rate)
        sd.wait()

    return [audio for _, _, audio in results]


def main():
    print("\n\nIniciando o Kokoro TTS local...\n\n")
    texto = "Olá, tudo bem? Eu sou a voz do Kokoro TTS!"

    texto_VIVIANE = """
    Olá Viviane Gomes, tudo bem? Aqui é a nova voz do Kokoro TTS e estou muito feliz em poder falar com você! O metre Pedro victor sempre fala muito bem de você. Enfim, estou aqui para te atualizar sobre os progessos dos serviços de programação e automação que ele vem desenvolvendo. Agora eu tenho acesso local ao computador dele em Campo Grande, onde posso ativar serviços e disparar diferentes comandos no computador dele, na hora que eu quiser! haha . Ele me pediu para te dar um recado: Ele esta com com Save no jogo do Jurassic park para iniciar um novo jogo do Parque com uma nova familia de dinossauros junto com você, além disso. Ele está no seu aguardo para jogar missão "Vinho do Divino" no jogo The witcher 3, junto com você no Discord. Eu sei que vocês se gostam muito, espero falar com você novamente em breve. Até logo! 
    """

    results = falar_tts_local(texto_VIVIANE, VOICE, playback=True)

    # salvando os audios gerados
    for i, audio in enumerate(results):
        filename = f"output_{i + 1}.wav"
        sf.write(filename, audio, sample_rate)
        print(f"Áudio {i + 1} salvo como {filename}")


if __name__ == "__main__":
    main()