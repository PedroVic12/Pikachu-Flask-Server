// Este exemplo funciona na versão 4.4.1 da biblioteca IRremote
#include <IRremote.hpp> // Adcionando a biblioteca IRremote

#define IR_RECEIVE_PIN 11 // O receptor infravermelho está conectado fisicamento no pino 11 do Arduino Nano

#define READY_CODE 0x80 // Código da Tecla 1 do controle da Sony
#define START_CODE 0x81 // Código da Tecla 2 do controle da Sony
#define STOP_CODE 0x82 // Código da Tecla 3 do controle da Sony

void setup() {
  Serial.begin(9600); // Iniciando a comunicação Serial
  IrReceiver.begin(IR_RECEIVE_PIN); // Iniciando a biblioteca IRremote, que fará a decodificação dos sinais enviados pelo controle remoto
}

void loop() {
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