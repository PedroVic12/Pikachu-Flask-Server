const { useEffect, useMemo, useState } = React;

const cameraOptions = {
  curiosity: [
    { value: "FHAZ", text: "Front Hazard Avoidance Camera" },
    { value: "RHAZ", text: "Rear Hazard Avoidance Camera" },
    { value: "MAST", text: "Mast Camera" },
    { value: "CHEMCAM", text: "Chemistry and Camera Complex" },
    { value: "MAHLI", text: "Mars Hand Lens Imager" },
    { value: "MARDI", text: "Mars Descent Imager" },
    { value: "NAVCAM", text: "Navigation Camera" },
  ],
  opportunity: [
    { value: "FHAZ", text: "Front Hazard Avoidance Camera" },
    { value: "RHAZ", text: "Rear Hazard Avoidance Camera" },
    { value: "NAVCAM", text: "Navigation Camera" },
    { value: "PANCAM", text: "Panoramic Camera" },
    { value: "MINITES", text: "Miniature Thermal Emission Spectrometer" },
  ],
  spirit: [
    { value: "FHAZ", text: "Front Hazard Avoidance Camera" },
    { value: "RHAZ", text: "Rear Hazard Avoidance Camera" },
    { value: "NAVCAM", text: "Navigation Camera" },
    { value: "PANCAM", text: "Panoramic Camera" },
    { value: "MINITES", text: "Miniature Thermal Emission Spectrometer" },
  ],
};

async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || "Erro na requisição";
    throw new Error(msg);
  }
  return data;
}

