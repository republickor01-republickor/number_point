/**
 * global_new.js
 * ------------------------------------
 * 🔧 GLOBAL CORE UTILITIES
 *
 * - 전역 설정
 * - 공용 좌표 시스템
 * - 디버그 패널
 *
 * ⚠️ 규칙
 * - 도메인 로직 없음
 * - 수판 전용 로직 없음
 */

import { boards } from "./boards.js";
import { drawBoard, valueToX, xToValue } from "./renderBoard.js";
import { drawVerticalPointer } from "./drawUtils.js";
//import { drawSoftPointerCard } from "./drawUtils.js";
import {drawSoftPointerCard} from "./drawUtils.js";
import "./global_value.js";
import "./panel.js";
import "./core_const.js";
import "./global_function_pointer.js"
import { CompositeBoard } from "./compositeBoard.js";
//import { TokenCard } from "./token_card.js";
import { JudgeRegistry } from "./judgeRegistry.js";
import {
  drawOverlay,
  drawJudgeResult,
  drawNextRoundHint,
  drawCurrentValue,
  drawTokenDots,
} from "./ui_overlay.js";
import {
  generateTokensForCurrentBoards
} from "./tokenGenerator.js";
import { drawGameResult } from "./ui_overlay.js";
const LOG = false;
const log = (...args) => LOG && console.log(...args);



const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");
//////////////////////////////////////////
//GLOBAL.board.instance = new CompositeBoard(boards)
///////////////////////////////////////
//
const nextRoundBtn = document.getElementById("judgeBtn");
nextRoundBtn.addEventListener("click",()=>{
  console.log("✅ NEXT ROUND BUTTON CLICKED");
  startRound();
})
let y = 300;
const gap = 5;
GLOBAL.board.instance = new CompositeBoard([
 // { id:"nat_card", kind:"card", min:0, max:10, x:50, y:y, width:700, height:80, judgeId:"NAT_CARD"},
//  y += 80 + gap,

///  { id:"NAT_LINE", kind:"numberline", min:0, max:10, x:50, y:y, width:700, height:80, judgeId:"NAT_LINE"},
//  y += 80 + gap,

  { id:"int_card", kind:"card", min:0, max:10, x:50, y:y, width:700, height:80, judgeId:"NAT_CARD"},
  y += 80 + gap,

  { id:"INT_LINE", kind:"numberline", min:0, max:10, x:50, y:y, width:700, height:80, judgeId:"NAT_LINE" },
  y += 80 + gap,
  { id:"lin_a", kind:"sub_num", min:0, max:10, x:50, y:y, width:700, height:5, judgeID:"NAT_CARD"},
 /* y += 10,
 // { id:"int_line_2", kind:"numberline", min:-10, max:10, x:50, y:y, width:700, height:80, judgeId:"RATIONAL_REPEAT_LINE" },
  y += 80 + gap,
  { id:"lin_a2", kind:"card", min:-10, max:10, x:50, y:y, width:700, height:5, judgeID:"INT_CARD"},
  y += 10,
  { id:"RATIONAL_LINE", kind:"numberline", min:-10, max:10, x:50, y:y, width:700, height:80, judgeId:"IRRATIONAL_LINE"},
  y += 80 + gap,
  { id:"lin_a3", kind:"card", min:-10, max:10, x:50, y:y, width:700, height:5, judgeID:"INT_CARD"},
  */
]);
/////////////////////////////////
///////////////////////
///// 연습용 토큰 생성 ///
///////////////////////////


/*export const tokens = [];

tokens.push(new TokenCard(740, 100, 15, "2"));
tokens.push(new TokenCard(700, 100, 15, "0.25"));
tokens.push(new TokenCard(660, 100, 15, "0.(3)"));
tokens.push(new TokenCard(620, 100, 15, "√2"));
tokens.push(new TokenCard(580, 100, 15, "π"));
*/
////////////----------------------
/// 토큰 관리 초기화
let activeToken = null
GLOBAL.game = {
  activeToken: null,
  result: null,
  tries: 0,
  maxTries: 5,
};
GLOBAL.game.tokenStates = [];
//== 판수 초기화
// global_value.js (GLOBAL 안)



//const tokens =[
//  new TokenCard(120, 80, 15, "-7/2"),//
//]

//-------------------
///끝 end 연습용토큰생성
//---------------------

