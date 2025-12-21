// core_function_point.js
// =======================================
// Pointer / Coordinate Engine
// window → canvas 좌표 변환 전담
// =======================================

let canvas = null;
let canvasRect = null;

// 초기화
function initPointer(targetCanvas) {
  canvas = targetCanvas;
  updateCanvasRect();
}

// rect 갱신
function updateCanvasRect() {
  if (!canvas) return;
  canvasRect = canvas.getBoundingClientRect();
}

// 포인터 좌표 갱신
function updatePointerPosition(e) {
  // =========================
  // 1. window 기준 (항상)
  // =========================
  GLOBAL.pointer.winX = e.clientX;
  GLOBAL.pointer.winY = e.clientY;

  // =========================
  // 2. canvas 기준 (조건부)
  // =========================
  if (!canvasRect) {
    GLOBAL.pointer.canvasX = null;
    GLOBAL.pointer.canvasY = null;
    GLOBAL.pointer.insideCanvas = false;
    return;
  }

  const inside =
    e.clientX >= canvasRect.left &&
    e.clientX <= canvasRect.right &&
    e.clientY >= canvasRect.top &&
    e.clientY <= canvasRect.bottom;

  GLOBAL.pointer.insideCanvas = inside;

  if (inside) {
    GLOBAL.pointer.canvasX = e.clientX - canvasRect.left;
    GLOBAL.pointer.canvasY = e.clientY - canvasRect.top;
  } else {
    GLOBAL.pointer.canvasX = null;
    GLOBAL.pointer.canvasY = null;
  }
}


// 전역 노출 (엔진 함수)
globalThis.PointerEngine = {
  init: initPointer,
  updateRect: updateCanvasRect,
  update: updatePointerPosition,
};
