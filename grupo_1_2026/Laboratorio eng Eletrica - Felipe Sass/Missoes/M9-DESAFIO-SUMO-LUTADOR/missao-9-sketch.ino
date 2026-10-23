
#include <IRremote.hpp> // Adcionando a biblioteca IRremote

#define IR_RECEIVE_PIN 11

#define READY_CODE 0x80 // Código da Tecla 1 do controle da Sony
#define START_CODE 0x81 // Código da Tecla 2 do controle da Sony
#define STOP_CODE 0x82  // Código da Tecla 3 do controle da Sony

// -------------------- Motor esquerdo --------------------
#define IN1_MOTOR_ESQUERDO 10
#define IN2_MOTOR_ESQUERDO 9
// -------------------- Motor direito --------------------
#define IN3_MOTOR_DIREITO 6
#define IN4_MOTOR_DIREITO 5

// -------------------- Sensor ultrassônico --------------------
#define TRIG_PIN A4
#define ECHO_PIN A3

// -------------------- Sensor de linha --------------------
#define SENSOR_LINHA A0

// ============================================================
//                 CONFIGURAÇÕES DO ROBÔ
// ============================================================
#define DISTANCIA_LIMITE 20
#define PWM_MAX 255
#define PWM_RE 180
#define PWM_GIRO 180
#define TEMPO_RE 400
#define TEMPO_GIRO 650
#define LIMIAR_LINHA 700

// Sensor refletancia
int valorAD;
bool naBordaBranca;
bool btn_pressed = false;

// Sensor de refletância: calibrar LIMIAR conforme leitura real de PRETO x BRANCO
const int LIMIAR = 700;

// ======================================================
// LEITURA DO SENSOR DE REFLETÂNCIA
// Atualiza valorAD e naBordaBranca, e envia pela Serial:
// "valorAD / PRETO" ou "valorAD / BRANCO"
// ======================================================
void lerSensorLinha()
{
  valorAD = analogRead(SENSOR_LINHA);

  // ajuste o sinal ">" ou "<" conforme a calibração do seu sensor
  naBordaBranca = (valorAD <= LIMIAR); // BRANCO = borda do ringue

  Serial.print(valorAD);
  Serial.print(" / ");
  Serial.println(naBordaBranca ? "BRANCO" : "PRETO");
}

// ANDAR PARA FRENTE COM POTÊNCIA MÁXIMA
void andarFrenteMaxima()
{
  analogWrite(IN1_MOTOR_ESQUERDO, PWM_MAX);
  analogWrite(IN2_MOTOR_ESQUERDO, 0);

  analogWrite(IN3_MOTOR_DIREITO, 0);
  analogWrite(IN4_MOTOR_DIREITO, PWM_MAX);
}

void MOTORS_CONFIG(void)
{
  pinMode(IN1_MOTOR_ESQUERDO, OUTPUT);
  pinMode(IN2_MOTOR_ESQUERDO, OUTPUT);
  pinMode(IN3_MOTOR_DIREITO, OUTPUT);
  pinMode(IN4_MOTOR_DIREITO, OUTPUT);
}

void girar180()
{
  // Motor esquerdo -> frente
  analogWrite(IN1_MOTOR_ESQUERDO, PWM_GIRO);
  analogWrite(IN2_MOTOR_ESQUERDO, 0);

  // Motor direito -> ré (giro no próprio eixo)
  analogWrite(IN3_MOTOR_DIREITO, PWM_GIRO);
  analogWrite(IN4_MOTOR_DIREITO, 0);

  delay(TEMPO_GIRO);
  // pararMotores();
}

void PARAR(void)
{
  digitalWrite(IN1_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN2_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN3_MOTOR_DIREITO, LOW);
  digitalWrite(IN4_MOTOR_DIREITO, LOW);
}

void FRENTE(void)
{
  digitalWrite(IN1_MOTOR_ESQUERDO, HIGH);
  digitalWrite(IN2_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN3_MOTOR_DIREITO, LOW);
  digitalWrite(IN4_MOTOR_DIREITO, HIGH);
}

void RE(void)
{

  digitalWrite(IN1_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN2_MOTOR_ESQUERDO, HIGH);
  digitalWrite(IN3_MOTOR_DIREITO, HIGH);
  digitalWrite(IN4_MOTOR_DIREITO, LOW);
}

