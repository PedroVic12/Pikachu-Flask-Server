#include <IRremote.hpp>

#define IR_RECEIVE_PIN 11     // Receptor infravermelho

#define SENSOR_LINHA   A0     // Sensor de refletância (borda branca)

#define TRIG           A4     // Ultrassônico
#define ECHO           A3

// Motor esquerdo
const int IN1_ESQ = 10;
const int IN2_ESQ = 9;

// Motor direito
const int IN3_DIR = 6;
const int IN4_DIR = 5;

#define READY_CODE 0x80       // Tecla 1
#define START_CODE 0x81       // Tecla 2
#define STOP_CODE  0x82       // Tecla 3

const int PWM_MAX   = 255;    // Potência máxima 
const int PWM_RE    = 255;    // Potência da ré
const int PWM_GIRO  = 255;    // Potência do giro de 180° na borda
const int PWM_BUSCA = 127;    // 50% de duty cycle 

const unsigned long TEMPO_RE   = 1000;  // ~10 a 20 cm para trás (1 segundo) 

const unsigned long TEMPO_GIRO = 650;  // ~180° (calibrar)

const int LIMIAR = 700;       // Calibrar ao detectador borda

const bool BRANCO_E_MAIOR = false;
const int DISTANCIA_ATAQUE = 40;      

// ---------------- Controle remoto ----------------
// Retorna o código do botão recebido (0 se nada foi recebido)
unsigned long lerControle() {
  unsigned long codigo = 0;
  if (IrReceiver.decode()) {
    codigo = IrReceiver.decodedIRData.decodedRawData;
    IrReceiver.resume();
  }
  return codigo;
}

// ---------------- Motores ----------------
void motorEsquerdo(int pwm) {  
    analogWrite(IN1_ESQ, pwm);  
    analogWrite(IN2_ESQ, 0); 
    analogWrite(IN1_ESQ, 0);    
    analogWrite(IN2_ESQ, pwm); 
  
}

void motorDireito(int pwm) {
    analogWrite(IN3_DIR, pwm);  
    analogWrite(IN4_DIR, 0); 
    analogWrite(IN3_DIR, 0);    
    analogWrite(IN4_DIR, pwm); 
}

void parar() {
  motorEsquerdo(0);
  motorDireito(0);
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

// ---------------- Sensores ----------------
bool bordaBrancaDetectada() {
  int valor = analogRead(SENSOR_LINHA);
  return BRANCO_E_MAIOR ? (valor > LIMIAR) : (valor < LIMIAR);
}

// Retorna distância em cm (999 se nada for detectado)
long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  unsigned long duracao = pulseIn(ECHO, HIGH, 25000UL); // timeout ~4 m
  if (duracao == 0) return 999;
  return duracao / 58;
}

// ---------------- Fim da missão ----------------
void finalizar() {
  parar();
  //Serial.println(F("PARAR - FIM"));
  while (true) { }   // FIM
}

// Espera "ms" milissegundos sem perder o botão 3 (parar)
void esperarComParada(unsigned long ms) {
  unsigned long inicio = millis();
  while (millis() - inicio < ms) {
    if (lerControle() == STOP_CODE) finalizar();
  }
}

// =====================================================================
// SETUP

void configPinos(){
  pinMode(IN1_ESQ, OUTPUT);
  pinMode(IN2_ESQ, OUTPUT);
  pinMode(IN3_DIR, OUTPUT);
  pinMode(IN4_DIR, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(SENSOR_LINHA, INPUT);
}


void setup() {
  // Configuração inicial
  Serial.begin(9600);
  IrReceiver.begin(IR_RECEIVE_PIN);
  configPinos();
  // O botão 2 foi pressionado? NÃO -> continua esperando | SIM -> segue para o LOOP
  //Serial.println(F("Aguardando botao 2 (INICIAR)..."));
  unsigned long ultimoPrint = 0;
  while (lerControle() != START_CODE) {
    if (millis() - ultimoPrint > 300) {
      ultimoPrint = millis();
      // Serial.print(F("Sensor A0 = "));
      // Serial.print(analogRead(SENSOR_LINHA));
      // Serial.print(F(" -> "));
      // Serial.println(bordaBrancaDetectada() ? F("BRANCO") : F("PRETO"));
    }
  }
  Serial.println(F("INICIAR"));
  Serial.println("fim dos logs agora");
}


void loop() {


  if (bordaBrancaDetectada()) {
    // SIM: andar para trás (10 a 20 cm) e girar ~180°
    andarTras(PWM_RE);
    delay(TEMPO_RE);
    girarHorario(PWM_GIRO);
    delay(TEMPO_GIRO);

  } else {
    long D = medirDistanciaCm();
    if (D < DISTANCIA_ATAQUE) {
      andarFrente(PWM_MAX);
    } else {
      // (uma roda para frente e a outra para trás) PWM de 50%
      girarHorario(PWM_BUSCA);
    }
  }

  // O botão 3 foi pressionado? - Desligar
  if (lerControle() == STOP_CODE) {
    finalizar();
  }


}