PointerEngine.init(canvas);
//GLOBAL.canvas = canvas;
GLOBAL.window = {
  windth: window.innerWidth,
  height: window.innerHeight
}
let debugPanelCreated = false;  //디버그 판넬 확인

 // ----------------------------
// 좌표 변환
// ----------------------------


// ----------------------------
// 마우스로 수 이동
// ----------------------------
canvas.addEventListener(CONST.EVENT.POINTER_MOVE, (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (!activeToken) return;
  activeToken.pointerMove(e.offsetX, e.offsetY);
  draw();
  });
  // PointerEngine.update(e);

 // let v = Math.round(xToValue(GLOBAL.pointer.canvasX, boards[0]));
 // v = Math.max(boards[0].min, Math.min(boards[0].max, v));
 // State.currentValue = v;



// ----------------------------
// 그리기
// ----------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 //메인화면 꾸미기
 // drawBoards();
  //drawTokens();

  //drawScoreBoard(ctx);
  drawCurrentValue(ctx);
  drawJudgeResult(ctx, canvas);
  drawTokenDots(ctx);
  drawOverlay(ctx, canvas, { activeToken });
  drawNextRoundHint(ctx);
  drawGameResult(ctx);

 
  /* 보더그림 부분을 아래로 넘김 */
  GLOBAL.board.instance.render(ctx);
 // 토큰 카드를 불러온다 아래에서
 // 움직이는 카드 그리기
  GLOBAL.tokens.forEach(token=>{
  token.draw(ctx);
  token.drawBalloon(ctx);
  });
 // 5️⃣ 디버그용 보드 강조
  const hitBoardId = GLOBAL.debug.hitBoard;
  let board = null;
  if (hitBoardId) {
    board = GLOBAL.board.instance.boards.find(
      b => b.id === hitBoardId
      );
  }
  
  if (board) {
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      board.x,
      board.y,
      board.width,
      board.height
    );
    ctx.restore();
  }

}
////////////
// 윈도우즈 이벤트 함수 모음
/////////////
//-- 휠업다운
canvas.addEventListener(CONST.EVENT.WHEEL, (e) => {
  if (e.deltaY < 0) {
    onInput(CONST.INPUT.SCROLL_UP, e);
  } else {
    onInput(CONST.INPUT.SCROLL_DOWN, e);
  }
});
//---


//-----------end 이벤트함수
//=======================
//--------------- 
// 최초 1회
startRound();
//createDebugPanel();
draw();
//=======================
////////////////////////////
///////////////////////////

window.addEventListener(CONST.EVENT.RESIZE,()=>{
  PointerEngine.updateRect();
});
window.addEventListener(CONST.EVENT.POINTER_MOVE, (e) => {
  if (GLOBAL.game.state !== "playing") return;
  PointerEngine.update(e);
  //updateDebugPanel();
},
true
);
////////// 마우스 다운
canvas.addEventListener(CONST.EVENT.POINTER_DOWN, (e) => {
  if (GLOBAL.game.state !== "playing") return;
  const x = e.offsetX;
  const y = e.offsetY;
  for (let i = GLOBAL.tokens.length - 1; i >= 0; i--) {
    if (GLOBAL.tokens[i].contains(x, y)) {
      activeToken = GLOBAL.tokens[i];
      activeToken.pointerDown(x, y);
      // ⭐⭐⭐ 핵심 추가
      GLOBAL.game.activeToken = activeToken;
       // ⭐ 상태 변경
      if (GLOBAL.game.tokenStates[i] !== "correct") {
        GLOBAL.game.tokenStates[i] = "dragging";
      }
      GLOBAL.game.result = null;   // ← 이전 정답/오답 제거
      break;
      }
    }
  if (GLOBAL.game.roundFinished) {
    console.log("▶ NEXT ROUND");
    startRound();
  };
  console.log("tokenStates:", GLOBAL.game.tokenStates);
  console.log("roundFinished:", GLOBAL.game.roundFinished);

  //tokens.forEach(token => {
  //  token.pointerDown(x, y);
  draw();
});
///마우스 업
canvas.addEventListener(CONST.EVENT.POINTER_UP, () => {
  if (GLOBAL.game.state !== "playing") return;
  if (!activeToken) return;

  

  // 1️⃣ 토큰 놓기
  activeToken.pointerUp();
  const tokenIndex = GLOBAL.tokens.indexOf(activeToken);

  // 2️⃣ 보드 찾기
  const board = findBoardAtToken(activeToken, GLOBAL.board.instance);
  if (!board) {
    activeToken = null;
    draw();
    return;
  }

  // 3️⃣ 판정
  const judgeFn = JudgeRegistry[board.judgeId];
  const ok = judgeFn({
    token: activeToken,
    board,
  });




  // ⭐ 토큰 값 백업 (중요)
  const tokenRaw = activeToken.raw;
  const tokenValue = activeToken.value;

  // 4️⃣ 토큰 상태 기록 (단 한 번만)
  GLOBAL.game.tokenStates[tokenIndex] = ok ? "correct" : "wrong";

  // 5️⃣ 결과 UI용 저장
  GLOBAL.game.result = {
    ok,
    value: tokenValue,
    raw: tokenRaw,
    visible: true,
  };

  // 6️⃣ 모든 토큰이 맞았는지 검사 (⭐⭐ 핵심)
  const allCorrect = GLOBAL.game.tokenStates.every(
    s => s === "correct"
  );

  if (allCorrect) {
    console.log("✅ ROUND FINISHED");
    GLOBAL.game.roundFinished = true;
  };

  // 7️⃣ 디버그 기록 (activeToken 사용 ❌)
  GLOBAL.debug.boardResults[board.id] = {
    raw: tokenRaw,
    value: tokenValue,
    ok,
  };

  // 8️⃣ 토큰 해제
  activeToken = null;

  draw();
});


