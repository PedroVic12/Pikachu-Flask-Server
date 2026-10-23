
// variáveis
#define trig 10
#define echo 9

void setup() {
  Serial.begin(9600);

  // Configurando os pinos digitais
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
}
void loop() {
  long duracao;
  float distancia;

  // Gerando o pulso da Onda Digital do sensor ultrasonico
  //digitalWrite(trig,LOW);
  //delayMicroseconds(2); 
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig,LOW);

  // medindo o tempo de retorno
  duracao = pulseIn(echo, HIGH); 

  // calcula a distancia em cm
  float vel_som = 0.0343;
  distancia = duracao * vel_som / 2;

  //if (distancia <= 10) {
  //  Serial.println("\n\nPERIGO!");
  //} 

  Serial.print("\nDistancia: ");
  Serial.print(distancia);
  Serial.print(" cm");
  delay(1000);
}




