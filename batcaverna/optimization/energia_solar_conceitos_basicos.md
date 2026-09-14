# Conceitos Básicos de Energia Solar

 **circuitos → potência → energia → baterias → inversor → fotovoltaica → otimização**.

Primeiro, uma correção fundamental:

> **kW ≠ kWh ≠ kW/h**

* **kW** → potência instantânea.
* **kWh** → energia consumida/armazenada.
* **kW/h** → taxa de variação da potência, normalmente não é o que você quer em uma conta residencial.

Se um equipamento tem **1,10 kW** e funciona durante 3 h:

$$
E=P\,t
$$

$$
E=1,10\times3=\boxed{3,30\ kWh}
$$

---

# 1. O que é kWp?

**kWp = quilowatt-pico.**

É a potência nominal máxima de um conjunto fotovoltaico em condições padronizadas de teste.

Por exemplo, se cada painel possui:

$$
P_{painel}=550W=0,55kWp
$$

então:

$$
P_{FV}=N\times0,55
$$

Com 8 painéis:

$$
P_{FV}=8(0,55)=\boxed{4,4\ kWp}
$$

Com 12:

$$
P_{FV}=12(0,55)=\boxed{6,6\ kWp}
$$

**kWp é potência instalada; não significa que o sistema produzirá 4,4 kWh todos os dias.**

---

# 2. A equação que você estava procurando: \(x\) painéis e \(y\) inversores

Vamos construir matematicamente.

Defina:

$$
x=N_{painéis}
$$

$$
y=N_{inversores}
$$

$$
P_m=\text{potência de cada módulo [kWp]}
$$

Então:

$$
\boxed{P_{FV}(x)=xP_m}
$$

Agora precisamos transformar potência solar em energia.

Uma aproximação inicial é:

$$
\boxed{
E_{ano}(x)=
xP_mHSP\cdot PR\cdot365
}
$$

onde:

* \(HSP\) = horas de sol pleno equivalentes/dia
* \(PR\) = *Performance Ratio*
* \(E\) = kWh/ano

Para obter **MWh/ano**:

$$
\boxed{
E_{MWh}(x)=
\frac{xP_mHSP\cdot PR\cdot365}{1000}
}
$$

### Exemplo

8 painéis de 550 W:

$$
x=8
$$

$$
P_m=0,55
$$

Suponha, apenas para exercício:

$$
HSP=5
$$

$$
PR=0,80
$$

Então:

$$
E=
\frac{8(0,55)(5)(0,80)(365)}{1000}
$$

$$
\boxed{E\approx6,42\ MWh/ano}
$$

Isso é **6.420 kWh/ano**, aproximadamente.

---

# 3. Mas onde entra \(y\), o número de inversores?

Aqui está uma coisa muito importante:

> **O número de inversores não determina diretamente a energia solar produzida.**

Quem determina principalmente a energia é a potência fotovoltaica disponível e as condições solares.

O inversor precisa ser dimensionado para processar essa potência.

Se cada inversor possui potência AC:

$$
P_{inv}
$$

então uma restrição simples seria:

$$
\boxed{
yP_{inv}\geq P_{AC,\ necessário}
}
$$

Além disso, existem limites de:

$$
V_{string}
$$

$$
I_{string}
$$

$$
P_{DC,max}
$$

do inversor.

Portanto, seu problema completo começa a ficar:

$$
\boxed{
\max_{x,y} E(x)
}
$$

sujeito a:

$$
xP_m\leq yP_{DC,max}
$$

$$
yP_{inv}\geq P_{carga}
$$

$$
V_{min}\leq V_{string}\leq V_{max}
$$

$$
I_{string}\leq I_{max}
$$

e:

$$
x,y\in\mathbb{Z}^+
$$

Isso já é um **problema de otimização inteira aplicado a sistemas fotovoltaicos**.

---

# 4. Agora entram as baterias

Suponha uma carga com potência:

$$
P_L=1,10kW
$$

Se ela funcionar por \(t\) horas:

$$
\boxed{E_L=P_Lt}
$$

Por exemplo, 6 horas:

$$
E_L=1,10(6)
$$

$$
\boxed{E_L=6,6kWh}
$$

Mas a bateria não entrega 100% da energia nominal.

Podemos modelar:

$$
\boxed{
E_{útil}=E_{bat}\cdot DoD\cdot\eta_{inv}
}
$$

onde:

* \(DoD\) = profundidade máxima de descarga considerada
* \(\eta_{inv}\) = eficiência do inversor

---

# 5. Uma bateria de 12 V

Suponha uma bateria hipotética:

$$
12V,\quad100Ah
$$

Energia nominal:

$$
E=VQ
$$

$$
E=12(100)
$$

$$
E=1200Wh
$$

$$
\boxed{E=1,2kWh}
$$

Mas isso não significa que você deve contar com 1,2 kWh efetivos.

Por exemplo, usando hipoteticamente:

$$
DoD=0,80
$$

$$
\eta=0,90
$$

teríamos:

$$
E_{útil}=1,2(0,80)(0,90)
$$

