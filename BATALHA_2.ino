#include <IRremote.hpp>
#include <Wire.h>
#include <VL53L0X.h>

#define sensor_refletancia A1



#define IR_RECEIVE_PIN 11
#define START_CODE 0x81


#define ESTRATEGIA_1 0x83  //4
#define ESTRATEGIA_2 0x84  //5
#define ESTRATEGIA_3 0x85  //6
#define ESTRATEGIA_4 0x86  //7
#define ESTRATEGIA_5 0x87  //8
int ESTRATEGIA = 0;

#define IN1 9   //dir
#define IN2 10  //dir
#define IN3 5   //esq
#define IN4 6   //esq


#define pino_trig A3
#define pino_echo 4
#define STOP_CODE 0x82

#define XSHUT_Sensor2 2
#define XSHUT_Sensor1 3
#define Sensor1_endereco 42
#define Sensor2_endereco 43

VL53L0X Sensor1;  // dir
VL53L0X Sensor2;  //esq
const long intervalo = 500;
boolean detectado = false;
byte signalState = LOW;
 


unsigned long  Tempo_millis = 0; 
unsigned long auxiliar = 0 ;

float distancia;
float tempo;

int valor = 0;
void setup() {
  Serial.begin(9600);  // put your setup code here, to run once:
  IrReceiver.begin(IR_RECEIVE_PIN);
  Controle();
  CONFIG_MOTORS();
  pinMode(pino_trig, OUTPUT);
  pinMode(pino_echo, INPUT);
  digitalWrite(pino_trig, LOW);

  IrReceiver.resume();

  Serial.print("oi");
  //Desliga todos os VL53L0X.
  pinMode(XSHUT_Sensor1, OUTPUT);
  pinMode(XSHUT_Sensor2, OUTPUT);

  //Inicia a comunicação serial.
  Serial.begin(9600);
  Wire.begin();

  //Liga os sensores e altera seus endereços.
  pinMode(XSHUT_Sensor2, INPUT);
  delay(10);
  Sensor2.setAddress(Sensor2_endereco);
  pinMode(XSHUT_Sensor1, INPUT);
  delay(10);
  Sensor1.setAddress(Sensor1_endereco);

  //Inicializa os sensores.
  Sensor1.init();
  Sensor2.init();

  //Define timeout para os sensores.
  Sensor1.setTimeout(500);
  Sensor2.setTimeout(500);

  //Inicia o modo de leitura contínuo dos VL53L0X.
  Sensor1.startContinuous();
  Sensor2.startContinuous();

  Seleciona_Estrategia();
  while (IrReceiver.decodedIRData.decodedRawData != START_CODE) {
    Controle();
  }
  Executa_Estrategia();
}
void loop() {
  valor = analogRead(sensor_refletancia);
  Ultrassom();
  int measure2 = Sensor2.readRangeContinuousMillimeters() * 0.1;
  int measure1 = Sensor1.readRangeContinuousMillimeters() * 0.1;
  Ultrassom();

  //valor = analogRead(sensor_refletancia);
  if (valor <= 650) {
    SET_MOTORS(0, 0);
    delay(100);
    SET_MOTORS(-255, -255);
    delay(400);
    SET_MOTORS(255, -255);
    delay(500);
  } else if (distancia < 60) {
    Serial.println(distancia);
    SET_MOTORS(255, 255);
  } else if ((10 < measure1) && (measure1 < 60)) {
    SET_MOTORS(-255, 255);
  } else if (10 > measure1) {
    SET_MOTORS(-100, -100);
    delay(200);
    SET_MOTORS(-255, 255);
    delay(100);
  } else if ((10 < measure2) && (measure2 < 60)) {
    SET_MOTORS(255, -255);
  } else if (10 > measure2) {
    SET_MOTORS(-100, -100);
    delay(100);
    SET_MOTORS(255, -255);
    delay(100);
  } else {
    SET_MOTORS(255, 255);
  }

  Controle();
  Stop();
  
}
void Stop(){
  if (IrReceiver.decodedIRData.decodedRawData == STOP_CODE) {
    while (1) {

      SET_MOTORS(0, 0);
    }
  }
}
void Controle() {
  if (IrReceiver.decode()) {  // se algum código for recebido
    IrReceiver.resume();      // put your main code here, to run repeatedly:
    Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
  }
}