void RE_COM_POT_MAX()
{
  analogWrite(IN1_MOTOR_ESQUERDO, 0);
  analogWrite(IN2_MOTOR_ESQUERDO, PWM_RE);

  analogWrite(IN3_MOTOR_DIREITO, PWM_RE);
  analogWrite(IN4_MOTOR_DIREITO, 0);
}

void andarParaTras()
{
  Serial.println("Andando de 10 até 20cm");
  analogWrite(IN1_MOTOR_ESQUERDO, 0);
  analogWrite(IN2_MOTOR_ESQUERDO, HIGH);

  analogWrite(IN3_MOTOR_DIREITO, HIGH);
  analogWrite(IN4_MOTOR_DIREITO, 0);
}

void desafio_vai_volta()
{
  int TEMPO_ESPERA = 2000; // 2 segundos

  // 1. ANDAR PARA FRENTE - POTÊNCIA MÁXIMA
  FRENTE(PWM_max);
  delay(TEMPO_ESPERA);

  // 2. Parar e esperar 5 segundos
  PARAR();
  delay(TEMPO_ESPERA);

  // 3. RÉ - POTÊNCIA MÁXIMA
  RE(PWM_max);
  delay(TEMPO_ESPERA);

  // 4. Parar e esperar 5 segundos
  PARAR();
  delay(TEMPO_ESPERA);

  // 5. GIRAR NO SENTIDO HORÁRIO (PWM = 50%)
  girar180(PWM_50);
  delay(TEMPO_ESPERA);
}

/// -------------------------------------

void sensorUltrassonicoConfig(int trigPin, int echoPin)
{
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  digitalWrite(trigPin, LOW);
}

void on_event_button3()
{
  // reinicializa o receptor no botão 3
  if (IrReceiver.decodedIRData.decodedRawData == STOP_CODE)
  {
    PARAR();

    // gambiarra do professor para parar dentro do loop
    while (1)
      ;
  }
}

void on_event_button1()
{
  if (IrReceiver.decodedIRData.decodedRawData == READY_CODE)
  {
    PARAR();
  }
}

float medirDistancia(int trigPin, int echoPin)
{

  long duracao;
  float distancia;
  // Gerando o pulso da Onda Digital do sensor ultrasonico
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // medindo o tempo de retorno
  duracao = pulseIn(echoPin, HIGH);

  // calcula a distancia em cm/s
  float vel_som = 0.0343;
  distancia = duracao * vel_som / 2;

  Serial.print("\nDistancia: ");
  Serial.print(distancia);
  Serial.print(" cm");
  // delay(1000);

  if (distancia < 40)
  {
    FRENTE();
  }
  else
  {
    girar180(); // TODO -> sinais PWM com ciclo de 50% (uma roda para frente e  a outra para trás)

    on_event_button3();
  }
}

void configInicial()
{
  Serial.begin(9600);

  // receptor infravermelho
  IrReceiver.begin(IR_RECEIVE_PIN);

  // sensor ultrassonico
  sensorUltrassonicoConfig(TRIG_PIN, ECHO_PIN);

  // motores
  MOTORS_CONFIG();

  // Sensor de refletancia
  pinMode(SENSOR_LINHA, INPUT);
}

void onBordaBrancaEvent()
{
}

void setup()
{

  configInicial();

  // evento de receber dados preso no botão 2
  while (IrReceiver.decodedIRData.decodedRawData != START_CODE)
  {
    if (IrReceiver.decode())
    {                      // se algum código for recebido
      IrReceiver.resume(); // reinicializa o receptor

      btn_pressed = true;
    }
  }
}

void loop()
{

  // Decodificação dos dados do controle remoto
  if (IrReceiver.decode())
  {
    IrReceiver.resume();
  }

  if (btn_pressed)
  {
    // ---------- O robô está na borda branca? ----------
    if (naBordaBranca)
    {
      // SIM
      andarParaTras();
      girar180();
    }
    else
    {
      // NÃO
      medirDistancia(TRIG_PIN, ECHO_PIN);
      andarFrenteMaxima();
    }
  }
}
