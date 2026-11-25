#include <IRremote.hpp>

// ============================================================
//               DEFINIÇÃO DA STRUCT CARRO
// ============================================================
struct Carro {
  // Pinos do receptor IR e sensores
  uint8_t irReceivePin;
  uint8_t trigPin;
  uint8_t echoPin;
  uint8_t sensorLinhaPin;

  // Pinos da Ponte H (Motores)
  uint8_t in1MotorEsquerdo;
  uint8_t in2MotorEsquerdo;
  uint8_t in3MotorDireito;
  uint8_t in4MotorDireito;

  // Configurações de parâmetros de operação
  int distanciaLimite;
  int pwmMax;
  int pwmRe;
  int pwmGiro;
  int tempoRe;
  int tempoGiro;
  int limiarLinha;

  // Variáveis de estado do robô
  int valorAD;
  bool naBordaBranca;
  bool ativo;
};

// Instância global configurada com os pinos do robô
Carro robo = {
  .irReceivePin = 11,
  .trigPin = A4,
  .echoPin = A3,
  .sensorLinhaPin = A0,

  .in1MotorEsquerdo = 10,
  .in2MotorEsquerdo = 9,
  .in3MotorDireito = 6,
  .in4MotorDireito = 5,

  .distanciaLimite = 40,
  .pwmMax = 255,
  .pwmRe = 180,
  .pwmGiro = 180,
  .tempoRe = 400,
  .tempoGiro = 650,
  .limiarLinha = 700,

  .valorAD = 0,
  .naBordaBranca = false,
  .ativo = false
};

// Códigos do controle remoto Sony
#define READY_CODE 0x80
#define START_CODE 0x81
#define STOP_CODE  0x82

// ============================================================
//               FUNÇÕES DE CONTROLE DOS MOTORES
// ============================================================

void MOTORS_CONFIG(const Carro &c) {
  pinMode(c.in1MotorEsquerdo, OUTPUT);
  pinMode(c.in2MotorEsquerdo, OUTPUT);
  pinMode(c.in3MotorDireito, OUTPUT);
  pinMode(c.in4MotorDireito, OUTPUT);
}

void PARAR(const Carro &c) {
  analogWrite(c.in1MotorEsquerdo, 0);
  analogWrite(c.in2MotorEsquerdo, 0);
  analogWrite(c.in3MotorDireito, 0);
  analogWrite(c.in4MotorDireito, 0);
}

void FRENTE(const Carro &c, int pwm) {
  analogWrite(c.in1MotorEsquerdo, pwm);
  analogWrite(c.in2MotorEsquerdo, 0);
  analogWrite(c.in3MotorDireito, 0);
  analogWrite(c.in4MotorDireito, pwm);
}

void RE(const Carro &c, int pwm) {
  analogWrite(c.in1MotorEsquerdo, 0);
  analogWrite(c.in2MotorEsquerdo, pwm);
  analogWrite(c.in3MotorDireito, pwm);
  analogWrite(c.in4MotorDireito, 0);
}

void girar180(const Carro &c) {
  // Roda esquerda para frente, roda direita para trás
  analogWrite(c.in1MotorEsquerdo, c.pwmGiro);
  analogWrite(c.in2MotorEsquerdo, 0);
  analogWrite(c.in3MotorDireito, c.pwmGiro);
  analogWrite(c.in4MotorDireito, 0);

  delay(c.tempoGiro);
  PARAR(c);
}

// ============================================================
//               FUNÇÕES DOS SENSORES E EVENTOS
// ============================================================

void sensorUltrassonicoConfig(const Carro &c) {
  pinMode(c.trigPin, OUTPUT);
  pinMode(c.echoPin, INPUT);
  digitalWrite(c.trigPin, LOW);
}

void lerSensorLinha(Carro &c) {
  c.valorAD = analogRead(c.sensorLinhaPin);
  c.naBordaBranca = (c.valorAD <= c.limiarLinha);

  Serial.print("Linha: ");
  Serial.print(c.valorAD);
  Serial.print(" / ");
  Serial.println(c.naBordaBranca ? "BRANCO" : "PRETO");
}

float medirDistancia(const Carro &c) {
  digitalWrite(c.trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(c.trigPin, LOW);

  long duracao = pulseIn(c.echoPin, HIGH, 30000); // Timeout de 30ms para evitar travamentos
  if (duracao == 0) return 999.0; // Nenhum eco retornado (sem obstáculo)

  float distancia = (duracao * 0.0343) / 2.0;

  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.println(" cm");

  return distancia;
}

void verificarEventosIR(Carro &c) {
  if (IrReceiver.decode()) {
    uint32_t codigo = IrReceiver.decodedIRData.decodedRawData;

    if (codigo == STOP_CODE) {
      c.ativo = false;
      PARAR(c);
      Serial.println("BOTÃO 3: ROBÔ PARADO");
    } else if (codigo == READY_CODE) {
      PARAR(c);
      Serial.println("BOTÃO 1: PRONTO");
    } else if (codigo == START_CODE) {
      c.ativo = true;
      Serial.println("BOTÃO 2: ROBÔ INICIADO");
    }

    IrReceiver.resume();
  }
}

// ============================================================
//               SETUP E LOOP PRINCIPAL
// ============================================================

void configInicial(Carro &c) {
  Serial.begin(9600);
  IrReceiver.begin(c.irReceivePin);
  sensorUltrassonicoConfig(c);
  MOTORS_CONFIG(c);
  pinMode(c.sensorLinhaPin, INPUT);
}

void setup() {
  configInicial(robo);

  Serial.println("Aguardando START (Botão 2)...");
  while (!robo.ativo) {
    verificarEventosIR(robo);
  }
}

void loop() {
  // 1. Processa botões do controle remoto continuamente
  verificarEventosIR(robo);

  if (!robo.ativo) {
    PARAR(robo);
    return;
  }

  // 2. Lê o sensor de linha
  lerSensorLinha(robo);

  // 3. Tomada de Decisão (Prioridade: Linha Branca > Inimigo > Procura)
  if (robo.naBordaBranca) {
    RE(robo, robo.pwmRe);
    delay(robo.tempoRe);
    girar180(robo);
  } else {
    float distancia = medirDistancia(robo);

    if (distancia < robo.distanciaLimite) {
      // Inimigo detectado: Ataca com velocidade máxima
      FRENTE(robo, robo.pwmMax);
    } else {
      // Nenhum inimigo no alcance: Manobra de busca (gira)
      girar180(robo);
    }
  }
}