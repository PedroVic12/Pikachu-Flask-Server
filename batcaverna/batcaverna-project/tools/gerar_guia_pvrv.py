# -*- coding: utf-8 -*-
"""
Gerador do arquivo Markdown: Guia-Mensal-PVRV.md

Gera seções com âncoras HTML e links de referência (estilo variáveis de link).
Inclui Índice, navegação Anterior/Próximo e, opcionalmente, incorpora este
próprio script no final do documento.
"""
from __future__ import annotations
from pathlib import Path
import re
import unicodedata
from typing import List, Dict, Optional

OUTPUT_MD = "Guia-Mensal-PVRV.md"
EMBED_SCRIPT = False  # Se True, anexa o próprio script ao final do .md

# Mapeamento opcional de destinos por seção (para navegação entre documentos)
# chave = id/slug da seção, valor = nome do arquivo de destino (md) onde a seção reside
DOC_TARGETS: Dict[str, str] = {}


def slugify(texto: str) -> str:
    """Converte um título em slug ASCII seguro para ser usado como id/âncora."""
    # Normaliza e remove acentos
    nfkd = unicodedata.normalize('NFKD', texto)
    ascii_txt = ''.join(ch for ch in nfkd if not unicodedata.combining(ch))
    # Minúsculas
    ascii_txt = ascii_txt.lower()
    # Substitui tudo que não for alfanumérico por hífen
    ascii_txt = re.sub(r"[^a-z0-9]+", "-", ascii_txt)
    # Colapsa hífens múltiplos
    ascii_txt = re.sub(r"-+", "-", ascii_txt)
    # Remove hífens das pontas
    ascii_txt = ascii_txt.strip('-')
    return ascii_txt or "secao"


class Secao:
    def __init__(self, titulo: str, conteudo_md: str, id_personalizado: Optional[str] = None):
        self.titulo = titulo
        self.conteudo_md = conteudo_md.strip('\n')
        self.sid = id_personalizado or slugify(titulo)


# =========================
# Definição das seções
# =========================
SECOES: List[Secao] = [
    Secao(
        titulo="Checklist de Metas: Trilha Fullstack & Desktop (Python, JS, Rust)",
        conteudo_md=r"""
Este checklist visa integrar as tecnologias mencionadas (Flask, Pandas, PySide6, NextJS, Tauri, Rust) em projetos práticos de complexidade crescente.

## Fase 1: Backend & Processamento de Dados (Python)

Foco: Flask, Pandas, Modelagem de Dados, API REST.

- [ ] **Projeto 1: API de Análise de Dados (Simples)**
  - *Stack:* Flask, Pandas.
  - *Objetivo:* Criar uma rota POST que recebe um arquivo CSV/JSON, processa estatísticas básicas (média, mediana, desvio padrão) com Pandas e retorna um JSON com os resultados.
- [ ] **Projeto 2: Sistema de Gestão de Inventário (CRUD REST)**
  - *Stack:* Flask, SQLAlchemy (ou outro ORM), SQLite/Postgres.
  - *Objetivo:* Criar uma API REST completa com autenticação básica. Rotas para criar, ler, atualizar e deletar produtos.
  - *Meta:* Implementar validação de dados (Pydantic ou Marshmallow).

## Fase 2: Desktop Nativo & GUI (Python)

Foco: PySide6 (Qt for Python).

- [ ] **Projeto 3: Dashboard de Monitoramento de Sistema**
  - *Stack:* PySide6, psutil.
  - *Objetivo:* Criar uma janela desktop que mostra uso de CPU, RAM e Disco em tempo real usando gráficos (PyQtGraph ou Matplotlib integrado).
- [ ] **Projeto 4: Cliente Desktop para Inventário**
  - *Stack:* PySide6, requests.
  - *Objetivo:* Criar uma interface gráfica que consome a API do *Projeto 2*. O usuário deve poder adicionar e ver produtos através do app desktop.

## Fase 3: Frontend Web Moderno (JavaScript/TypeScript)

Foco: NextJS, React, TailwindCSS.

- [ ] **Projeto 5: Landing Page de Portfólio**
  - *Stack:* NextJS, TailwindCSS.
  - *Objetivo:* Site estático simples para listar seus projetos do GitHub (pode consumir a API do GitHub).
- [ ] **Projeto 6: Dashboard Web Analytics**
  - *Stack:* NextJS, Chart.js (ou Recharts).
  - *Objetivo:* Consumir a API do *Projeto 1* ou *Projeto 2* e exibir os dados em gráficos interativos no navegador.

## Fase 4: O Próximo Nível - Performance & Apps Híbridos (Rust & Tauri)

Foco: Rust básico, Tauri (Unindo o Frontend Web com Backend Nativo).

- [ ] **Projeto 7: "Hello World" em Rust CLI**
  - *Stack:* Rust (Cargo).
  - *Objetivo:* Criar uma ferramenta CLI simples em Rust que lê um arquivo de texto e conta as palavras (reimplementação simples do `wc`).
- [ ] **Projeto 8: App de Notas Seguro (Tauri)**
  - *Stack:* Tauri, Rust (Backend), React/NextJS (Frontend).
  - *Objetivo:* Um aplicativo desktop onde o frontend (JS) envia notas para o backend (Rust) salvar arquivos criptografados no disco.
  - *Meta:* Aprender a comunicação IPC (Frontend <-> Backend) no Tauri.

## Fase 5: O Projeto Integrador (Master)

- [ ] **Projeto Final: A Suíte de Produtividade**
  - *Backend Central:* API Flask com Pandas para relatórios pesados.
  - *App Desktop Leve:* Tauri App (Rust+React) para uso diário e widgets.
  - *App Admin:* PySide6 para configurações avançadas do sistema local.
""",
    ),
    Secao(
        titulo="Modelagem de DB com Python e Sqlite3 com pyspark",
        conteudo_md=r"""
Verificar pasta: /home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/batcaverna-project/scripts

- [ ] Historico de projetos Github
- [ ] Planilhas Tarefas ONS
- [ ] Planilha Corrige SECO - Mensal
- [ ] Deck Builder - PandaPower/AnaREDE com CLI e arquivos .PWF e uso de banco de dados
- [ ] Case Manager Organon
- [ ] 3 bus, 12 bus e IEEE 30 como caso de estudos com decks
""",
    ),
    Secao(
        titulo="Manutenção de Banco de dados do SIGER x BDT (cadastro de equipamentos elétricos e parametros para PMO)",
        id_personalizado="manutencao-siger-bdt",
        conteudo_md=r"""
- [ ] Todo dia 10, o programa roda no SIGER que aponta os equipamentos que estão fora da "ponte" (da Planilha Acompanhamento_PONTE_PL.xlsx: Nas Abas: LTs_SIGER_ForaPonte e TRs_SIGER_ForaPonte)
- [x] GERCAD -> JOB -> ID: Data atual -> Job Criado
- [x] Lts: Coluna T: Deve estar na ponte? Usar apenas as linhas que __NÃO__ estão na cor vermelho.
- [x] Separar o Norte, Nordeste, Centroeste e Sudeste para as tarefas. Não cadastrar os que são Data Centers
- [x] Busca por LTS dentro do sistema: GERCARD -> Topologia -> "Estado" -> "Nome Curto da Instação" -> Aplicar critério -> Retorna tudo relacionado a Subestação pesquisada.
- [x] Verificar se ja existe a estação no BDT, botão direito -> Novo Equipamento -> LTR 
- [x] __Campos obrigatórios de cadastro:__ Numero do circuito do planejamento, Nome Estação, Num Barra preferencial, Tipo Rede: (BASICA), Utilização: PAR, 

- [x] Ao final do dia, sempre finalizar o Job feito.
""",
    ),
]


