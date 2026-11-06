import json
import os
import re
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, url_for

BASE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = BASE_DIR / "imagens"
PHOTO_INDEX = BASE_DIR / ".fotos.json"
PAGE_NAME = "Contador_aniversario_VIVI_website.html"
PHOTO_NAME_PATTERN = re.compile(r"foto[1-9][0-9]*\Z")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_THEMES = {
    "starBirth",
    "firstMeet",
    "viagens",
    "hojeAmanhaSempre",
    "visionQuest",
}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024


def load_photo_index() -> dict[str, str]:
    try:
        data = json.loads(PHOTO_INDEX.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return {}
    if not isinstance(data, dict):
        raise ValueError("O arquivo .fotos.json precisa conter um objeto JSON.")

    photos = {}
    for theme, filename in data.items():
        if (
            theme not in ALLOWED_THEMES
            or not isinstance(filename, str)
            or not re.fullmatch(r"foto[1-9][0-9]*\.(jpg|jpeg|png|webp|gif)", filename)
        ):
            raise ValueError("O arquivo .fotos.json contém uma entrada inválida.")
        photos[theme] = filename
    return photos


def save_photo_index(photos: dict[str, str]) -> None:
    temp_path = PHOTO_INDEX.with_suffix(".json.tmp")
    temp_path.write_text(
        json.dumps(photos, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    os.replace(temp_path, PHOTO_INDEX)


def photo_details(filename: str) -> dict[str, str]:
    modified = (IMAGE_DIR / filename).stat().st_mtime_ns
    return {
        "name": Path(filename).stem,
        "url": url_for("serve_image", filename=filename, v=modified),
    }


def next_photo_name() -> str:
    used_numbers = set()
    if IMAGE_DIR.exists():
        for path in IMAGE_DIR.iterdir():
            match = re.fullmatch(
                r"foto([1-9][0-9]*)\.(jpg|jpeg|png|webp|gif)", path.name
            )
            if match:
                used_numbers.add(int(match.group(1)))
    number = 1
    while number in used_numbers:
        number += 1
    return f"foto{number}"


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, PAGE_NAME)


@app.get("/api/fotos")
def list_photos():
    photos = load_photo_index()
    return jsonify(
        photos={theme: photo_details(filename) for theme, filename in photos.items()},
        nextName=next_photo_name(),
    )


@app.get("/imagens/vision-quest.jpeg")
def serve_vision_quest():
    return send_from_directory(IMAGE_DIR, "vision-quest.jpeg", max_age=0)


@app.post("/api/fotos")
def upload_photo():
    theme = request.form.get("theme", "")
    name = request.form.get("name", "").strip().lower()
    uploaded_file = request.files.get("photo")

    if theme not in ALLOWED_THEMES:
        return jsonify(error="A lembrança selecionada não é válida."), 400
    if not PHOTO_NAME_PATTERN.fullmatch(name):
        return jsonify(error="Use um nome como foto1, foto2, foto3..."), 400
    if uploaded_file is None or not uploaded_file.filename:
        return jsonify(error="Selecione um arquivo de imagem."), 400

    extension = Path(uploaded_file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        return jsonify(error="Formato inválido. Use JPG, PNG, WEBP ou GIF."), 400

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    destination = IMAGE_DIR / f"{name}{extension}"
    if destination.exists() and request.form.get("overwrite") != "true":
        return jsonify(error=f"{destination.name} já existe. Deseja substituí-la?"), 409

    temp_path = IMAGE_DIR / f".{name}.{os.urandom(8).hex()}.tmp"
    try:
        uploaded_file.save(temp_path)
        os.replace(temp_path, destination)

        photos = load_photo_index()
        photos[theme] = destination.name
        save_photo_index(photos)
    finally:
        temp_path.unlink(missing_ok=True)

    return jsonify(photo=photo_details(destination.name), nextName=next_photo_name())


@app.get("/imagens/<path:filename>")
def serve_image(filename: str):
    if (
        Path(filename).name != filename
        or Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS
        or not PHOTO_NAME_PATTERN.fullmatch(Path(filename).stem)
    ):
        return jsonify(error="Nome de imagem inválido."), 404
    return send_from_directory(IMAGE_DIR, filename, max_age=0)


@app.errorhandler(413)
def file_too_large(_error):
    return jsonify(error="A imagem deve ter no máximo 8 MB."), 413


# server flask para armazenar as fotos
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
