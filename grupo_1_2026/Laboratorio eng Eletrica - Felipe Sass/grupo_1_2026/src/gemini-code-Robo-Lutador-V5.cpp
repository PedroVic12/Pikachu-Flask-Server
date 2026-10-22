/*
 * ===================================================================================
 * CÓDIGO DO ROBÔ LUTADOR (SUMÔ) - CORRIGIDO E OTIMIZADO
 * UFF - LABORATÓRIO DE ENG. ELÉTRICA (PROF. FELIPE SASS - GRUPO 1 2026)
 * ===================================================================================
 */

#include <Arduino.h>
#include <IRremote.hpp>  // Biblioteca IRremote para ler o controle remoto
#include <Wire.h>
#include <VL53L0X.h>     // Sensores laser ToF

// --- PINAGEM ---
#define IR_RECEIVE_PIN 11     // Receptor infravermelho
#define SENSOR_LINHA   A0     // QRE1113 - Refletância (Borda branca)
#define TRIG           A2     // HC-SR04 Trigger
#define ECHO           A3     // HC-SR04 Echo

// Sensores laser VL53L0X (I2C: SDA = A4, SCL = A5)
#define XSHUT_SENSOR1  7
#define XSHUT_SENSOR2  8
#define SENSOR1_ENDERECO 42
#define SENSOR2_ENDERECO 43

// --- TECLAS DO CONTROLE REMOTO (SONY) ---
#define READY_CODE 0x80       // Tecla 1: Preparar / Parar
#define START_CODE 0x81       // Tecla 2: Iniciar Batalha
#define STOP_CODE  0x82       // Tecla 3: Parar Definitivo

// --- MOTORES (PONTE H L298N) ---
const int IN1_ESQ = 10;
const int IN2_ESQ = 9;
const int IN3_DIR = 6;
const int IN4_DIR = 5;

// --- VALORES DE PWM ---
const int PWM_MAX   = 255;    // Potência máxima de ataque 
const int PWM_RE    = 255;    // Potência da ré
const int PWM_GIRO  = 190;    // Potência do giro de 180° na borda
const int PWM_BUSCA = 150;    // Potência de varredura/busca

// --- CONSTANTES DE CONTROLE ---
const unsigned long TEMPO_RE   = 400;   // Tempo de ré em ms (ajustar conforme necessidade)
const unsigned long TEMPO_GIRO = 500;   // Tempo de giro para 180° (ajustar no ringue)
const int LIMIAR_BORDA         = 700;   // Limiar do QRE1113 (Calibrar preto/branco)
const bool BRANCO_E_MAIOR      = false; // true se branco > limiar, false se branco < limiar
const int DISTANCIA_ATAQUE     = 40;    // Distância em cm para acionar o ataque frontal

// --- VARIÁVEIS DOS SENSORES LASER ---
VL53L0X Sensor1;
VL53L0X Sensor2;

// ---------------- Leitura do Controle ----------------
unsigned long lerControle() {
  unsigned long codigo = 0;
  if (IrReceiver.decode()) {
    codigo = IrReceiver.decodedIRData.decodedRawData;
    IrReceiver.resume();
  }
  return codigo;
}

// ---------------- Funções de Movimento ----------------
void parar() {
  analogWrite(IN1_ESQ, 0);
  analogWrite(IN2_ESQ, 0);
  analogWrite(IN3_DIR, 0);
  analogWrite(IN4_DIR, 0);
}

void andarFrente(int pwm) {
  analogWrite(IN1_ESQ, pwm);  
  analogWrite(IN2_ESQ, 0); 
  analogWrite(IN3_DIR, 0);     
  analogWrite(IN4_DIR, pwm);
}

void andarTras(int pwm) {
  analogWrite(IN1_ESQ, 0);  
  analogWrite(IN2_ESQ, pwm); 
  analogWrite(IN3_DIR, pwm);     
  analogWrite(IN4_DIR, 0);
}

void girarHorario(int pwm) {
  analogWrite(IN1_ESQ, pwm);  
  analogWrite(IN2_ESQ, 0); 
  analogWrite(IN3_DIR, pwm);     
  analogWrite(IN4_DIR, 0);
}

