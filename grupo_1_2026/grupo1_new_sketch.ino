
// variáveis
#define trig 10
#define echo 9

void setup() {
  Serial.begin(9600);

  // Configurando os pinos digitais
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
}


void configSensorUltraSonico() {
  long duracao;
  float distancia;

  // Gerando o pulso da Onda Digital do sensor ultrasonico 
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig,LOW);

  // medindo o tempo de retorno
  duracao = pulseIn(echo, HIGH); 

  // calcula a distancia em cm
  float vel_som = 0.0343;
  distancia = duracao * vel_som / 2;

  if (distancia <= 20) {
    Serial.println("\n\nPERIGO!");
  } 
    

  Serial.print("\nDistancia: ");
  Serial.print(distancia);
  Serial.print(" [cm]");
  delay(1000);
}


/*
 * Arduino Nano + L298N
 * 2 motores DC
 */

// Motor esquerdo
const int IN1_MOTOR_ESQUERDO = 10;
const int IN2_MOTOR_ESQUERDO = 9;

// Motor direito
const int IN3_MOTOR_DIREITO = 6;
const int IN4_MOTOR_DIREITO = 5;

// Variáveis e Configurações
const int PWM_max = 255;
const int PWM_50 = 128;
const unsigned long TEMPO_ESPERA = 5000; // 5 segundos


// ======================================================
// MOTOR ESQUERDO E DIREITO - FRENTE
// ======================================================
void moverFrente() {
  digitalWrite(IN1_MOTOR_ESQUERDO, HIGH);
  digitalWrite(IN2_MOTOR_ESQUERDO, LOW);

  digitalWrite(IN3_MOTOR_DIREITO, LOW);
  digitalWrite(IN4_MOTOR_DIREITO, HIGH);
}


// MOTORES - RÉ

void moverRe() {
  digitalWrite(IN1_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN2_MOTOR_ESQUERDO, HIGH);

  digitalWrite(IN3_MOTOR_DIREITO, HIGH);
  digitalWrite(IN4_MOTOR_DIREITO, LOW);
}


// PARAR MOTORES

void pararMotores() {
  digitalWrite(IN1_MOTOR_ESQUERDO, LOW);
  digitalWrite(IN2_MOTOR_ESQUERDO, LOW);

  digitalWrite(IN3_MOTOR_DIREITO, LOW);
  digitalWrite(IN4_MOTOR_DIREITO, LOW);
}


void girarSentidoHorario() {

  //const int valor = 255 / 2; // entrada analogica variando entre 0 e 255

  // Motor esquerdo → frente
  analogWrite(IN1_MOTOR_ESQUERDO, 0);
  analogWrite(IN2_MOTOR_ESQUERDO, 128);

  // Motor direito → ré
  analogWrite(IN3_MOTOR_DIREITO, 0);
  analogWrite(IN4_MOTOR_DIREITO, 128);
}


void setup() {
  pinMode(IN1_MOTOR_ESQUERDO, OUTPUT);
  pinMode(IN2_MOTOR_ESQUERDO, OUTPUT);

  pinMode(IN3_MOTOR_DIREITO, OUTPUT);
  pinMode(IN4_MOTOR_DIREITO, OUTPUT);

  // Começa parado
  pararMotores();
}

void loop() {

  // 1. ANDAR PARA FRENTE - POTÊNCIA MÁXIMA
  moverFrente(PWM_max);
  delay(TEMPO_ESPERA);

  // 2. Parar e esperar 5 segundos
  pararMotores();
  delay(TEMPO_ESPERA);

  // 3. RÉ - POTÊNCIA MÁXIMA
  moverRe(PWM_max);
  delay(TEMPO_ESPERA);

  // 4. Parar e esperar 5 segundos
  pararMotores();
  delay(TEMPO_ESPERA);

  // 5. GIRAR NO SENTIDO HORÁRIO (PWM = 50%)
  girarSentidoHorario(PWM_50);
  delay(TEMPO_ESPERA);
}









