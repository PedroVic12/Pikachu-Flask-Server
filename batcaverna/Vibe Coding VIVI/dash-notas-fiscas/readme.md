
# NF Control - Extrator de Notas Fiscais

Um sistema web interno para gestão, processamento em lote e extração inteligente de dados de Notas Fiscais de Serviço (NFS-e) em formato PDF.

## 🛠️ Tecnologias Utilizadas

* **Backend:** Python, Flask, SQLite, Pandas.
* **Processamento de PDF/Imagens:** PyPDF2, pdf2image, OpenCV (cv2), PyTesseract.
* **Frontend:** React (via CDN), Tailwind CSS.
* **Ferramenta de Correção Manual:** PySide6.

## ⚙️ Pré-requisitos e Instalação do Sistema Operacional

Antes de instalar as bibliotecas do Python, seu sistema operacional precisa de dois programas externos para ler imagens e fazer o OCR:

### 1. Poppler (Para o `pdf2image` funcionar)

* **Linux (Arch/Garuda):** `sudo pacman -S poppler`
* **Windows:** Baixe os binários do Poppler (Release for Windows), extraia e adicione a pasta `bin` nas Variáveis de Ambiente do sistema.

### 2. Tesseract OCR

* **Linux (Arch/Garuda):** `sudo pacman -S tesseract tesseract-data-por`
* **Linux (Debian/Ubuntu):** `sudo apt-get install tesseract-ocr
* **Windows:** Baixe o instalador do Tesseract e instale (ex: na pasta `Downloads`).

> **⚠️ Importante para Windows:** Você precisará descomentar e ajustar o caminho do Tesseract no topo dos arquivos `backend.py` e `pyside_tool.py`:
>
> ```python
> # Exemplo de configuração no Windows
> pytesseract.pytesseract.tesseract_cmd = r"C:\Users\viviane.alves\Downloads\tesseract.exe"
> 
> ```
>
>

---

## 🚀 Como Instalar e Rodar

1. **Clone ou baixe este repositório** para a sua máquina local.
2. **Abra o terminal** na pasta raiz do projeto.
3. **Instale as dependências** do Python rodando o comando:

```bash
pip install Flask PyPDF2 pdf2image opencv-python pytesseract pandas openpyxl PySide6

```

1. **Inicie o Servidor Backend:**

```bash
python backend.py

```

1. **Acesse o Sistema:**
Abra o seu navegador e acesse: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 📂 Estrutura de Arquivos

* `backend.py`: Servidor Flask, roteamento da API e lógica principal de Regex/OCR.
* `pyside_tool.py`: Script isolado em PySide6 para abrir PDFs problemáticos e selecionar áreas com OpenCV manualmente.
* `templates/index.html`: Interface visual (Dashboard) construída em React + Tailwind.
* `notas.db`: Banco de dados SQLite criado automaticamente na primeira execução.
* `uploads/`: Diretório temporário e de armazenamento das Notas Fiscais processadas.

---
