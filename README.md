# p5.js 슬라이더를 이용한 Arduino UNO LED 밝기 조절

## 프로젝트 소개
p5.js로 만든 웹 슬라이더의 값을 USB 시리얼 통신으로 Arduino UNO에 전달하여 LED의 밝기를 조절하는 프로젝트입니다.

- **슬라이더 값:** 0~255
- **LED 제어 핀:** D3 (~3, PWM)
- **통신:** Web Serial API, 9600 baud
- **준비물:** Arduino UNO, LED, 220~330Ω 저항, USB 데이터 케이블

## 배선
`Arduino D3(~3) → 220~330Ω 저항 → LED(+)`  
`LED(-) → Arduino GND`

일반 LED는 반드시 전류 제한 저항을 사용해야 합니다.

## 실행 방법
1. Arduino IDE에서 `arduino_led.ino`를 UNO에 업로드합니다.
2. Arduino IDE의 **시리얼 모니터 및 시리얼 플로터를 닫습니다.** USB는 연결한 상태로 둡니다.
3. GitHub Pages 웹페이지를 **PC Chrome 또는 Edge**에서 엽니다.
4. **아두이노 연결**을 누르고 UNO의 COM 포트를 선택합니다.
5. 슬라이더를 조작해 LED 밝기를 0~255 범위로 변경합니다.

## 원리
p5.js의 `createSlider(0, 255, 0, 1)`가 밝기 값을 생성합니다. 브라우저의 Web Serial API가 이 값을 1바이트로 Arduino에 전송하면, UNO가 `Serial.read()`로 읽고 `analogWrite(3, brightness)`로 PWM 듀티비를 조절합니다.

## 파일 구성
- `index.html` — 페이지 구조
- `style.css` — 화면 스타일
- `sketch.js` — p5.js 슬라이더, LED 미리보기, 시리얼 통신
- `arduino_led.ino` — Arduino UNO용 제어 코드

## 주의 사항
- Web Serial은 지원 브라우저와 HTTPS 환경이 필요합니다. GitHub Pages는 HTTPS로 게시할 수 있습니다.
- Arduino가 연결되지 않아도 웹페이지의 LED 미리보기는 작동합니다. **실제 LED 제어는 연결된 PC에서만 가능합니다.**
- 브라우저에서 시리얼 포트를 여는 동안 Arduino IDE의 시리얼 모니터를 사용하지 마세요.

## 시연 자료
실제 LED의 밝기가 변하는 모습을 촬영한 사진이나 영상을 추가하면 프로젝트를 검증하기 좋습니다.
