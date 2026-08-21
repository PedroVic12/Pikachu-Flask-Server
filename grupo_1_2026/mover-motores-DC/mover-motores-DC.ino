/*
 * Arduino Nano + L298N
 * 2 motores DC
 *
 * Fluxograma:
 *
 * INÍCIO
 *   ↓
 * Configuração inicial
 *   ↓
 * Frente - potência máxima
 *   ↓
 * Espera 5 s
 *   ↓
 * Parar
 *   ↓
 * Espera 5 s
 *   ↓
 * Ré - potência máxima
 *   ↓
 * Espera 5 s
 *   ↓
 * Parar
 *   ↓
 * Espera 5 s
 *   ↓
 * Girar sentido horário - PWM 50%
 *   ↓
 * Espera 5 s
 *   ↓
 * Voltar ao início.
 */

// Variávies e Configurações

const int PWM_max = 255;
const PWM_50 = 128;
const unsigned long TEMPO_ESPERA = 5000; // 5 segundos

// Motor esquerdo
const int PWM_MOTOR_ESQUERDO = 5;
const int IN1_MOTOR_ESQUERDO = 7;
const int IN2_MOTOR_ESQUERDO = 8;

//Motor direito 
const int PWM_MOTOR_DIREITO = 6;
const int IN3_MOTOR_DIREITO = 9;
const int IN4_MOTOR_DIREITO = 10;


// ======================================================
// FUNÇÕES DOS MOTORES
// ======================================================
void moverFrente(int velocidadePWM){
  /*
   * MOTOR ESQUERDO

   * Isso cria uma polaridade no motor,considerando a ligação dos fios,
   * faz a roda esquerda girar para frente.
   */
  digitalWrite(IN1_MOTOR_ESQUERDO,HIGH);
  digitalWrite(IN2_MOTOR_ESQUERDO,LOW);

  /*
   * MOTOR DIREITO
  */
  digitalWrite(IN3_MOTOR_DIREITO,HIGH);
  digitalWrite(IN4_MOTOR_DIREITO,LOW);

  /*
   * ENA e ENB recebem PWM.
   *
   * 0   = motor desligado
   * 128 ≈ 50%
   * 255 = potência máxima
   */
  analogWrite(PWM_MOTOR_ESQUERDO, velocidadePWM);
  analogWrite(PWM_MOTOR_DIREITO, velocidadePWM);

}


void moverRe(int velocidadePWM)
{
  /*
   * MOTOR ESQUERDO
   *
   * Invertemos a polaridade:
   *
   * IN1 = LOW
   * IN2 = HIGH
   *
   * Agora a corrente atravessa o motor no sentido oposto ao movimento para frente.
   */
  digitalWIN1_MOTOR_ESQUERDO, LOW);
  digitalWIN2_MOTOR_ESQUERDO, HIGH);

  /*
   * MOTOR DIREITO
   */
  digitalWIN3_MOTOR_DIREITO, LOW);
  digitalWIN4_MOTOR_DIREITO, HIGH);

  // PWM
  analogWPWM_MOTOR_ESQUERDO, velocidadePWM);
  analogWPWM_MOTOR_DIREITO, velocidadePWM);
}


void pararMotores()
{
  
  //PWM = 0. Retiramos a energia efetiva enviada aos motores.
  analogWrite(PWM_MOTOR_ESQUERDO, 0);
  analogWrite(PWM_MOTOR_DIREITO, 0);

  // Não existe diferença de potencial aplicada entre os terminais do motor.

  // Motor A → parado
  digitalWrite(IN1_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN2_MOTOR_ESQUERDO, LOW);


  //Motor B → parado
  digitalWrite(IN3_MOTOR_DIREITO, LOW);
  digitalWrite(IN4_MOTOR_DIREITO, LOW);
}

void girarSentidoHorario(int velocidadePWM){

  /*
   * Para girar sobre o próprio eixo,
   * fazemos uma roda andar para frente
   * enquanto a outra anda para trás.
   *
   * MOTOR ESQUERDO → FRENTE
   *
   * IN1 = HIGH
   * IN2 = LOW
   */
  digitalWrite(IN1_MOTOR_ESQUERDO, HIGH);
  digitalWrite(IN2_MOTOR_ESQUERDO, LOW);

  /*
   * MOTOR DIREITO → RÉ
   *
   * IN3 = LOW
   * IN4 = HIGH
   */
  digitalWrite(IN3_MOTOR_DIREITO, LOW);
  digitalWrite(IN4_MOTOR_DIREITO, HIGH);

  /*
   * PWM de ambos os motores.

   * velocidadePWM = 128
   *
   * aproximadamente 50% do duty cycle.
   */
  analogWrite(PWM_MOTOR_ESQUERDO, velocidadePWM);
  analogWrite(PWM_MOTOR_DIREITO, velocidad
}


void setup() {
  // Motor Esquerdo
  pinMode(PWM_MOTOR_ESQUERDO,OUTPUT);
  pinMode(IN1_MOTOR_ESQUERDO,OUTPUT);
  pinMode(IN2_MOTOR_ESQUERDO, OUTPUT;)

  // Motor Direito
  pinMode(PWM_MOTOR_DIREITO,OUTPUT);
  pinMode(IN3_MOTOR_DIREITO,OUTPUT);
  pinMode(IN4_MOTOR_DIREITO,OUTPUT);

  // Estado inicial -> parado
  parar();
  delay(1000);
}

void loop() {
   // 1. ANDAR PARA FRENTE - POTÊNCIA MÁXIMA
  moverFrente(PWM_max);
  delay(TEMPO_ESPERA);

  // 2. Parar e esperar 5 segundos
  parar();
  delay(TEMPO_ESPERA);

  // 3. RÉ - POTÊNCIA MÁXIMA
  moverRe(PWM_MAX);
  delay(TEMPO_ESPERA);

  // 4. Parar e esperar 5 segundos
  parar();
  delay(TEMPO_ESPERA);

  // 5. GIRAR NO SENTIDO HORÁRIO
  //    PWM = 50%
  girarSentidoHorario(PWM_50);
  delay(TEMPO_ESPERA);

}
