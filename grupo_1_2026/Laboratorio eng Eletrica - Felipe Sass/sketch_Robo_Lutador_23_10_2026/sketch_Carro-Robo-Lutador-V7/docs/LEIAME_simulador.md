# PyEDA Studio

Instale as dependências no ambiente Python usado pelo VS Code:

```bash
python -m pip install -r requirements-simulacao.txt
```

### Notebook visual (recomendado)

Abra `notebooks/laboratorio_circuitos_e_contador_jk.ipynb` no VS Code ou Jupyter
e execute as células em ordem. O notebook mostra gráficos interativos de
tensão, corrente e energia para circuitos série RC, RL e RLC, com opção de
abrir a chave para observar a descarga. Também permite configurar contadores
JK binários crescentes/decrescentes com qualquer largura positiva e consultar
a tabela de excitação dos flip-flops para todos os estados.

O módulo `circuit_lab.py` contém os modelos numéricos reutilizáveis sem a
interface gráfica. São circuitos concentrados ideais; informe os parâmetros e
condições iniciais do problema que deseja analisar.

Para validar os modelos:

```bash
python -m pytest -q test_circuit_lab.py
```

### Aplicação desktop existente

Inicie a aplicação a partir desta pasta:

```bash
python main.py
```

`main.py` importa e inicia `app.py`. A janela tem um menu lateral responsivo
que recolhe em telas estreitas e dois espaços de trabalho:

- **Circuitos analógicos:** arraste componentes no canvas e clique em dois
  terminais para conectá-los. A chave manual preserva o estado entre as etapas:
  feche-a para carregar o capacitor/indutor e abra-a para acompanhar a descarga.
  O osciloscópio anima tensão e corrente. `R` gira itens e `F5` simula.
- **Contador síncrono FF JK:** mostra os flip-flops e oferece equações booleanas
  simplificadas com SymPy, a tabela-verdade JK e a tabela de transições de todos
  os estados para os contadores de 3 ou 4 bits. `Espaço` aplica uma borda de
  subida; o botão Reset é assíncrono.

O circuito SPICE é construído como um objeto `PySpice.Spice.Netlist.Circuit`;
o netlist gerado pode ser salvo ou aberto em outro simulador. A análise
transiente interativa usa o solver SciPy incluído. Para executar diretamente
com o backend do PySpice/ngspice, instale também o Ngspice no sistema. O botão
de chave representa a comutação da fonte entre a tensão nominal e 0 V.

Atalhos gerais: `Ctrl+N` novo, `Ctrl+O` importar JSON, `Ctrl+S` salvar,
`Ctrl+E` gerar SPICE e `F1` ajuda.

Testes:

```bash
python -m pytest -q test_circuit_lab.py test_simulando_circuitos_digitais_3bits.py
```
