/*
 * INÍCIO
 *   -> Configuração Inicial
 *   -> Interpretar sinal do sensor de reflectância
 *   -> O robô está na borda branca?
 *        SIM -> Andar para trás (10 a 20 cm) -> Girar ~180° -> volta a interpretar o sensor
 *        NÃO -> Andar para frente com potência máxima -> volta a interpretar o sensor
 */

// ---------------- Pinos ----------------

// Sensor de refletância (detecta a borda branca do ringue)
#define SENSOR_LINHA A0

// Motor esquerdo
const int IN1_MOTOR_ESQUERDO = 10;
const int IN2_MOTOR_ESQUERDO = 9;

// Motor direito
const int IN3_MOTOR_DIREITO = 6;
const int IN4_MOTOR_DIREITO = 5;

// ---------------- Configurações ----------------

const int PWM_MAX = 255;   // potência máxima (frente)
const int PWM_RE  = 180;   // potência da ré
const int PWM_GIRO = 180;  // potência do giro

// Tempos (ms) usados para estimar deslocamento/ângulo, já que não há encoder.
// Calibrar na prática de acordo com o robô real.
const unsigned long TEMPO_RE     = 400;  // tempo para andar de ~10 a 20 cm para trás
const unsigned long TEMPO_GIRO   = 650;  // tempo para girar ~180°

// Sensor de refletância: calibrar LIMIAR conforme leitura real de PRETO x BRANCO
const int LIMIAR = 700;

int valorAD;
bool naBordaBranca;



// ======================================================
// LEITURA DO SENSOR DE REFLETÂNCIA
// Atualiza valorAD e naBordaBranca, e envia pela Serial:
// "valorAD / PRETO" ou "valorAD / BRANCO"
// ======================================================
void lerSensorLinha() {
  valorAD = analogRead(SENSOR_LINHA);

  // ajuste o sinal ">" ou "<" conforme a calibração do seu sensor
  naBordaBranca = (valorAD <= LIMIAR); // BRANCO = borda do ringue

  Serial.print(valorAD);
  Serial.print(" / ");
  Serial.println(naBordaBranca ? "BRANCO" : "PRETO");
}

// ======================================================
// ANDAR PARA FRENTE COM POTÊNCIA MÁXIMA
// ======================================================
void andarFrenteMaxima() {
  analogWrite(IN1_MOTOR_ESQUERDO, PWM_MAX);
  analogWrite(IN2_MOTOR_ESQUERDO, 0);

  analogWrite(IN3_MOTOR_DIREITO, 0);
  analogWrite(IN4_MOTOR_DIREITO, PWM_MAX);
}

// ======================================================
// ANDAR PARA TRÁS (de 10 cm a 20 cm)
// ======================================================
void andarParaTras() {
  analogWrite(IN1_MOTOR_ESQUERDO, 0);
  analogWrite(IN2_MOTOR_ESQUERDO, PWM_RE);

  analogWrite(IN3_MOTOR_DIREITO, PWM_RE);
  analogWrite(IN4_MOTOR_DIREITO, 0);

  delay(TEMPO_RE);
  //pararMotores();
}

// ======================================================
// GIRAR ≈ 180°
// ======================================================
void girar180() {
  // Motor esquerdo -> frente
  analogWrite(IN1_MOTOR_ESQUERDO, PWM_GIRO);
  analogWrite(IN2_MOTOR_ESQUERDO, 0);

  // Motor direito -> ré (giro no próprio eixo)
  analogWrite(IN3_MOTOR_DIREITO, PWM_GIRO);
  analogWrite(IN4_MOTOR_DIREITO, 0);

  delay(TEMPO_GIRO);
  //pararMotores();
}



void setup() {
  Serial.begin(9600);

  pinMode(SENSOR_LINHA, INPUT);

  pinMode(IN1_MOTOR_ESQUERDO, OUTPUT);
  pinMode(IN2_MOTOR_ESQUERDO, OUTPUT);
  pinMode(IN3_MOTOR_DIREITO, OUTPUT);
  pinMode(IN4_MOTOR_DIREITO, OUTPUT);

  // Configuração Inicial: começa parado
  //pararMotores();
}

void loop() {
  // ---------- Interpretar o sinal de saída do sensor de reflectância ----------
  lerSensorLinha();

  // ---------- O robô está na borda branca? ----------
  if (naBordaBranca) {
    // SIM
    andarParaTras();
    girar180();
  } else {
    // NÃO
    andarFrenteMaxima();
  }
}