///////////////////////////////////
////// Token_card 의 위치판단 /////
function findBoardAtToken(token, compositeBoard) {
  const { x, y } = token.getCenter();
  let hitBoard = null;
  for (const board of compositeBoard.boards) {
    if (
      x >= board.x &&
      x <= board.x + board.width &&
      y >= board.y &&
      y <= board.y + board.height
    ) {
      hitBoard = board; 
      break;  // 👉 이 보더 위에 있음
    }
  }
  GLOBAL.debug.hitBoard = hitBoard ? hitBoard.id : null;
  return hitBoard; // 👉 어느 보더에도 없음
}

/*window.addEventListener(
  CONST.EVENT.POINTER_MOVE,
  e => {
    PointerEngine.update(e);
  },
  true   // ⭐ capture 단계
);

*/
function startRound(tokenCount = 5) {
  GLOBAL.session.round++;
  GLOBAL.game.state = "playing";
  console.log("startRound");
  nextRoundBtn.style.display = "none";
  // 🔴 판 단위 상태 초기화
  GLOBAL.game.roundFinished = false;
  //GLOBAL.game.tries = 0;
  GLOBAL.game.correctCount = 0;
  GLOBAL.game.result = null;
  // ⭐ 토큰 상태 초기화 (이게 핵심)
  GLOBAL.game.tokenStates = [];

// ⭐ 토큰 재생성
  GLOBAL.tokens.length = 0;
  const newTokens = generateTokensForCurrentBoards(
    GLOBAL.board.instance,
    tokenCount
  );
  GLOBAL.tokens.push(...newTokens);

  // ⭐ 이번 판 토큰 수 기록
  GLOBAL.game.tokenCount = newTokens.length;
// ⭐ 토큰 상태 초기화 (핵심)
  // = 
  GLOBAL.game.tokenCount = newTokens.length;
  GLOBAL.game.tokenStates = new Array(newTokens.length).fill("idle");
  // = GLOBAL.game.tokenStates = newTokens.map(() => "idle");
  draw();
}

function finishRound() {
  const tries = GLOBAL.game.tries;
  const score = GLOBAL.game.correctCount;
  GLOBAL.game.state = "round_finished";
  // ⭐ 완료 버튼 표시
  nextRoundBtn.style.display = "inline-block";
  GLOBAL.session.round++;
  GLOBAL.session.totalTries += tries;
  GLOBAL.session.roundTries.push(tries);
  GLOBAL.session.roundScores.push(score);
  draw();
}

function finishGame() {
  GLOBAL.game.finished = true;
  draw();
}
function getAverageTries() {
  const arr = GLOBAL.session.roundTries;
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return (sum / arr.length).toFixed(2);
}


