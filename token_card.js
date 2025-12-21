// token_card.js
// ----------------------------------------------------
// TokenCard
// - 판 위에서 움직이는 기준점(토큰 카드)
// - 정사각형 크기 고정
// - 판정 로직 ❌
// - 계산 ❌
// - 풍선은 raw 수식만 표시 (드래그 중에만)
// ----------------------------------------------------

export class TokenCard {
  constructor(x, y, size = 5, raw = "1") {
    // 위치 (surface 좌표, 좌상단 기준)
    this.x = x;
    this.y = y;

    // 크기 (정사각형)
    this.size = size;

    // 토큰이 들고 있는 수식/값 (그대로 표현)
    this.raw = raw;
    this.value = parseValue(raw)

    // 드래그 상태
    this.dragging = false;

    // 드래그 시 오프셋 (미끄러짐 방지)
    this.offsetX = 0;
    this.offsetY = 0;

    // 풍선 표시 여부 (드래그 중에만 true)
    this.showBalloon = false;
  }

  // --------------------------------------------------
  // 히트 테스트 : 이 토큰을 집을 수 있는가
  // --------------------------------------------------
  contains(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.size &&
      py >= this.y &&
      py <= this.y + this.size
    );
  }

  // --------------------------------------------------
  // 포인터 다운
  // --------------------------------------------------
  pointerDown(px, py) {
    if (!this.contains(px, py)) return false;

    this.dragging = true;
    this.showBalloon = true;

    this.offsetX = px - this.x;
    this.offsetY = py - this.y;

    return true; // 이 토큰이 잡혔음을 알림
  }

  // --------------------------------------------------
  // 포인터 이동
  // --------------------------------------------------
  pointerMove(px, py) {
    if (!this.dragging) return;

    this.x = px - this.offsetX;
    this.y = py - this.offsetY;
  }

  // --------------------------------------------------
  // 포인터 업
  // --------------------------------------------------
  pointerUp() {
    this.dragging = false;
    this.showBalloon = false;
  }

  // --------------------------------------------------
  // 토큰 카드 그리기 (판정 기준 네모)
  // --------------------------------------------------
  draw(ctx) {
    const r = this.size / 2;
    const cx = this.x + r;
    const cy = this.y + r;

    ctx.fillStyle = "#333"; // 진한 점
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    }

  // --------------------------------------------------
  // 풍선 그리기
  // - 계산 ❌
  // - raw 수식 그대로만 표시
  // - 드래그 중에만 표시
  // --------------------------------------------------
  drawBalloon(ctx) {
    this.drawCloudBalloon(ctx);
   /* if (!this.showBalloon) return;

    const text = this.raw; // ⭐ 그대로 표현

    ctx.font = "14px Arial";
    const padding = 10;
    const textWidth = ctx.measureText(text).width;

    const bw = textWidth + padding * 2;
    const bh = 32;

    // 카드 중심 위에 배치
    const cx = this.x + this.size / 2;
    const bx = cx - bw / 2;
    const by = this.y - bh - 8;

    // 풍선 박스
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // 텍스트
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, bx + bw / 2, by + bh / 2);
  */
  }
    drawCloudBalloon(ctx) {
  if (!this.showBalloon) return;

  const text = this.raw;

  // ===== 텍스트 설정 =====
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const paddingX = 28;
  const paddingY = 22;
  const textWidth = ctx.measureText(text).width;

  const bw = textWidth + paddingX * 2;
  const bh = 56;

  // ===== 위치 (토큰 위쪽 크게) =====
  const cx = this.x + this.size / 2;
  const bx = cx - bw / 2;
  const by = this.y - bh - 24;

  // ===== 구름 본체 =====
  drawCloudShape(ctx, bx, by, bw, bh);

  // ===== 텍스트 =====
  ctx.fillStyle = "#333";
  ctx.fillText(text, cx, by + bh / 2);
}

  // --------------------------------------------------
  // 토큰 중심점 (다음 단계 판정용)
  // --------------------------------------------------
  getCenter() {
    return {
      x: this.x + this.size / 2,
      y: this.y + this.size / 2,
    };
  }
  getRect(){
    return{
      x: this.x,
      y: this.y,
      width: this.size,
      height: this.size,
    }
  }
  

}
function parseValue(raw) {
    if (typeof raw !== "string") return NaN;

    // 분수 "a/b"
    if (raw.includes("/")) {
    const [a, b] = raw.split("/").map(Number);
      if (!isNaN(a) && !isNaN(b) && b !== 0) {
        return a / b;
      }
    }

    // 순환소수 "0.(3)" → 근사
    if (raw.includes("(")) {
      return parseRepeatingDecimal(raw);
    }

    // 제곱근
    if (raw.includes("√")) {
      const n = Number(raw.replace("√", ""));
      return Math.sqrt(n);
    }

    // π
    if (raw === "π" || raw === "pi") {
      return Math.PI;
    }

    // 일반 숫자
    const v = Number(raw);
    return isNaN(v) ? NaN : v;
  }
  //==================================//
////////////토큰 모양 만들기 //////////
//구름모양///
//==================================//

//구름모양 핵심함수
function drawCloudShape(ctx, x, y, w, h) {
  ctx.save();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;

  ctx.beginPath();

  // 아래쪽
  ctx.arc(x + w * 0.25, y + h * 0.6, h * 0.35, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(x + w * 0.45, y + h * 0.3, h * 0.45, Math.PI, Math.PI * 2);
  ctx.arc(x + w * 0.65, y + h * 0.3, h * 0.4, Math.PI, Math.PI * 2);
  ctx.arc(x + w * 0.8,  y + h * 0.55, h * 0.35, Math.PI * 1.5, Math.PI * 0.5);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ===== 꼬리 (부드러운 삼각형) =====
  const tailX = x + w / 2;
  const tailY = y + h;

  ctx.beginPath();
  ctx.moveTo(tailX - 10, tailY);
  ctx.quadraticCurveTo(tailX, tailY + 14, tailX + 10, tailY);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
function parseRepeatingDecimal(str) {
  // 예: "1.2(45)", "0.(3)"
  const match = str.match(/^(\d*)(?:\.(\d*))?\((\d+)\)$/);
  if (!match) return NaN;

  const intPart = match[1] || "0";
  const nonRepeat = match[2] || "";
  const repeat = match[3];

  const a = Number(intPart + nonRepeat);
  const b = Number(intPart + nonRepeat + repeat);
  const n = nonRepeat.length;
  const r = repeat.length;

  return (b - a) / (10 ** n * (10 ** r - 1));
}
