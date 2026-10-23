
// grupo 1

// 1) Blink - OK
// 2) Hello World

// the setup function runs once when you press reset or power the board
void setup() {

  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.begin(9600);
}

// the loop function runs over and over again forever
void loop() {

  Serial.println("Hello World!");
  delay(3000);
  digitalWrite(LED_BUILTIN, HIGH);  // turn the LED on 
  delay(100);                      
  digitalWrite(LED_BUILTIN, LOW);   // turn the LED off
  delay(100);                      
}

