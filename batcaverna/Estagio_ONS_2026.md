<a id="tarefas-ons-plc-2026-02"></a>

## Conceitos Importantes de SEP

1) Equipamentos de proteção:

- Capacitores, Reatores e Indutores
- Fluxo de potencia com cargas Ativas e Reativas
- Linhas de trasmissão, barramentos, transformadores
- Controle de geradores nas linhas
- Potencia Ativa / Reativa / Aparente
- Indutancia e Reatancia
- Geradores

2) Relatórios em .txt com fluxo de potencia e tensões nas barras

- Violações até com 1,035 pu
- Fluxo te pontencia com Geração e perdas nas linhas

3) 4 Equações de Maxwell
4) Sistemas de EDO de 1 e 2 ordem com funcao de transferencia em diagrama em blocos

## 🧠 ANÁLISE DE PLANEJAMENTO PARA ONS

- P define o fluxo energético contratado e físico
- Q afeta tensões e estabilidade – crucial para despacho seguro
- S limita capacidade térmica de equipamentos
- O fator de potência (cosφ) deve ser próximo de 1, sob pena de multas

## 🌐 Exemplos práticos:

1) Estimar onde instalar bancos de capacitores ou reatores
2) Analisar fluxo entre regiões com base em P/Q
3) Planejar reforços de linhas com base em sobrecarga de S
4) Usar perfis diários/históricos de P/Q para prever instabilidades

## 💰 VALOR DISSO PARA O MERCADO

- Simulação e relatório de potências com análise técnica: R$ 2.000–5.000
- Estudo de compensação reativa ou fator de potência: R$ 3.000–10.000
- Projeto completo com visualizações interativas e recomendações: R$ 8.000+

---

<a id="estudos-sep-ons-programacao"></a>

# Estudos de SEP para ONS e programação __TODO

## Sesão de ESTUDOS (Matemática, programação e Eng. Elétrica)

- [ ] Atividade ML de IEEEDs e principais modelo de AI de Supevisionado x Não Supervisionado (Com Rótulos x Sem Rótulos)
- [ ] Eletromagnetismo: Resolver 3 exercícios de Lei de Gauss/Coulomb.
- [ ] Sinais e Sistemas: Revisar Transformada de Laplace (básico).

- [ ] Análise de contigencias com SN 45 com pandapower + Deckbuiler para o AnaREDE
- [ ] Matriz Ybus em Python para SEP
- [ ] Matriz admtancia + Geração x Transmissão e Distrbuição SIN pelo ONS
- [ ] Mincurso CC + arduino + python
  - [ ] <https://www.falstad.com/circuit/circuitjs.html>
  - [ ] Regra de Crammer
  - [ ] EDO sistemas 1 e 2 ordem com RLC e RC plots e respostas da EDO
  
- [ ] Metodos númericos em Matlab para engenharia usando Python (pelo livro de moetodos numericos)

- [ ] Solver ML/DL para cada X,Y de conjunto de dado
- [ ] Python com Sympy para calculo de EDO de 1 e 2 ordem para Circuitos CC (RL,RC e RLC)
- [ ] Atividade IEEEDs = Esp32 + Senoides de corrente em series temporais para modelos de IA (como entrada de dados)
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python

---

<a id="sessao-estudos"></a>

# ⚡ Conceitos Elétricos (Dúvidas/Insights) __TODO

- [ ] CC vs CA: Em CC, a indutância é um curto e a capacitância é um aberto no regime permanente. Em CA, eles geram impedância ($j\omega L$ e $1/j\omega C$).

**Dúvida para tirar com engenheiros: Como o ONS modela a carga dependente da tensão ($P = P_0(V/V_0)^\alpha$)?**

---