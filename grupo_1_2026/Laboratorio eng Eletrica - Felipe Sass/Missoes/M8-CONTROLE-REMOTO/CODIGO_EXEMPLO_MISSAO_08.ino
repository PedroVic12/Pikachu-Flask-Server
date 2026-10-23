
// Sensor Infravermelho com Controle Remoto Sony
#include <IRremote.hpp> 
#define IR_RECEIVE_PIN 11 // O receptor infravermelho está conectado fisicamento no pino 11 do Arduino Nano


#define READY_CODE 0x80 // Código da Tecla 1 do controle da Sony
#define START_CODE 0x81 // Código da Tecla 2 do controle da Sony
#define STOP_CODE 0x82 // Código da Tecla 3 do controle da Sony

// ---------------- Pinos ----------------

// Sensor de refletância (detecta a borda branca do ringue)
#define SENSOR_LINHA A0

// Motor esquerdo
const int IN1_MOTOR_ESQUERDO = 10;
const int IN2_MOTOR_ESQUERDO = 9;

// variáveis sensor ultrassonico
#define trig A4
#define echo A3

// Motor direito
const int IN3_MOTOR_DIREITO = 6;
const int IN4_MOTOR_DIREITO = 5;

// ---------------- Configurações ----------------


struct PinosMotor {
  int in1;
  int in2;
  int in3;
  int in4;
};

struct ConfigPWM {
  int maxPotencia; // potência máxima (frente)
  int re;          // potência da ré
  int giro;        // potência do giro
};

const int PWM_MAX = 255;   // potência máxima (frente)
const int PWM_RE  = 180;   // potência da ré
const int PWM_GIRO = 180;  // potência do giro
const unsigned long TEMPO_RE     = 400;  // tempo para andar de ~10 a 20 cm para trás
const unsigned long TEMPO_GIRO   = 650;  // tempo para girar ~180°

// Sensor de refletância: calibrar LIMIAR conforme leitura real de PRETO x BRANCO
const int LIMIAR = 700;



struct EstadoSensor {
  int valorAD;
  bool naBordaBranca;
};


int valorAD;
bool naBordaBranca;


// -------------------------------------------------------------------


void initRemoteInfraSensor(){
    IrReceiver.begin(IR_RECEIVE_PIN); // IRremote, que fará a decodificação dos sinais enviados pelo controle remoto
}


void initDecodificacaoSinalInfravermelho() {
    if (IrReceiver.decode()) { // se algum código for recebido
    IrReceiver.resume(); // reinicializa o receptor
    if (IrReceiver.decodedIRData.decodedRawData == READY_CODE) { // Se o botão 1 foi pressionado
      Serial.print("PREPARAR - ");


    } else if (IrReceiver.decodedIRData.decodedRawData == START_CODE) { // Se o botão 2 foi pressionado
      Serial.print("INICIAR - ");



    } else if (IrReceiver.decodedIRData.decodedRawData == STOP_CODE) { // Se o botão 3 foi pressionado
      Serial.print("PARAR - ");
    }
    Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX); // imprime o HEX Code
  }
}


Carro carro(A0, {10, 9}, {6, 5});


void setup() {
  Serial.begin(9600); // Iniciando a comunicação Serial
  initRemoteInfraSensor();
  carro.iniciar();

}



void loop() {
  initDecodificacaoSinalInfravermelho();
  carro.iniciarSensorRefletancia();

}