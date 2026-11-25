

#include <Arduino.h>
#include <IRremote.hpp>
#include <VL53L0X.h>
#include <Wire.h>

// --- CLASSE LOGGER DE ALTA PERFORMANCE ---
class Logger {
public:
  enum Level { DEBUG, INFO, ALERTA, ERRO };

  static void begin(unsigned long baud) { Serial.begin(baud); }

  // Template inline para economizar ciclos de clock e aceitar múltiplos tipos
  template <typename T>
  static void log(Level lvl, const char *tag, T mensagem) {
    switch (lvl) {
    case DEBUG:
      Serial.print(F("[DBG] "));
      break;
    case INFO:
      Serial.print(F("[INF] "));
      break;
    case ALERTA:
      Serial.print(F("[ALT] "));
      break;
    case ERRO:
      Serial.print(F("[ERR] "));
      break;
    }
    Serial.print(tag);
    Serial.print(F(": "));
    Serial.println(mensagem);
  }
};

// --- ESTRUTURAS DE DADOS (USANDO uint8_t PARA POUPAR RAM E PROCESSAMENTO) ---
struct PinosMotor {
  uint8_t in1;
  uint8_t in2;
  uint8_t in3;
  uint8_t in4;
};

struct ConfigPWM {
  uint8_t maxAtaque;
  uint8_t re;
  uint8_t giro;
  uint8_t busca;
};

struct SensoresConfig {
  uint8_t irPin;
  uint8_t linhaPin;
  uint8_t trigPin;
  uint8_t echoPin;
};

// --- ESTRUTURA PRINCIPAL DO ROBÔ ---
struct RoboSumo {
  PinosMotor motores;
  ConfigPWM pwm;
  ConfigPWM config; // alias ou dados complementares
  SensoresConfig pinosSensores;

  // Inicializa pinos via ponteiro/referência para evitar cópias
  void initPinos() {
    pinMode(motores.in1, OUTPUT);
    pinMode(motores.in2, OUTPUT);
    pinMode(motores.in3, OUTPUT);
    pinMode(motores.in4, OUTPUT);

    pinMode(pinosSensores.trigPin, OUTPUT);
    pinMode(pinosSensores.echoPin, INPUT);
    pinMode(pinosSensores.linhaPin, INPUT);

    Logger::log(Logger::INFO, "ROBO", "Pinos configurados com sucesso.");
  }

  // Funções de movimento inline para máxima velocidade de execução
  inline void parar() {
    analogWrite(motores.in1, 0);
    analogWrite(motores.in2, 0);
    analogWrite(motores.in3, 0);
    analogWrite(motores.in4, 0);
  }

  inline void frente(uint8_t velocidade) {
    analogWrite(motores.in1, velocidade);
    analogWrite(motores.in2, 0);
    analogWrite(motores.in3, 0);
    analogWrite(motores.in4, velocidade);
  }

  inline void tras(uint8_t velocidade) {
    analogWrite(motores.in1, 0);
    analogWrite(motores.in2, velocidade);
    analogWrite(motores.in3, velocidade);
    analogWrite(motores.in4, 0);
  }

  inline void girar(uint8_t velocidade) {
    analogWrite(motores.in1, velocidade);
    analogWrite(motores.in2, 0);
    analogWrite(motores.in3, velocidade);
    analogWrite(motores.in4, 0);
  }
};

// Instanciação global do Robô com configuração de hardware
RoboSumo meuRobo = {
    {10, 9, 6, 5},        // Pinos Motor (IN1, IN2, IN3, IN4)
    {255, 255, 190, 150}, // PWM (MaxAtaque, Re, Giro, Busca)
    {0, 0, 0, 0},         // Config complementar
    {11, A0, A2, A3}      // Pinos Sensores (IR, Linha, Trig, Echo)
};

// Variáveis globais de controle
VL53L0X Sensor1;
VL53L0X Sensor2;
const uint16_t LIMIAR_BORDA = 700;
const uint8_t START_CODE = 0x81;
const uint8_t STOP_CODE = 0x82;

// ---------------- FUNÇÕES AUXILIARES ----------------
bool verificarBorda() {
  return analogRead(meuRobo.pinosSensores.linhaPin) < LIMIAR_BORDA;
}

long medirDistancia() {
  digitalWrite(meuRobo.pinosSensores.trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(meuRobo.pinosSensores.trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(meuRobo.pinosSensores.trigPin, LOW);

  long duracao = pulseIn(meuRobo.pinosSensores.echoPin, HIGH, 25000);
  if (duracao == 0)
    return 999;
  return duracao * 0.0343 / 2;
}

// Função que recebe o endereço (ponteiro) da estrutura para manipular o robô
// diretamente
void executarEsquivaBorda(RoboSumo *robo) {
  Logger::log(Logger::ALERTA, "TACTIC",
              "Borda detectada! Executando ré e giro.");
  robo->tras(robo->pwm.re);
  delay(400);
  robo->girar(robo->pwm.giro);
  delay(500);
}

void setup() {
  Logger::begin(9600);
  Logger::log(Logger::INFO, "SYS", "Iniciando Robo UFF Grupo 1...");

  IrReceiver.begin(meuRobo.pinosSensores.irPin);
  meuRobo.initPinos();

  // Configuração dos Lasers I2C (exemplo resumido)
  Wire.begin();
  // (Configuração dos pinos XSHUT omitida por brevidade, mantendo a lógica
  // anterior)

  Logger::log(Logger::INFO, "SYS", "Aguardando Botao 2 (START)...");
  while (true) {
    if (IrReceiver.decode()) {
      if (IrReceiver.decodedIRData.decodedRawData == START_CODE) {
        IrReceiver.resume();
        break;
      }
      IrReceiver.resume();
    }
  }
  Logger::log(Logger::INFO, "SYS", "COMBATE INICIADO!");
}

void loop() {
  // 1. Prioridade absoluta: Borda
  if (verificarBorda()) {
    executarEsquivaBorda(&meuRobo); // Passando por ponteiro
    return;
  }

  // 2. Leitura de sensores
  long distancia = medirDistancia();

  // 3. Estratégia de Combate
  if (distancia < 40) {
    meuRobo.frente(meuRobo.pwm.maxAtaque);
  } else {
    meuRobo.girar(meuRobo.pwm.busca);
  }

  // 4. Parada de emergência
  if (IrReceiver.decode()) {
    if (IrReceiver.decodedIRData.decodedRawData == STOP_CODE) {
      meuRobo.parar();
      Logger::log(Logger::ERRO, "SYS", "PARADA DEFINITIVA ACIONADA.");
      while (1)
        ;
    }
    IrReceiver.resume();
  }
}