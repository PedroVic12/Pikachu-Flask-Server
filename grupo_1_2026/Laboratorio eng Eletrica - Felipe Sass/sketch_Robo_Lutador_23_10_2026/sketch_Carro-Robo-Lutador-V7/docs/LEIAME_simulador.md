# PyEDA Suite

Instale as dependências no ambiente Python usado pelo VS Code:

```bash
python -m pip install -r requirements-simulacao.txt
```

Inicie a aplicação a partir desta pasta:

```bash
python main.py
```

`main.py` importa e inicia `app.py`. A janela tem duas páginas independentes:

- **Circuitos analógicos:** cria malhas série RC, RL e RLC, edita componentes,
  gira itens com `R`, simula com `F5` e exporta netlists SPICE/SVG. Projetos
  podem ser importados/salvos em JSON.
- **Contador síncrono FF JK:** mostra os flip-flops JK, entradas J/K, Q/Q̅,
  clock e a contagem crescente/decrescente de 3 ou 4 bits. `Espaço` aplica
  uma borda de subida; o botão Reset é assíncrono.

Atalhos gerais: `Ctrl+N` novo, `Ctrl+O` importar JSON, `Ctrl+S` salvar,
`Ctrl+E` gerar SPICE e `F1` ajuda.

Testes:

```bash
python -m pytest -q test_simulando_circuitos_digitais_3bits.py
```
