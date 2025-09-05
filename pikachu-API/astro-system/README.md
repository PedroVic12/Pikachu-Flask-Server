# Sistema Astronômico

Um sistema Flask que integra APIs da NASA, Pokémon e astrologia/astronomia, desenvolvido com arquitetura limpa usando apenas Python e requests.

## Funcionalidades

### 🚀 NASA
- **Foto Astronômica do Dia (APOD)**: Obtém a imagem astronômica do dia da NASA com descrição e metadados

### 🎮 Pokémon
- **Busca de Pokémon**: Busca informações de um Pokémon específico pelo nome
- **Pokémon Aleatório**: Obtém um Pokémon aleatório com suas informações

### 🔮 Astrologia
- **Horóscopo Diário**: Previsões astrológicas diárias para todos os signos do zodíaco

### 🌙 Astronomia
- **Fase da Lua**: Informações sobre a fase atual da lua
- **Localização da ISS**: Posição atual da Estação Espacial Internacional
- **Pessoas no Espaço**: Lista de astronautas atualmente no espaço

## APIs Utilizadas

1. **NASA APOD API** - `https://api.nasa.gov/planetary/apod`
2. **PokeAPI** - `https://pokeapi.co/api/v2/pokemon/`
3. **Horoscope API** - `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/`
4. **Moon Phase API** - `https://api.farmsense.net/v1/moonphases/`
5. **ISS Location API** - `http://api.open-notify.org/iss-now.json`
6. **People in Space API** - `http://api.open-notify.org/astros.json`

## Estrutura do Projeto

```
astro-system/
├── src/
│   ├── routes/
│   │   ├── astro.py      # Rotas das APIs astronômicas
│   │   └── user.py       # Rotas de usuários (template)
│   ├── models/
│   │   └── user.py       # Modelo de usuário (template)
│   ├── static/
│   │   └── index.html    # Interface web
│   ├── database/
│   │   └── app.db        # Banco SQLite
│   └── main.py           # Arquivo principal
├── venv/                 # Ambiente virtual
├── requirements.txt      # Dependências
└── README.md            # Documentação
```

## Instalação e Execução

1. **Ativar o ambiente virtual:**
   ```bash
   cd astro-system
   source venv/bin/activate
   ```

2. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Executar o servidor:**
   ```bash
   python src/main.py
   ```

4. **Acessar a aplicação:**
   - Abra o navegador e acesse: `http://localhost:5000`

## Endpoints da API

### NASA
- `GET /api/nasa/apod` - Foto astronômica do dia

### Pokémon
- `GET /api/pokemon/<nome>` - Buscar Pokémon por nome
- `GET /api/pokemon/random` - Pokémon aleatório

### Astrologia
- `GET /api/horoscope/<signo>` - Horóscopo do signo

### Astronomia
- `GET /api/astronomy/moon-phase` - Fase da lua
- `GET /api/astronomy/iss-location` - Localização da ISS
- `GET /api/astronomy/people-in-space` - Pessoas no espaço

## Configuração da API da NASA

Para usar a API da NASA com maior limite de requisições, obtenha uma chave gratuita em [https://api.nasa.gov/](https://api.nasa.gov/) e configure a variável de ambiente:

```bash
export NASA_API_KEY=sua_chave_aqui
```

## Tecnologias Utilizadas

- **Python 3.11**
- **Flask** - Framework web
- **requests** - Cliente HTTP
- **SQLAlchemy** - ORM (para funcionalidades futuras)
- **HTML/CSS/JavaScript** - Interface web responsiva

## Arquitetura

O projeto segue os princípios de arquitetura limpa:

- **Separação de responsabilidades**: Rotas, modelos e lógica de negócio separados
- **Injeção de dependências**: Uso de blueprints do Flask
- **Tratamento de erros**: Respostas consistentes para erros de API
- **Interface responsiva**: Design adaptável para desktop e mobile

## Contribuição

Este projeto foi desenvolvido como um sistema de demonstração integrando múltiplas APIs públicas com foco em astronomia, Pokémon e astrologia.