def make_ref_name(slug: str) -> str:
    return f"sec_{slug}"


def build_markdown(secoes: List[Secao]) -> str:
    linhas = []

    # Marcador de topo + título geral
    linhas.append('<a id="topo"></a>')
    linhas.append('# Guia Mensal PVRV — Checklists Fixos')
    linhas.append('')

    # Índice
    linhas.append('## Índice')
    for s in secoes:
        ref = make_ref_name(s.sid)
        linhas.append(f"- [{s.titulo}][{ref}]")
    linhas.append("")

    # Seções
    total = len(secoes)
    for i, s in enumerate(secoes):
        anterior = secoes[i-1] if i > 0 else None
        proximo = secoes[i+1] if i < total-1 else None

        # âncora estável
        linhas.append(f'<a id="{s.sid}"></a>')
        linhas.append('---')
        linhas.append(f'# {s.titulo}')
        linhas.append('---')
        linhas.append('')
        linhas.append(s.conteudo_md)
        linhas.append('')

        # Navegação local (Anterior | Topo | Próximo)
        nav_parts = []
        if anterior:
            nav_parts.append(f"[⟵ Anterior][{make_ref_name(anterior.sid)}]")
        nav_parts.append("[↑ Topo][topo]")
        if proximo:
            nav_parts.append(f"[Próximo ⟶][{make_ref_name(proximo.sid)}]")
        if nav_parts:
            linhas.append('')
            linhas.append(' — '.join(nav_parts))
            linhas.append('')

    # Definições de links por referência
    linhas.append('')
    linhas.append('---')
    linhas.append('')
    # topo
    linhas.append('[topo]: #topo')

    # refs por seção, respeitando DOC_TARGETS para navegação entre documentos
    for s in secoes:
        destino_doc = DOC_TARGETS.get(s.sid, OUTPUT_MD)
        alvo = f"#{s.sid}" if destino_doc == OUTPUT_MD else f"{destino_doc}#{s.sid}"
        linhas.append(f"[{make_ref_name(s.sid)}]: {alvo}")

    return "\n".join(linhas).rstrip() + "\n"


def main():
    md = build_markdown(SECOES)
    Path(OUTPUT_MD).write_text(md, encoding='utf-8')

    if EMBED_SCRIPT:
        # Ao final, anexar o próprio script como apêndice
        try:
            source = Path(__file__).read_text(encoding='utf-8')
            with Path(OUTPUT_MD).open('a', encoding='utf-8') as f:
                f.write('\n')
                f.write('---\n')
                f.write('<a id="script-gerador"></a>\n')
                f.write('# Apêndice: Script gerador (autocontido)\n\n')
                f.write('> Este é o script Python que gera este Markdown.\n\n')
                f.write('```python\n')
                f.write(source)
                f.write('\n```\n')

        except Exception as e:
            # Em caso de falha, ignora a incorporação
            print("Ocorreu um erro!", e)

    print(f"Script {OUTPUT_MD} gerado com sucesso!")




if __name__ == '__main__':
    main()