// ---------------- Leitura de Sensores ----------------
bool bordaBrancaDetectada() {
  int valor = analogRead(SENSOR_LINHA);
  return BRANCO_E_MAIOR ? (valor > LIMIAR_BORDA) : (valor < LIMIAR_BORDA);
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracao = pulseIn(ECHO, HIGH, 30000); // Timeout de 30ms para evitar travamento
  if (duracao == 0) return 999; // Retorna distância alta se não houver eco

  float vel_som = 0.0343;
  long distancia = duracao * vel_som / 2;

  return distancia;
}

void finalizar() {
  parar();
  Serial.println(F("PARAR - FIM"));
  while (1); // Trava o robô no fim do combate
}

void lerSensoresLaser(int &m1, int &m2) {
  // Lê a distância em milímetros e converte para centímetros sem delays bloqueantes
  m1 = Sensor1.readRangeContinuousMillimeters() * 0.1;
  m2 = Sensor2.readRangeContinuousMillimeters() * 0.1;
}

// ---------------- Configuração Inicial ----------------
void configPinos() {
  pinMode(IN1_ESQ, OUTPUT);
  pinMode(IN2_ESQ, OUTPUT);
  pinMode(IN3_DIR, OUTPUT);
  pinMode(IN4_DIR, OUTPUT);

  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(SENSOR_LINHA, INPUT);
}

void configSensoresLaser() {
  pinMode(XSHUT_SENSOR1, OUTPUT);
  pinMode(XSHUT_SENSOR2, OUTPUT);

  Wire.begin();

  // Configuração de endereços I2C distintos para os dois sensores VL53L0X
  pinMode(XSHUT_SENSOR2, INPUT);
  delay(10);
  Sensor2.setAddress(SENSOR2_ENDERECO);

  pinMode(XSHUT_SENSOR1, INPUT);
  delay(10);
  Sensor1.setAddress(SENSOR1_ENDERECO);

  if (!Sensor1.init()) Serial.println(F("Falha ao iniciar Sensor1"));
  if (!Sensor2.init()) Serial.println(F("Falha ao iniciar Sensor2"));

  Sensor1.setTimeout(500);
  Sensor2.setTimeout(500);

  Sensor1.startContinuous();
  Sensor2.startContinuous();
}

void aguardarStart() {
  Serial.println(F("Aguardando botao 2 (START) para iniciar..."));
  unsigned long ultimoPrint = 0;
  
  while (lerControle() != START_CODE) {
    if (millis() - ultimoPrint > 500) {
      ultimoPrint = millis();
      Serial.print(F("Sensor Linha (A0): "));
      Serial.print(analogRead(SENSOR_LINHA));
      Serial.print(F(" | Borda Detectada: "));
      Serial.println(bordaBrancaDetectada() ? "SIM" : "NAO");
    }
  }
  Serial.println(F("Batalha Iniciada!"));
}

// ---------------- Setup e Loop Principal ----------------
void setup() {
  Serial.begin(9600);
  IrReceiver.begin(IR_RECEIVE_PIN);
  configPinos();
  configSensoresLaser();

  // Aguarda comando do controle remoto para começar
  aguardarStart();
}

void loop() {
  // 1. Verificação prioritária de segurança: Borda Branca do Ringue
  if (bordaBrancaDetectada()) {
    andarTras(PWM_RE);
    delay(TEMPO_RE);
    girarHorario(PWM_GIRO);
    delay(TEMPO_GIRO);
    return; // Retorna para o topo do loop após desviar da borda
  }

  // 2. Leitura dos sensores ultrassônico e laser lateral
  long distanciaUltra = medirDistanciaCm();
  int distLaser1 = 0, distLaser2 = 0;
  lerSensoresLaser(distLaser1, distLaser2);

  // 3. Estratégia de Combate (Ataque vs Busca)
  // Se o ultrassom avistar o oponente à frente
  if (distanciaUltra < DISTANCIA_ATAQUE) {
    andarFrente(PWM_MAX);
  } 
  // Se os lasers laterais detectarem algo próximo (ajuste o limite de cm conforme necessário)
  else if ((distLaser1 > 0 && distLaser1 < 30) || (distLaser2 > 0 && distLaser2 < 30)) {
    girarHorario(PWM_MAX); // Gira para focar o oponente na lateral
  } 
  else {
    // Varredura / Busca ativa
    girarHorario(PWM_BUSCA);
  }

  // 4. Botão de emergência / parada definitiva (Botão 3)
  if (lerControle() == STOP_CODE) {
    finalizar();
  }
}