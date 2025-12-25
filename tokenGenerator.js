// tokenGenerator.js
import { TokenCard } from "./token_card.js";
/////////////////////////////////
// 토큰차
///////////////////////////////////
/////////토큰 타입 결정/////////////
/////////////////////////////////////
export const TOKEN_TYPES = {
  NATURAL: "natural",    // 자연수
  RATIONAL: "rational",  // 유리수
  IRRATIONAL: "irrational", // 무리수
};
export const JUDGE_TOKEN_TYPES = {
  NAT_CARD: ["integer_nat"],
  INT_CARD: ["rational"],
  NAT_LINE: ["integer_nat"],
  //NAT_LINE: [
  //  "integer_nonneg",     // 0 포함 정수
  //  "rational_finite",    // 유한소수
  //  "rational_repeat",    // 순환소수
  //],
  INT_LINE: ["rational"],

  RATIONAL_FINITE_LINE: ["rational"],
  RATIONAL_REPEAT_LINE: ["rational"],

  IRRATIONAL_LINE: ["irrational"],

  // 혼합 보더
 /* RATIONAL_LINE: [
    "integer",
    "rational_finite",
    "rational_repeat",
  ],
  */
};
/*
export const JUDGE_TOKEN_TYPES = {
  NAT_CARD: ["integer_nat"],
  INT_CARD: ["integer"],
  NAT_LINE: [
    "integer_nonneg",     // 0 포함 정수
    "rational_finite",    // 유한소수
    "rational_repeat",    // 순환소수
  ],
  INT_LINE: ["integer"],

  RATIONAL_FINITE_LINE: ["rational_finite"],
  RATIONAL_REPEAT_LINE: ["rational_repeat"],

  IRRATIONAL_LINE: ["irrational"],

  // 혼합 보더
  RATIONAL_LINE: [
    "integer",
    "rational_finite",
    "rational_repeat",
  ],
};
*/
/* ==================================================
   타입 → 생성기 매핑  매우 중요 
================================================== */
const TOKEN_GENERATORS = {
  integer_nat: genNaturalInteger,
  rational: genRationalFraction,
  irrational: genIrrationalRoot,
};

/*
const TOKEN_GENERATORS = { 
  integer: () => genInteger(false),
  integer_nat: genNaturalInteger,
  integer_nonneg: () => genBasicFraction(true),
  rational_finite: genFiniteDecimal,
  rational_repeat: genBalancedFraction,
  irrational: genRadicalNumber, // ← 완전제곱 포함
};
*/
/* ==================================================
   현재 화면의 보더들로부터
   허용 토큰 타입 "합집합" 계산
================================================== */
function getAllowedTokenTypes(boardInstance) {
  const set = new Set();

  if (!boardInstance || !Array.isArray(boardInstance.boards)) {
    console.error("❌ Invalid boardInstance:", boardInstance);
    return [];
  }

  boardInstance.boards.forEach(board => {
    if (!board || !board.judgeId) return;

    const types = JUDGE_TOKEN_TYPES[board.judgeId];
    if (!Array.isArray(types)) return;

    types.forEach(t => set.add(t));
  });

  return [...set]; // ✅ 항상 배열
}

/*
function getAllowedTokenTypes(boardInstance) {
  const set = new Set();

  boardInstance.boards.forEach(board => {
    const types = JUDGE_TOKEN_TYPES[board.judgeId];
    if (types) {
      types.forEach(t => set.add(t));
    }
  });

  return [...set];
}
  */
/////////////////////////////////////////////////
// 토큰 메인 작
/////////////////////////////////////////////////
export function generateTokensForCurrentBoards(
  boardInstance,
  count
) {
  const allowedTypes = getAllowedTokenTypes(boardInstance);
  const tokens = [];

  if (allowedTypes.length === 0) return tokens;

  let safety = 0; // 무한루프 방지

  while (tokens.length < count && safety < 500) {
    safety++;

    const type = chooseTypeByPriority(allowedTypes, boardInstance);
    const gen = TOKEN_GENERATORS[type];
    if (!gen) continue;

    const data = gen();

    // =========================
    // ⭐ 범위 체크 (핵심)
    // =========================
    const inRange = boardInstance.boards.every(board => {
      if (typeof board.min !== "number" || typeof board.max !== "number") {
        return true; // 범위 없는 보드는 통과
      }
      return data.value >= board.min && data.value <= board.max;
    });

    if (!inRange) continue; // ❌ 범위 밖 → 버림

    // =========================
    // 통과 → 토큰 생성
    // =========================
    tokens.push(
      new TokenCard(
        740 - tokens.length * 40,
        100,
        15,
        data.raw,
        data.value
      )
    );
  }

  return tokens;
}