void Seleciona_Estrategia(void) {
  while (ESTRATEGIA == 0) {
    if (IrReceiver.decode()) {  // se algum código for recebido
      Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
      unsigned long codigo = IrReceiver.decodedIRData.decodedRawData;
      switch (codigo) {
        case ESTRATEGIA_1:
          ESTRATEGIA = 1;
          Serial.println("1");
          break;
        case ESTRATEGIA_2:
          ESTRATEGIA = 2;
          Serial.print("2");
          break;
        case ESTRATEGIA_3:
          ESTRATEGIA = 3;
          Serial.print("3");
          break;
        case ESTRATEGIA_4:
          ESTRATEGIA = 4;
          Serial.print("4");
          break;
        case ESTRATEGIA_5:
          ESTRATEGIA = 5;
          Serial.print("5");
          break;
        default:
          break;
      }
      IrReceiver.resume();
    }
  }
}
void Executa_Estrategia(void) {
  switch (ESTRATEGIA) {
    case 1:
      Tempo_millis = millis ();
      Ultrassom();
      Serial.print("Entrou");
      int measure2 = Sensor2.readRangeContinuousMillimeters() * 0.1;
      int measure1 = Sensor1.readRangeContinuousMillimeters() * 0.1;
      SET_MOTORS(-255,255);
      delay(500);
      SET_MOTORS(255,180);
      while (millis() - auxiliar <= 1000 && distancia>30 && measure1>30 && measure2>30){
        Ultrassom();
        measure2 = Sensor2.readRangeContinuousMillimeters() * 0.1;
        measure1 = Sensor1.readRangeContinuousMillimeters() * 0.1;
        Stop();
      }
      
      Serial.println("executou");
      break;
    case 2:
    
      Tempo_millis = millis ();
      Ultrassom();
      Serial.print("Entrou");
      measure2 = Sensor2.readRangeContinuousMillimeters() * 0.1;
      measure1 = Sensor1.readRangeContinuousMillimeters() * 0.1;
      SET_MOTORS(255,-255);
      delay(500);
      SET_MOTORS(180,255);
      Serial.print("entrou2");
      while (millis() - auxiliar <= 1000 && distancia>30 && measure1>30 && measure2>30){
        Ultrassom();
        measure2 = Sensor2.readRangeContinuousMillimeters() * 0.1;
        measure1 = Sensor1.readRangeContinuousMillimeters() * 0.1;
        Stop();
      }
      Serial.print("Estrategia-2");
      
      Serial.println("executou");
      Serial.println("executou");
      break;
    case 3:
      Serial.println("executou");
      break;
    case 4:
      Serial.println("executou");
      break;
    case 5:
      Serial.println("executou");
      break;
    default:
      break;
  }
}



void CONFIG_MOTORS(void) {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
}
void Ultrassom(void) {
  digitalWrite(pino_trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pino_trig, LOW);
  tempo = pulseIn(pino_echo, HIGH);
  distancia = (tempo * 0.034) / 2;
}
void SET_MOTORS(int PWM_DIR, int PWM_ESQ) {
  if (PWM_DIR > 0) {
    digitalWrite(IN2, LOW);
    analogWrite(IN1, PWM_DIR);
  } else if (PWM_DIR < 0) {
    //PWM_DIR= -PWM_DIR;
    digitalWrite(IN1, LOW);
    analogWrite(IN2, -PWM_DIR);
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
  }
  if (PWM_ESQ > 0) {
    digitalWrite(IN3, LOW);
    analogWrite(IN4, PWM_ESQ);
  } else if (PWM_ESQ < 0) {
    //PWM_DIR= -PWM_DIR;
    digitalWrite(IN4, LOW);
    analogWrite(IN3, -PWM_ESQ);
  } else {
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
  }
}