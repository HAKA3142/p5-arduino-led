// Arduino UNO D3 PWM LED 밝기 조절 (9600 baud)
// D3 → 220~330Ω 저항 → LED(+) / LED(-) → GND
const int ledPin = 3;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  analogWrite(ledPin, 0);
}

void loop() {
  if (Serial.available() > 0) {
    int brightness = Serial.read(); // 한 바이트: 0~255
    analogWrite(ledPin, brightness);
  }
}