////////////////////////////////////////////////////
////////토큰 타입 결정/////////////
////////////////////////////////////////////////////
function chooseTypeByPriority(allowedTypes, boardInstance) {
  // 🛡 1차 방어
  if (!Array.isArray(allowedTypes) || !boardInstance?.boards) {
    return null;
  }

  // 🛡 judgeId 있는 보더만 필터
  const judgeBoards = boardInstance.boards.filter(
    b => typeof b?.judgeId === "string"
  );

  const hasIrrationalBoard = judgeBoards.some(
    b => b.judgeId === "IRRATIONAL_LINE"
  );

  if (hasIrrationalBoard && allowedTypes.includes("irrational")) {
    return "irrational";
  }

  const hasRationalBoard = judgeBoards.some(
    b =>
      b.judgeId === "INT_LINE" ||
      b.judgeId.includes("RATIONAL")
  );

  if (hasRationalBoard && allowedTypes.includes("rational")) {
    return "rational";
  }

  if (allowedTypes.includes("integer_nat")) {
    return "integer_nat";
  }

  return randChoice(allowedTypes);
}



///////////////////////////////////////////////////////
/* ==================================================
   유틸
================================================== */
function genNaturalInteger() {
  const n = Math.floor(Math.random() * 9) + 1; // 1~9
  return {
    raw: String(n),
    value: n,
  };
}
///////유리수 분수
function genRationalFraction() {
  // 정수 부분을 넓게
  const integerPart = randInt(0, 9);   // 0~9
  const decimalPart = randInt(0, 9);   // 소수 한 자리

  const numerator = integerPart * 10 + decimalPart;
  const denominator = 10;

  return {
    raw: `${numerator}/${denominator}`,
    value: numerator / denominator,
    fraction: { numerator, denominator },
  };
}

/// end 유리수 분수 

function genIrrationalRoot() {
  const base = Math.floor(Math.random() * 8) + 2; // 2~9
  return {
    raw: `√${base}`,
    value: Math.sqrt(base),
  };
}




/////////////////////////////////////////////////////////
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 자연수 / 정수
function genInteger(natural = false) {
  let v;
  do {
    v = natural ? randInt(0, 10) : randInt(-10, 10);
  } while (v === 0 && Math.random() < 0.4); // 0 과다 방지

  return {
    raw: String(v),
    value: v,
  };
}

// 유한소수 (분수 형태, 값 < 10)
function genFiniteDecimal() {
  let num, den, v;

  do {
    den = randInt(2, 99);
    num = randInt(1, den - 1);
    v = num / den;
  } while (
    v >= 10 ||
    Number.isInteger(v)
  );

  return {
    raw: `${num}/${den}`,
    value: v,
  };
}

// 순환소수 (1차 고정)
function genRepeatingDecimal() {
  const digit = randChoice(["3", "6", "9"]);

  return {
    raw: `0.(${digit})`,
    value: Number(`0.${digit.repeat(6)}`),
  };
}

// 무리수
// √n, |n| < 100, 음수 포함, 완전제곱 제외
function genRadicalNumber() {
  const n = randInt(1, 99);          // 근호 안은 항상 자연수
  const sign = Math.random() < 0.5 ? -1 : 1;

  const sqrt = Math.sqrt(n);
  const value = sign * sqrt;
  
  return {
    raw: sign < 0 ? `-√${n}` : `√${n}`,
    value: value,                    // 항상 finite
    isPerfectSquare: Number.isInteger(sqrt), // ⭐ 핵심 정보
  };
}









//////정수에서 자연수만 
/*
function genNaturalInteger() {
  return genInteger(true);
}*/
///// 분수의 자동범위로 분수 만들기 
function genBalancedFraction() {
  let num, den, v;

  // 분모 범위 선택
  if (Math.random() < 0.5) {
    // 작은 분모 (1~10)
    den = randInt(1, 10);
    num = randInt(1, 20);
  } else {
    // 큰 분모 (10~100)
    den = randInt(10, 100);
    num = randInt(100, 1000);
  }

  v = num / den;

  return {
    raw: `${num}/${den}`,
    value: v,
  };
}
function genFractionByHundred() {
  const a = randInt(1, 10);    // 정수 부분
  const b = randInt(0, 100);   // 소수 부분 (0~100)

  // 분자 / 분모 (100으로 나눈 분수)
  let num = a * 100 + b;
  let den = 100;

  // 기약분수 만들기
  const g = gcd(num, den);
  num /= g;
  den /= g;

  return {
    raw: `${num}/${den}`,   // 항상 분수
    value: num / den,       // 판정용 실수
  };
}
function genBasicFraction() {
  let num = randInt(1, 100); // 분자
  let den = randInt(1, 10);  // 분모

  // 기약분수
  const g = gcd(num, den);
  num /= g;
  den /= g;

  return {
    raw: `${num}/${den}`,
    value: num / den,
  };
}
function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}







