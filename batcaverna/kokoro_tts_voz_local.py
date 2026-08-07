from kokoro import KPipeline
import soundfile as sf
import numpy as np
import souddevice as sd

VOICE = "pf_heart"
LANGUAGE = "p"
sample_rate = 24 * 1000  # 24kHz


pipeline = KPipeline(
    #oice=VOICE,
      language=LANGUAGE,
     #  sample_rate=sample_rate
     )

def falar_tts_local(texto, voice, playback = False):
    results =  []
    generator = pipeline(texto,voice = voice)

    # gerando audios
    for i, (gs, ps, audio) in enumerate(generator):
        print(f"Gerando audio {i+1} de {len(generator)}")
        print(f"[{i}] graphemes: {gs},  phonemes: {ps},")
        results.append(audio)

    # playback 
    if playback:
        stream = np.concatenate(
            [v for _, _, v in results]
        )
        sd.play(stream, samplerate=sample_rate)
        sd.wait()

    return results


def main():
    texto = "Olá, tudo bem? Eu sou a voz do Kokoro TTS!"

    results = falar_tts_local(texto, VOICE, playback=True)

    # salvando os audios gerados
    for i, (gs, ps, audio) in enumerate(results):
        filename = f"output_{i+1}.wav"
        sf.write(filename, audio, sample_rate)
        print(f"Áudio {i+1} salvo como {filename}")