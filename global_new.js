/**
 * global_new.js
 * ------------------------------------
 * ✅ FINAL STABLE VERSION (PC + MOBILE)
 *
 * - 기존 설계 유지
 * - Pointer 기반 통합
 * - 모바일 드래그 끊김 방지
 * - canvas 비율 안정화
 */

import { boards } from "./boards.js";
import { drawBoard, valueToX, xToValue } from "./renderBoard.js";
import { drawVerticalPointer, drawSoftPointerCard } from "./drawUtils.js";
import "./global_value.js";
import "./panel.js";
import "./core_const.js";
import "./global_function_pointer.js";
import { CompositeBoard } from "./compositeBoard.js";
import { JudgeRegistry } from "./judgeRegistry.js";
import {
  drawOverlay,
  drawJudgeResult,
  drawNextRoundHint,
  drawCurrentValue,
  drawTokenDots,
  drawGameResult,
} from "./ui_overlay.js";
import { generateTokensForCurrentBoards } from "./tokenGenerator.js";

/* =====================================================
   Canvas & Context
===================================================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =====================================================
   Canvas Resize (PC / Mobile 공통)
===================================================== */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* =====================================================
   Board Setup
===================================================== */
let y = 200;
const gap = 5;

GLOBAL.board.instance = new CompositeBoard([
  { id:"int_card", kind:"card", min:0, max:10, x:50, y:y, width:700, height:80, judgeId:"NAT_CARD"},
  y += 80 + gap,
  { id:"INT_LINE", kind:"numberline", min:0, max:10, x:50, y:y, width:700, height:80, judgeId:"NAT_LINE" },
  y += 80 + gap,
  { id:"lin_a", kind:"sub_num", min:0, max:10, x:50, y:y, width:700, height:5, judgeID:"NAT_CARD"},
]);

/* =====================================================
   Game State
===================================================== */
GLOBAL.game = {
  state: "playing",
  activeToken: null,
  result: null,
  roundFinished: false,
  tokenStates: [],
};

let activeToken = null;

/* =====================================================
   Pointer Engine Init
===================================================== */
PointerEngine.init(canvas);

/* =====================================================
   Pointer Events (통합, 모바일 안정)
===================================================== */
canvas.addEventListener(CONST.EVENT.POINTER_DOWN, (e) => {
  if (GLOBAL.game.state !== "playing") return;

  canvas.setPointerCapture(e.pointerId);
  PointerEngine.update(e);

  const x = GLOBAL.pointer.canvasX;
  const y = GLOBAL.pointer.canvasY;

  for (let i = GLOBAL.tokens.length - 1; i >= 0; i--) {
    if (GLOBAL.tokens[i].contains(x, y)) {
      activeToken = GLOBAL.tokens[i];
      GLOBAL.game.activeToken = activeToken;
      activeToken.pointerDown(x, y);
      GLOBAL.game.result = null;
      break;
    }
  }

  draw();
});

canvas.addEventListener(CONST.EVENT.POINTER_MOVE, (e) => {
  if (!activeToken) return;

  PointerEngine.update(e);
  if (!GLOBAL.pointer.insideCanvas) return;

  activeToken.pointerMove(
    GLOBAL.pointer.canvasX,
    GLOBAL.pointer.canvasY
  );

  draw();
});

canvas.addEventListener(CONST.EVENT.POINTER_UP, (e) => {
  if (!activeToken) return;

  canvas.releasePointerCapture(e.pointerId);
  PointerEngine.update(e);

  activeToken.pointerUp();

  const board = findBoardAtToken(activeToken, GLOBAL.board.instance);
  if (board) {
    const judgeFn = JudgeRegistry[board.judgeId];
    const ok = judgeFn({ token: activeToken, board });

    GLOBAL.game.result = {
      ok,
      raw: activeToken.raw,
      value: activeToken.value,
      visible: true,
    };
  }

  activeToken = null;
  GLOBAL.game.activeToken = null;

  draw();
});

canvas.addEventListener(CONST.EVENT.POINTER_CANCEL, (e) => {
  if (e.pointerId != null) {
    canvas.releasePointerCapture(e.pointerId);
  }
  activeToken = null;
});

/* =====================================================
   Draw Loop
===================================================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCurrentValue(ctx);
  drawJudgeResult(ctx, canvas);
  drawTokenDots(ctx);
  drawOverlay(ctx, canvas, { activeToken });
  drawNextRoundHint(ctx);
  drawGameResult(ctx);

  GLOBAL.board.instance.render(ctx);

  GLOBAL.tokens.forEach(token => {
    token.draw(ctx);
    token.drawBalloon(ctx);
  });
}

/* =====================================================
   Board Hit Test
===================================================== */
function findBoardAtToken(token, compositeBoard) {
  const { x, y } = token.getCenter();
  for (const board of compositeBoard.boards) {
    if (
      x >= board.x &&
      x <= board.x + board.width &&
      y >= board.y &&
      y <= board.y + board.height
    ) {
      return board;
    }
  }
  return null;
}

/* =====================================================
   Round Control
===================================================== */
function startRound(tokenCount = 5) {
  GLOBAL.game.state = "playing";
  GLOBAL.game.roundFinished = false;
  GLOBAL.game.result = null;
  GLOBAL.game.tokenStates = [];

  GLOBAL.tokens.length = 0;
  const newTokens = generateTokensForCurrentBoards(
    GLOBAL.board.instance,
    tokenCount
  );
  GLOBAL.tokens.push(...newTokens);

  draw();
}

/* =====================================================
   Init
===================================================== */
startRound();
draw();
