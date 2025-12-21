import { xToValue } from "./renderBoard.js";

export const JudgeRegistry = {
  // =====================
  // 카드판
  // =====================
  NAT_CARD: (args) => {
    if (args.token.value < 0) return false;
    return judgeIntegerCard(args);
  },

  INT_CARD: (args) => {
    return judgeIntegerCard(args);
  },

  // =====================
  // 수직선 (공통)
  // =====================
  NAT_LINE: judgeInteger_line,
  INT_LINE: judgeInteger_line,
  RATIONAL_LINE: judgeInteger_line,  //유리수 전체

  // =====================
  // 수직선 - 성질별 필터
  // =====================
  RATIONAL_FINITE_LINE: (args) => { //유한소수
    if (!isFiniteDecimal(args.token)) return false;
    return judgeInteger_line(args);
  },

  RATIONAL_REPEAT_LINE: (args) => { //무한소수
    if (!isRepeatingDecimal(args.token)) return false;
    return judgeInteger_line(args);
  },

  IRRATIONAL_LINE: (args) => { //무리수
    if (!isIrrational(args.token)) return false;
    return judgeInteger_line(args);
  },
};

// =====================
// 카드판 공통
// =====================
function judgeIntegerCard({ token, board }) {
  if (!Number.isFinite(token.value)) return false;
  if (!Number.isInteger(token.value)) return false;
  const value = token.value; // ⭐ 추가
  if (value < board.min || value > board.max) return false;
  const tokenRect = token.getRect();
  const cellRect = getCellRect(value, board);
  // 🔍 핵심 디버그 (여기!)
  console.log("INT CARD DEBUG", {
    tokenValue: value,
    boardId: board.id,
    boardMin: board.min,
    boardMax: board.max,
    tokenRect,
    cellRect,
    fullyInside: rectFullyInside(tokenRect, cellRect),
  });




  return rectFullyInside(tokenRect, cellRect);
}

////////////카드 셀 카운드 카들셀은 width/(max-min+1)
function getCellRect(value, board) {
  const cellCount = board.max - board.min + 1;
  const cellWidth = board.width / cellCount;
  const index = value - board.min;

  return {
    x: board.x + index * cellWidth,
    y: board.y,
    width: cellWidth,
    height: board.height,
  };
}
// =====================
// 라인판  공통
// =====================
function judgeInteger_line({ token, board }) {
  const value = token.value;// 토큰값가져옴
  if (!Number.isFinite(token.value)) return false;
  const tokenRect = token.getRect();//토큰크기
  // 2️⃣ 가로선 접촉 판정 (⭐ 핵심)
  const onLine = touchesNumberLine(tokenRect, board);
  if (!onLine) return false;
  const int_value = Math.floor(token.value);//정수부분
  const cellRect = getCellRect_line(int_value, board);//셀에서의 위치값
  // 🔍 핵심 디버그 (여기!)
  console.log("INT__ Line DEBUG", {
    tokenValue_line: value,
    boardId_line: board.id,
    boardMin_line: board.min,
    boardMax_line: board.max,
    fullyInside_line: rectFullyInside_line(tokenRect, cellRect),
  });
  return rectFullyInside_line(tokenRect, cellRect);
}
/////수직선셀 은 앞뒤로 반칸을 빼야 한다 
function getCellRect_line(value, board){ //(토큰정수만,보드)
  const cellCount = (board.max - board.min+1)*2;
  const cellWidth = board.width / cellCount;//한셀의 길이
  //const int_value = Math.trunc(value);
  const index_num = value - board.min;//보더의 위치

  const input_x = board.x + cellWidth + cellWidth * 2*index_num;
  const out_x = input_x + 2*cellWidth;
  console.log("ttttttt",{
    x: input_x,
    out_x : out_x,
    y: board.y,
    width: cellWidth,
    height: board.height,
  }); 
  return{
    x: input_x,
    y: board.y,
    width: 2*cellWidth,
    height: board.height,
  } 
}
////////////////////////////////////
function rectFullyInside_line(inner, outer) {
  return (
    inner.x > outer.x &&
    inner.y > outer.y &&
    inner.x + inner.width < outer.x + outer.width &&
    inner.y + inner.height < outer.y + outer.height
  );
}

function rectFullyInside(inner, outer) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

// =====================
// 수직선 판정 (최종본)
// =====================
function judgeNumberLineNonInteger({ token, board }) {
  // 1️⃣ 값 유효성
  if (!Number.isFinite(token.value)) return false;
  if (Number.isInteger(token.value)) return false;

  const rect = token.getRect();

  // 2️⃣ 가로선 접촉
  const onLine = touchesNumberLine(rect, board);

  // 3️⃣ 토큰 중심 → 값
  const centerX = rect.x + rect.width / 2;
  const v = xToValue(centerX, board);

  // 4️⃣ 정수부 비교
  const tokenInt = Math.floor(token.value);
  const posInt = Math.floor(v);

  const result =
    onLine &&
    v >= board.min &&
    v <= board.max &&
    !Number.isInteger(v) &&
    tokenInt === posInt;

  // =========================
  // 🔍 DEBUG LOG
  // =========================
  console.log(
    `[JUDGE:LINE] ${board.id}`,
    {
      tokenValue: token.value,
      tokenInt,
      positionValue: v,
      positionInt: posInt,
      onLine,
      boardMin: board.min,
      boardMax: board.max,
      result,
    }
  );

  return result;
}


// =====================
// 가로선 접촉 판정
// =====================
function touchesNumberLine(tokenRect, board) {
  const lineY = board.y + board.height / 2;
  return (
    tokenRect.y <= lineY &&
    tokenRect.y + tokenRect.height >= lineY
  );
}
/////////////////////////////
////////슬롯계산 함수
/*function rectToSlotRange(rect, board) {
  const slotWidth = board.width / ((board.max - board.min) * 2);
  const leftSlot  = Math.floor((rect.x - board.x) / slotWidth);
  const rightSlot = Math.floor((rect.x + rect.width - board.x) / slotWidth);
  return { leftSlot, rightSlot };
}
*/
//////////////수 조건 확인함수 집합///////
function isRepeatingDecimal(token) {
  if (!token.raw) return false;
  return token.raw.includes("(") && token.raw.includes(")");
}

function isFiniteDecimal(token) {
  if (!token.raw) return false;
  return !token.raw.includes("(");
}

function isIrrational(token) {
  if (!token.raw) return false;
  return ["√", "pi", "π", "e"].some(sym =>
    token.raw.includes(sym)
  );
}