$$
\boxed{E_{útil}\approx0,864kWh}
$$

Para uma demanda de 6,6 kWh:

$$
N_{bat}=
\frac{6,6}{0,864}
$$

$$
N_{bat}\approx7,64
$$

Portanto, **matematicamente seriam 8 baterias nesse exemplo**.

Mas isso é apenas um exercício de dimensionamento. Para uma instalação real ainda precisamos considerar potência máxima, corrente, temperatura, envelhecimento, tipo de bateria e principalmente o pico de partida do compressor.

---

# 6. Série ou paralelo?

Essa parte é essencial para você entender circuitos CC.

### Série

$$
V_{total}=V_1+V_2+\cdots
$$

A capacidade em Ah permanece aproximadamente a mesma.

Exemplo:

$$
4\times12V=48V
$$

com quatro baterias de 12 V em série.

### Paralelo

$$
V_{total}=V
$$

mas:

$$
Ah_{total}=Ah_1+Ah_2+\cdots
$$

Duas baterias de 12 V / 100 Ah em paralelo:

$$
\boxed{12V/200Ah}
$$

Quatro em série:

$$
\boxed{48V/100Ah}
$$

A energia nominal nos dois arranjos é aproximadamente:

$$
48(100)=4800Wh
$$

ou

$$
12(400)=4800Wh
$$

Ou seja:

> **Série aumenta tensão; paralelo aumenta capacidade de corrente/energia disponível no banco.**

Na prática, sistemas com inversores maiores frequentemente trabalham com bancos de tensão mais alta para reduzir corrente, mas a tensão correta depende do equipamento e do projeto. Não monte banco de baterias residencial apenas seguindo esse exemplo: há riscos de curto-circuito, arco elétrico, incêndio e danos ao equipamento.

---

# 7. Geladeira + ar-condicionado é um detalhe importante

Aqui aparece uma coisa que uma questão simples de circuito não mostra.

Um compressor pode apresentar **corrente de partida significativamente maior que a corrente de operação**.

Então você precisa analisar duas condições:

### Regime permanente

$$
P_{contínua}\geq P_{geladeira}+P_{AC}+P_{outras}
$$

### Partida

$$
P_{inversor,pico}\geq P_{partida}
$$

Por isso, não basta dizer:

> "Tenho 1,10 kW de carga, então compro um inversor de 1,10 kW."

Pode não funcionar adequadamente.

---

# 8. Agora temos o sistema completo

Você pode estudar sua residência como:

```text
                 SOL
                  ↓
           x PAINÉIS FV
                  ↓
             CC / DC
                  ↓
           y INVERSORES
                  ↓
             CA / AC
                  ↓
       ┌──────────┴──────────┐
       ↓                     ↓
     CARGAS                BATERIA
       ↑                     ↓
       └──── INVERSOR ───────┘
```

E matematicamente:

$$
\boxed{
E_{FV}(x)=
\frac{xP_mHSP\,PR\,365}{1000}
}
$$

$$
\boxed{
E_{carga}=
\sum_i P_i t_i
}
$$

$$
\boxed{
E_{bat,útil}=
N_{bat}V_{bat}Ah_{bat}DoD\eta
}
$$

e o balanço energético:

$$
\boxed{
E_{FV}+E_{rede}+E_{bat}
\geq
E_{carga}
}
$$

---

# 9. E isso pode virar seu projeto em Python/Julia

Você pode definir:

$$
x=\text{número de painéis}
$$

$$
y=\text{número de inversores}
$$

$$
z=\text{número de baterias}
$$

e calcular:

$$
\boxed{
(x,y,z)\rightarrow
\{P_{FV},E_{FV},E_{bat},Custo,Autonomia\}
}
$$

Por exemplo:

| \(x\) | \(y\) | \(z\) | kWp | MWh/ano | Autonomia | Custo |
| ----: | ----: | ----: | --: | ------: | --------: | ----: |
|     7 |     1 |     0 | ... |     ... |       0 h |   ... |
|     8 |     1 |     8 | ... |     ... |       ... |   ... |
|    10 |     1 |     8 | ... |     ... |       ... |   ... |
|    12 |     1 |     8 | ... |     ... |       ... |   ... |
|    12 |     2 |     8 | ... |     ... |       ... |   ... |

E então você procura:

$$
\boxed{
\min C(x,y,z)
}
$$

mantendo:

$$
E_{FV}\geq E_{consumo}
$$

e uma determinada autonomia:

$$
E_{bat,útil}\geq E_{cargas\,críticas}
$$

Isso é muito mais interessante para seu estudo do que simplesmente aprender "quantas placas comprar": você está construindo um **modelo matemático de dimensionamento e otimização de uma microrrede residencial**.

Se você me fornecer **a potência dos painéis, modelo/potência do inversor, consumo mensal da residência e os modelos ou potências da geladeira e do ar-condicionado**, dá para montar o próximo nível: **um problema completo em Julia + Python com \(x\) painéis, \(y\) inversores e \(z\) baterias, calculando kWp, kWh, MWh/ano, autonomia e custo.**