function App() {
  const [nasaHtml, setNasaHtml] = useState("");
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonHtml, setPokemonHtml] = useState("");

  const [sign, setSign] = useState("aries");
  const [horoscopeHtml, setHoroscopeHtml] = useState("");

  const [astronomyHtml, setAstronomyHtml] = useState("");

  const [rover, setRover] = useState("curiosity");
  const [sol, setSol] = useState("1000");
  const [camera, setCamera] = useState("");
  const [marsPhotosHtml, setMarsPhotosHtml] = useState("");

  const cameras = useMemo(() => cameraOptions[rover] || [], [rover]);

  async function getNasaAPOD() {
    setNasaHtml('<div class="loading">Carregando...</div>');
    try {
      const data = await fetchJson("/api/nasa/apod");
      setNasaHtml(`
        <h3>${data.title}</h3>
        <p><strong>Data:</strong> ${data.date}</p>
        <p>${data.explanation}</p>
        ${
          data.media_type === "image"
            ? `<img src="${data.url}" alt="${data.title}" class="nasa-image">`
            : `<a href="${data.url}" target="_blank" rel="noreferrer">Ver vídeo</a>`
        }
        ${data.copyright ? `<p><small>© ${data.copyright}</small></p>` : ""}
      `);
    } catch (e) {
      setNasaHtml(`<div class="error">Erro: ${e.message}</div>`);
    }
  }

  async function getPokemon() {
    if (!pokemonName.trim()) {
      alert("Por favor, digite o nome de um Pokémon");
      return;
    }
    setPokemonHtml('<div class="loading">Carregando...</div>');
    try {
      const data = await fetchJson(`/api/pokemon/${encodeURIComponent(pokemonName.trim())}`);
      setPokemonHtml(`
        <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)} (#${data.id})</h3>
        <img src="${data.sprite}" alt="${data.name}" class="pokemon-sprite">
        <p><strong>Altura:</strong> ${data.height / 10} m</p>
        <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
        <p><strong>Tipos:</strong> ${data.types.join(", ")}</p>
        <p><strong>Habilidades:</strong> ${data.abilities.join(", ")}</p>
      `);
    } catch (e) {
      setPokemonHtml(`<div class="error">Erro: ${e.message}</div>`);
    }
  }

  async function getRandomPokemon() {
    setPokemonHtml('<div class="loading">Carregando...</div>');
    try {
      const data = await fetchJson("/api/pokemon/random");
      setPokemonHtml(`
        <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)} (#${data.id})</h3>
        <img src="${data.sprite}" alt="${data.name}" class="pokemon-sprite">
        <p><strong>Altura:</strong> ${data.height / 10} m</p>
        <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
        <p><strong>Tipos:</strong> ${data.types.join(", ")}</p>
        <p><strong>Habilidades:</strong> ${data.abilities.join(", ")}</p>
      `);
    } catch (e) {
      setPokemonHtml(`<div class="error">Erro: ${e.message}</div>`);
    }
  }

  async function getHoroscope() {
    setHoroscopeHtml('<div class="loading">Carregando...</div>');
    try {
      const data = await fetchJson(`/api/horoscope/${sign}`);
      // Observação: seu backend atualmente retorna "traducao" (string) e não JSON padronizado.
      // Se ele devolver string, isso aqui pode quebrar. Se quiser, eu te ajudo a padronizar.
      setHoroscopeHtml(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
    } catch (e) {
      setHoroscopeHtml(`<div class="error">Erro: ${e.message}</div>`);
    }
  }

  async function getMoonPhase() {
    setAstronomyHtml('<div class="loading">Carregando...</div>');
    try {
      const data = await fetchJson("/api/astronomy/moon-phase");
      setAstronomyHtml(`
        <h3>🌙 Fase da Lua</h3>
        <p><strong>Fase:</strong> ${data.phase}</p>
        <p><strong>Data:</strong> ${data.date}</p>
        <p><strong>Horário:</strong> ${data.time}</p>
      `);
    } catch (e) {
      setAstronomyHtml(`<div class="error">Erro: ${e.message}</div>`);
    }
  }

  async function getMarsRoverPhotos() {
    setMarsPhotosHtml('<div class="loading">Carregando...</div>');
    let url = `/api/astronomy/mars-rover/photos?rover=${encodeURIComponent(rover)}&sol=${encodeURIComponent(sol)}`;
    if (camera) url += `&camera=${encodeURIComponent(camera)}`;

    try {
      const data = await fetchJson(url);
      if (data.photos?.length) {
        setMarsPhotosHtml(
          data.photos
            .map(
              (p) => `
              <div>
                <img src="${p.img_src}" style="width: 100%; border-radius: 10px;" alt="Foto de Marte pelo rover ${p.rover?.name || ""}">
                <p style="font-size: 12px; margin-top: 5px;">${p.camera?.full_name || ""} (Sol ${p.sol})</p>
              </div>
            `
            )
            .join("")
        );
      } else {
        setMarsPhotosHtml("<p>Nenhuma foto encontrada para esta combinação de rover, sol e câmera.</p>");
      }
    } catch (e) {
      setMarsPhotosHtml(`<div class="error">Erro: ${e.message}</div>`);
    }
  }

  return (
    <div className="container">
      <h1>Pikachu Rest API - Frontend 🌟</h1>
      <h1>🌟 Sistema Astronômico 🌟</h1>
      <p>(astro-system rodando no Javascript estático com backend em Python!)</p>

      <div className="grid">
        <div className="section">
          <h2>🚀 NASA - Foto do Dia</h2>
          <button onClick={getNasaAPOD}>Obter Foto Astronômica do Dia</button>
          <div className="result" dangerouslySetInnerHTML={{ __html: nasaHtml }} />
        </div>

        <div className="section">
          <h2>🎮 Pokémon</h2>
          <input
            type="text"
            placeholder="Nome do Pokémon"
            value={pokemonName}
            onChange={(e) => setPokemonName(e.target.value)}
          />
          <button onClick={getPokemon}>Buscar Pokémon</button>
          <button onClick={getRandomPokemon}>Pokémon Aleatório</button>
          <div className="result" dangerouslySetInnerHTML={{ __html: pokemonHtml }} />
        </div>

        <div className="section">
          <h2>🔮 Horóscopo</h2>
          <select value={sign} onChange={(e) => setSign(e.target.value)}>
            <option value="aries">Áries</option>
            <option value="taurus">Touro</option>
            <option value="gemini">Gêmeos</option>
            <option value="cancer">Câncer</option>
            <option value="leo">Leão</option>
            <option value="virgo">Virgem</option>
            <option value="libra">Libra</option>
            <option value="scorpio">Escorpião</option>
            <option value="sagittarius">Sagitário</option>
            <option value="capricorn">Capricórnio</option>
            <option value="aquarius">Aquário</option>
            <option value="pisces">Peixes</option>
          </select>
          <button onClick={getHoroscope}>Ver Horóscopo Diário</button>
          <div className="result" dangerouslySetInnerHTML={{ __html: horoscopeHtml }} />
        </div>

        <div className="section astronomy-section">
          <h2>🌙 Astronomia</h2>
          <div className="button-group">
            <button onClick={getMoonPhase}>Fase da Lua</button>
          </div>
          <div className="result" dangerouslySetInnerHTML={{ __html: astronomyHtml }} />

          <h3>Fotos de Marte</h3>
          <div className="button-group">
            <select value={rover} onChange={(e) => { setRover(e.target.value); setCamera(""); }}>
              <option value="curiosity">Curiosity</option>
              <option value="opportunity">Opportunity</option>
              <option value="spirit">Spirit</option>
            </select>
            <input type="number" placeholder="Sol" value={sol} onChange={(e) => setSol(e.target.value)} />
            <select value={camera} onChange={(e) => setCamera(e.target.value)}>
              <option value="">All Cameras</option>
              {cameras.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.text} ({c.value})
                </option>
              ))}
            </select>
            <button onClick={getMarsRoverPhotos}>Buscar Fotos</button>
          </div>

          <div
            className="result"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}
            dangerouslySetInnerHTML={{ __html: marsPhotosHtml }}
          />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);