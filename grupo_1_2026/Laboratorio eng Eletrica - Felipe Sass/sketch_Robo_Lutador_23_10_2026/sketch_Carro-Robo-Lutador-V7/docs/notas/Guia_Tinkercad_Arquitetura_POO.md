# 🛠️ Guia de Simulação no Tinkercad: Arquitetura POO & Diagrama de Blocos

### Explicação Elétrica

1. **Pack 2S Li-Ion (7.4V):** Fonte principal do sistema.
2. **Ponte H L298N:** Recebe 7.4V direto na entrada `VCC` de potência para alimentar os 2 motores DC com máximo torque.
3. **Módulo Buck 5V:** Regulador de alta eficiência que reduz os 7.4V para 5.0V regulados, alimentando a entrada `5V` do **Arduino Nano** e os 3 sensores sem flutuações geradas pelos motores.
4. **Arduino Nano:** Gerencia as entradas analógicas/digitais dos 3 sensores e comanda a Ponte H L298N via PWM.

---

## 💡 2. Resposta à Pergunta do Fluxograma

> *"Como fazer para não retornar ao início do Loop ao PARAR?"*

### Solução Técnica Implementada na POO

Foi implementado o estado `ESTADO_PARADO_DEFINITIVO` (FIM) na classe `RoboLutador`:

1. Quando o **Botão 3** (0x82 / Stop) é lido pelo receptor IR, a variável `estadoAtual` transita para `ESTADO_PARADO_DEFINITIVO`.
2. Dentro do `switch (estadoAtual)`, o robô chama `parar()`, desligando as saídas dos motores.
3. O robô **permanece retido nesse estado** a cada iteração da função `loop()`, bloqueando a execução da rotina de combate. Ele só retornará ao combate se o **Botão 2** (Start - 0x81) for explicitamente pressionado novamente.

---

## 📁 Arquivos do Código POO Criados

* **[headers.h](file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/Meu-Segundo-Cerebro-2026/MENTE/Build%20Knowlodge/Engenharia/UFF%20-%20Eng.%20El%C3%A9trica/ESTUDOS%20UFF%202026/Estudos%20UFF%202026.2/Laboratorio%20eng%20Eletrica%20-%20Felipe%20Sass/grupo_1_2026/src/headers.h):** Header contendo toda a pinagem, limites do QRE1113, constantes de PWM e botões do Controle Remoto Sony.
* **[headers.cpp](file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/Meu-Segundo-Cerebro-2026/MENTE/Build%20Knowlodge/Engenharia/UFF%20-%20Eng.%20El%C3%A9trica/ESTUDOS%20UFF%202026/Estudos%20UFF%202026.2/Laboratorio%20eng%20Eletrica%20-%20Felipe%20Sass/grupo_1_2026/src/headers.cpp):** Instanciação das estruturas globais de pinagem dos motores.
* **[Logger.h](file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/Meu-Segundo-Cerebro-2026/MENTE/Build%20Knowlodge/Engenharia/UFF%20-%20Eng.%20El%C3%A9trica/ESTUDOS%20UFF%202026/Estudos%20UFF%202026.2/Laboratorio%20eng%20Eletrica%20-%20Felipe%20Sass/grupo_1_2026/src/Logger.h):** Classe POO de depuração serial com níveis de log (`INFO`, `DEBUG`, `WARN`, `ERROR`) e carimbo de tempo (timestamps).
* **[sketch_Carro_Robo.ino](file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/Meu-Segundo-Cerebro-2026/MENTE/Build%20Knowlodge/Engenharia/UFF%20-%20Eng.%20El%C3%A9trica/ESTUDOS%20UFF%202026/Estudos%20UFF%202026.2/Laboratorio%20eng%20Eletrica%20-%20Felipe%20Sass/grupo_1_2026/src/sketch_Carro_Robo.ino):** Sketch principal unificando as 4 leis da POO, sensores, comutação de estados e chamada do Logger.

---

## 🧪 Como Testar Tudo no Tinkercad

1. Crie um novo circuito no Tinkercad com um **Arduino Nano**, **L298N**, **HC-SR04**, **QRE1113** (ou sensor IR de linha) e **Receptor IR (KY-022)**.
2. Abra o editor de código em modo **Texto**.
3. No Tinkercad, você pode juntar o conteúdo de `headers.h`, `Logger.h` e `sketch_Carro_Robo.ino` em um único arquivo `.ino` ou usar a aba de inclusão de arquivos adicionais.
4. Abra o **Monitor Serial (9600 baud)** e clique nas teclas do controle remoto virtual do Tinkercad:
   * Pressione **Tecla 2 (0x81)**: Veja a mensagem `[INFO] [BOTÃO 2 PRESSIONADO] -> INICIANDO LOOP DE COMBATE`.
   * Ajuste a distância do HC-SR04:
     * Se $<20\text{cm}$: Veja no log `🎯 Oponente < 20cm! ATAQUE COM POTÊNCIA MÁXIMA!`.
     * Se $>20\text{cm}$: Veja no log `🔍 Oponente não detectado (>20cm). RÉ COM POTÊNCIA MÁXIMA!`.
   * Pressione **Tecla 3 (0x82)**: Veja `[⚠️ WARN] [BOTÃO 3 PRESSIONADO] -> PARAR DEFINITIVO (ENTRANDO EM ESTADO FIM)` e observe o robô travar desligado no estado FIM!
