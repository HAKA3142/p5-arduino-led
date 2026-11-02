// p5.js 슬라이더로 아두이노 UNO의 3번 핀 LED 밝기 조절
// 아두이노에는 arduino_led.ino를 먼저 업로드하세요.

let brightnessSlider;
let serialPort = null;
let serialWriter = null;
let sending = false;
let nextBrightness = null;

const statusElement = document.getElementById('connection-status');
const brightnessElement = document.getElementById('brightness-value');
const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');

function setup() {
  const canvas = createCanvas(440, 185);
  canvas.parent('sketch-holder');

  brightnessSlider = createSlider(0, 255, 0, 1);
  brightnessSlider.id('led-slider');
  brightnessSlider.parent('slider-holder');
  brightnessSlider.input(onSliderChange);

  connectButton.addEventListener('click', connectArduino);
  disconnectButton.addEventListener('click', disconnectArduino);

  if (!('serial' in navigator)) {
    setStatus('이 브라우저는 Web Serial을 지원하지 않습니다. Chrome 또는 Edge를 사용하세요.', 'error');
    connectButton.disabled = true;
  }
}

function draw() {
  background(16, 29, 51);
  const value = brightnessSlider.value();
  const amount = value / 255;

  noStroke();
  for (let r = 69; r >= 27; r -= 7) {
    fill(255, 194, 56, Math.round(amount * (70 - r * 0.5)));
    circle(width / 2, 76, r * 2);
  }
  fill(65, 74, 90);
  rect(width / 2 - 14, 108, 28, 26, 5);
  fill(115, 132, 154);
  rect(width / 2 - 10, 130, 7, 17, 1);
  rect(width / 2 + 3, 130, 7, 17, 1);
  fill(85 + 170 * amount, 72 + 135 * amount, 36 + 17 * amount);
  arc(width / 2, 107, 57, 98, PI, TWO_PI, CHORD);
  rect(width / 2 - 28.5, 72, 57, 38);

  fill(255, 255, 255, 150);
  textAlign(CENTER);
  textSize(12);
  text('LED PREVIEW', width / 2, 171);
}

function onSliderChange() {
  const value = brightnessSlider.value();
  brightnessElement.textContent = `${value} / 255`;
  queueBrightness(value);
}

function setStatus(message, kind = '') {
  statusElement.textContent = message;
  statusElement.className = `status ${kind}`;
}

// requestPort()는 반드시 사용자가 누른 버튼 이벤트에서 바로 호출해야 합니다.
async function connectArduino() {
  if (!navigator.serial || serialPort) return;
  connectButton.disabled = true;
  setStatus('COM 포트를 선택하세요.');
  let openedPort = null;
  try {
    const selectedPort = await navigator.serial.requestPort();
    await selectedPort.open({ baudRate: 9600 });
    openedPort = selectedPort;
    setStatus('아두이노 초기화 중...');

    // UNO는 포트를 열면 재시작될 수 있습니다.
    await new Promise(resolve => setTimeout(resolve, 1800));
    serialPort = openedPort;
    serialWriter = serialPort.writable.getWriter();
    disconnectButton.disabled = false;
    setStatus('아두이노 연결 성공! 슬라이더를 움직이세요.', 'good');
    queueBrightness(brightnessSlider.value());
  } catch (error) {
    setStatus(`연결 실패: ${error.message}`, 'error');
    connectButton.disabled = false;
    if (openedPort) {
      try { await openedPort.close(); } catch (_) {}
    }
  }
}

function queueBrightness(value) {
  nextBrightness = value;
  if (serialWriter && !sending) sendPendingBrightness();
}

// 빠른 슬라이더 입력은 마지막 값으로 합쳐서 순서대로 전송합니다.
async function sendPendingBrightness() {
  if (sending) return;
  sending = true;
  try {
    while (serialWriter && nextBrightness !== null) {
      const value = nextBrightness;
      nextBrightness = null;
      await serialWriter.write(new Uint8Array([value]));
    }
  } catch (error) {
    setStatus(`시리얼 전송 실패: ${error.message}`, 'error');
  } finally {
    sending = false;
  }
}

async function disconnectArduino() {
  disconnectButton.disabled = true;
  try {
    while (sending) await new Promise(resolve => setTimeout(resolve, 20));
    if (serialWriter) {
      await serialWriter.write(new Uint8Array([0]));
      serialWriter.releaseLock();
      serialWriter = null;
    }
    if (serialPort) {
      await serialPort.close();
      serialPort = null;
    }
    nextBrightness = null;
    setStatus('연결 해제됨. LED를 껐습니다.');
  } catch (error) {
    setStatus(`해제 실패: ${error.message}`, 'error');
  } finally {
    connectButton.disabled = false;
  }
}
