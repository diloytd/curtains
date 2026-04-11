import { useEffect, useRef } from "react";
import { Box, Stack } from "@mui/material";
import type { CurtainType } from "@curtans/core";

/** При min-width 1200px — схема и эскиз в ряд; иначе столбик (планшет, мобилка). */
const HORIZONTAL_DRAWINGS_MQ = "(min-width: 1200px)";

// ── Technical schema constants ───────────────────────────────────────────────
const LOGICAL_W = 400;
const LOGICAL_H = 300;
const M_TO_PX = 50;
const CORNICE_X1 = 50;
const CORNICE_X2 = 350;
const CORNICE_Y = 40;

// ── Sketch canvas constants ───────────────────────────────────────────────────
const SKETCH_W = 400;
const SKETCH_H = 420;

/** Зазор между двумя canvas (spacing 1.5 ≈ 12px). */
const STACK_GAP_PX = 12;
/** Вертикальная стопка: суммарное отношение высоты к ширине одного canvas. */
const CANVAS_STACK_ASPECT = LOGICAL_H / LOGICAL_W + SKETCH_H / SKETCH_W;
/** Эскиз выше схемы — в ряд ограничиваем по высоте эскиза. */
const SKETCH_H_PER_W = SKETCH_H / SKETCH_W;
const MIN_DISPLAY_W = 220;
const SAFE_W_NO_LAYOUT_VERT = 420;
const SAFE_W_NO_LAYOUT_HORIZ = 380;

export interface CurtainDrawingProps {
  width: number;
  height: number;
  foldRatio: number;
  curtainType: CurtainType;
}

// ── Technical drawing helpers ────────────────────────────────────────────────
function drawTickDimensionH(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  label: string,
) {
  const tick = 6;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y - tick);
  ctx.lineTo(x1, y + tick);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y - tick);
  ctx.lineTo(x2, y + tick);
  ctx.stroke();
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, (x1 + x2) / 2, y - 4);
}

function drawTickDimensionV(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
  label: string,
) {
  const tick = 6;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - tick, y1);
  ctx.lineTo(x + tick, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - tick, y2);
  ctx.lineTo(x + tick, y2);
  ctx.stroke();
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x - 8, (y1 + y2) / 2);
}

function drawExtensionDashed(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// ── Technical schema renderer ────────────────────────────────────────────────
function draw(
  ctx: CanvasRenderingContext2D,
  widthM: number,
  heightM: number,
  foldRatio: number,
  curtainType: CurtainType,
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  const cx = LOGICAL_W / 2;
  const openingW = widthM * M_TO_PX;
  const openingH = heightM * M_TO_PX;
  const fabricW = widthM * foldRatio * M_TO_PX;
  const fabricH = (heightM + 0.2) * M_TO_PX;

  const openLeft = cx - openingW / 2;
  const openRight = cx + openingW / 2;
  const openTop = CORNICE_Y;
  const openBottom = openTop + openingH;

  const fabLeft = cx - fabricW / 2;
  const fabRight = cx + fabricW / 2;
  const fabTop = CORNICE_Y;
  const fabBottom = fabTop + fabricH;

  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.lineWidth = 1;

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(openLeft, openTop, openingW, openingH);
  ctx.restore();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(openLeft, openBottom);
  ctx.lineTo(openLeft, Math.min(openBottom + 8, LOGICAL_H - 50));
  ctx.moveTo(openRight, openBottom);
  ctx.lineTo(openRight, Math.min(openBottom + 8, LOGICAL_H - 50));
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CORNICE_X1, CORNICE_Y);
  ctx.lineTo(CORNICE_X2, CORNICE_Y);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CORNICE_X1, CORNICE_Y);
  ctx.lineTo(CORNICE_X1, CORNICE_Y + 6);
  ctx.moveTo(CORNICE_X2, CORNICE_Y);
  ctx.lineTo(CORNICE_X2, CORNICE_Y + 6);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.fillRect(fabLeft, fabTop, fabricW, fabricH);
  ctx.strokeRect(fabLeft, fabTop, fabricW, fabricH);

  if (curtainType === "pleated") {
    ctx.strokeStyle = "#000000";
    for (let x = fabLeft + 20; x < fabRight - 0.5; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, fabTop);
      ctx.lineTo(x, fabBottom);
      ctx.stroke();
    }
  }

  if (curtainType === "roman") {
    ctx.strokeStyle = "#000000";
    for (let y = fabTop + 50; y < fabBottom - 0.5; y += 50) {
      ctx.beginPath();
      ctx.moveTo(fabLeft, y);
      ctx.lineTo(fabRight, y);
      ctx.stroke();
    }
  }

  const dimY1 = Math.min(fabBottom + 22, LOGICAL_H - 38);
  drawExtensionDashed(ctx, openLeft, openBottom, openLeft, dimY1);
  drawExtensionDashed(ctx, openRight, openBottom, openRight, dimY1);
  drawTickDimensionH(ctx, openLeft, openRight, dimY1, `W = ${widthM.toFixed(2)} м`);

  const dimY2 = dimY1 + 28;
  if (dimY2 < LOGICAL_H - 12) {
    drawExtensionDashed(ctx, fabLeft, fabBottom, fabLeft, dimY2);
    drawExtensionDashed(ctx, fabRight, fabBottom, fabRight, dimY2);
    drawTickDimensionH(ctx, fabLeft, fabRight, dimY2, `W·k = ${(widthM * foldRatio).toFixed(2)} м (ткань)`);
  }

  const dimX = Math.max(8, Math.min(openLeft, fabLeft) - 28);
  drawExtensionDashed(ctx, openLeft, openTop, dimX, openTop);
  drawExtensionDashed(ctx, openLeft, openBottom, dimX, openBottom);
  drawTickDimensionV(ctx, dimX, openTop, openBottom, `H = ${heightM.toFixed(2)} м`);

  ctx.font = "10px sans-serif";
  ctx.fillStyle = "#000";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const typeRu =
    curtainType === "straight" ? "прямые" : curtainType === "pleated" ? "сборка" : "римские";
  ctx.fillText(`Вид спереди (схема), ${typeRu}`, 8, 8);
}

// ── Sketch helpers ───────────────────────────────────────────────────────────

function makeRng(seed: number): () => number {
  let s = Math.abs(Math.round(seed)) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Pencil sketch renderer ───────────────────────────────────────────────────
function drawSketch(
  ctx: CanvasRenderingContext2D,
  widthM: number,
  heightM: number,
  foldRatio: number,
  curtainType: CurtainType,
) {
  const seed =
    Math.round(widthM * 37 + heightM * 71 + foldRatio * 13) +
    (curtainType === "roman" ? 500 : curtainType === "pleated" ? 200 : 0);
  const rng = makeRng(seed);
  const j = (v: number, a = 1.0) => v + (rng() - 0.5) * a * 2;

  const INK = "#2e2b28";
  const INK_MID = "#7a7268";
  const INK_LIGHT = "#c0b8b0";
  const PAPER = "#faf8f3";
  const GLASS = "#dce9f0";
  const WALL = "#eceae2";

  const rodY = 64;
  const rodL = 50;
  const rodR = 350;
  const floorY = 390;
  const cx = SKETCH_W / 2;
  const panelH = Math.max(90, Math.min(heightM * 98, 295));
  const panelTop = rodY + 14;
  const panelBottom = panelTop + panelH;

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SKETCH_W, SKETCH_H);

  // Subtle paper grain
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = "#7a6a58";
    ctx.fillRect(rng() * SKETCH_W, rng() * SKETCH_H, rng() * 2 + 0.5, 0.5);
  }
  ctx.restore();

  // Wall tones — sides
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, rodL, SKETCH_H);
  ctx.fillRect(rodR, 0, SKETCH_W - rodR, SKETCH_H);

  // Window glass light
  const winBottom = Math.min(panelBottom + 5, floorY - 6);
  ctx.fillStyle = GLASS;
  ctx.fillRect(rodL, rodY, rodR - rodL, winBottom - rodY);

  // Subtle inner glow at window centre
  const grd = ctx.createRadialGradient(cx, rodY + panelH * 0.4, 10, cx, rodY + panelH * 0.4, (rodR - rodL) * 0.65);
  grd.addColorStop(0, "rgba(255,252,245,0.38)");
  grd.addColorStop(1, "rgba(220,233,240,0.0)");
  ctx.fillStyle = grd;
  ctx.fillRect(rodL, rodY, rodR - rodL, winBottom - rodY);

  // Wobbly-line helper
  const skL = (x1: number, y1: number, x2: number, y2: number, lw = 1, wobble = 1.0) => {
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(j(x1, wobble), j(y1, wobble));
    const mx = (x1 + x2) / 2 + (rng() - 0.5) * wobble * 3;
    const my = (y1 + y2) / 2 + (rng() - 0.5) * wobble * 2;
    ctx.quadraticCurveTo(mx, my, j(x2, wobble), j(y2, wobble));
    ctx.stroke();
  };

  // Floor line
  ctx.strokeStyle = INK_LIGHT;
  ctx.setLineDash([]);
  skL(0, floorY, SKETCH_W, floorY, 0.8, 1.5);

  // Ceiling
  skL(0, 14, SKETCH_W, 14, 0.6, 1);

  // Wall frame — vertical edges of window opening
  ctx.strokeStyle = INK_LIGHT;
  skL(rodL, 12, rodL, floorY, 0.8, 0.8);
  skL(rodR, 12, rodR, floorY, 0.8, 0.8);

  // ── Rod ─────────────────────────────────────────────────────────────────────
  ctx.strokeStyle = INK;
  ctx.setLineDash([]);
  skL(rodL - 10, rodY, rodR + 10, rodY, 2.8, 0.5);

  // Finials (filled circles)
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(j(rodL - 10, 0.5), j(rodY, 0.5), 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(j(rodR + 10, 0.5), j(rodY, 0.5), 5, 0, Math.PI * 2);
  ctx.fill();

  // Wall brackets
  const drawBracket = (bx: number) => {
    ctx.strokeStyle = INK;
    skL(bx, rodY - 16, bx, rodY, 1.8, 0.4);
    skL(bx - 6, rodY - 16, bx + 6, rodY - 16, 1.8, 0.4);
  };
  drawBracket(rodL + 28);
  drawBracket(rodR - 28);

  // ── Curtain ──────────────────────────────────────────────────────────────────
  if (curtainType === "roman") {
    // ── Roman blind ────────────────────────────────────────────────────────────
    const bL = rodL + 3;
    const bR = rodR - 3;
    const bW = bR - bL;

    // Fabric fill
    ctx.fillStyle = "rgba(237,232,222,0.93)";
    ctx.beginPath();
    ctx.moveTo(j(bL, 1.5), j(panelTop, 1));
    ctx.lineTo(j(bR, 1.5), j(panelTop, 1));
    ctx.lineTo(j(bR, 1.5), j(panelBottom, 1.5));
    ctx.lineTo(j(bL, 1.5), j(panelBottom, 1.5));
    ctx.closePath();
    ctx.fill();

    // Horizontal fold swags
    const numFolds = Math.max(2, Math.round(panelH / 75));
    const foldSpacing = panelH / numFolds;

    for (let i = 1; i < numFolds; i++) {
      const fy = panelTop + i * foldSpacing;
      const sag = 10 + rng() * 10;

      // Shadow strip above each fold line
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let hx = bL + 3; hx < bR - 2; hx += 5) {
        ctx.moveTo(j(hx, 0.5), j(fy - 18, 0.8));
        ctx.lineTo(j(hx + 3, 0.5), j(fy - 2, 0.8));
      }
      ctx.stroke();
      ctx.restore();

      // Swag arc
      ctx.strokeStyle = INK_MID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(j(bL, 1), j(fy, 1));
      ctx.quadraticCurveTo(j(cx, 1.5), j(fy + sag, 2.5), j(bR, 1), j(fy, 1));
      ctx.stroke();

      // Second softer pass
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = INK_LIGHT;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(j(bL, 1.5), j(fy, 1.5));
      ctx.quadraticCurveTo(j(cx, 2), j(fy + sag * 0.8, 3), j(bR, 1.5), j(fy, 1.5));
      ctx.stroke();
      ctx.restore();
    }

    // Rings
    const numRings = Math.round(bW / 38) + 1;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    for (let r = 0; r <= numRings; r++) {
      const rx = bL + (r / numRings) * bW;
      ctx.beginPath();
      ctx.arc(j(rx, 1), j(rodY + 3, 0.5), 3, 0, Math.PI * 2);
      ctx.stroke();
      skL(rx, rodY + 6, rx, panelTop + 2, 0.7, 0.4);
    }

    // Panel outline
    ctx.strokeStyle = INK;
    skL(bL, panelTop, bL, panelBottom, 1.4, 1);
    skL(bR, panelTop, bR, panelBottom, 1.4, 1);
    skL(bL, panelTop, bR, panelTop, 1.2, 0.8);
    // Bottom hem
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(j(bL, 1), j(panelBottom, 1));
    ctx.quadraticCurveTo(j(cx, 2), j(panelBottom + (rng() - 0.4) * 5, 2), j(bR, 1), j(panelBottom, 1));
    ctx.stroke();
  } else {
    // ── Straight / Pleated — two panels ────────────────────────────────────────
    const panelW = Math.max(82, Math.min(widthM * 44, 130));
    const gap = 6;

    const panels: Array<[number, number, boolean]> = [
      [cx - panelW - gap, cx - gap, true],
      [cx + gap, cx + panelW + gap, false],
    ];

    for (const [px1, px2, isLeft] of panels) {
      const pw = px2 - px1;
      const numFolds = Math.round(2 + foldRatio * 1.8);
      const outerBulge = isLeft ? -5 : 5;

      // Fabric fill shape
      ctx.fillStyle = "rgba(237,232,222,0.95)";
      ctx.beginPath();
      ctx.moveTo(j(px1, 1.5), j(panelTop, 1));
      ctx.lineTo(j(px2, 1.5), j(panelTop, 1));
      // Outer edge: gentle outward drape
      ctx.bezierCurveTo(
        j(px2 + outerBulge * 0.8, 2), j(panelTop + panelH * 0.3, 2),
        j(px2 + outerBulge * 1.4, 2), j(panelTop + panelH * 0.65, 2),
        j(px2, 2), j(panelBottom, 2),
      );
      ctx.lineTo(j(px1, 1.5), j(panelBottom, 1.5));
      // Inner edge: very slight inward curve
      ctx.bezierCurveTo(
        j(px1 + outerBulge * 0.3, 2), j(panelTop + panelH * 0.7, 2),
        j(px1 + outerBulge * 0.1, 2), j(panelTop + panelH * 0.35, 2),
        j(px1, 1.5), j(panelTop, 1),
      );
      ctx.closePath();
      ctx.fill();

      // Soft side shadow (inner edge darker)
      const gradX1 = isLeft ? px2 : px1;
      const gradX2 = isLeft ? px2 - 22 : px1 + 22;
      const sideGrd = ctx.createLinearGradient(gradX1, 0, gradX2, 0);
      sideGrd.addColorStop(0, "rgba(80,60,40,0.10)");
      sideGrd.addColorStop(1, "rgba(80,60,40,0.00)");
      ctx.fillStyle = sideGrd;
      ctx.fillRect(Math.min(px1, px2 - 22), panelTop, 22, panelH);

      // ── Fold lines ────────────────────────────────────────────────────────────
      for (let f = 0; f < numFolds; f++) {
        const baseX = px1 + pw * (f + 0.6) / numFolds;
        const amp = 2.5 + rng() * 4;
        const phase = rng() * Math.PI;

        // Fold crease line (sinusoidal bezier)
        ctx.strokeStyle = f % 2 === 0 ? INK_MID : INK_LIGHT;
        ctx.lineWidth = f % 2 === 0 ? 0.9 : 0.6;
        ctx.beginPath();
        ctx.moveTo(j(baseX, 0.5), j(panelTop, 0.5));
        ctx.bezierCurveTo(
          j(baseX + amp * Math.sin(phase), 1),
          j(panelTop + panelH * 0.28, 1),
          j(baseX - amp * Math.sin(phase + 1), 1),
          j(panelTop + panelH * 0.62, 1),
          j(baseX + amp * 0.4 * Math.sin(phase + 2), 1),
          j(panelBottom, 1),
        );
        ctx.stroke();

        // Hatching shadow in fold valley (every other fold)
        if (f % 2 === 0) {
          const hx1 = baseX - 1;
          const hx2 = Math.min(baseX + 14, px2 - 2);
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          for (let hy = panelTop + 6; hy < panelBottom - 6; hy += 5) {
            ctx.moveTo(j(hx1, 0.4), j(hy, 0.4));
            ctx.lineTo(j(hx2, 0.4), j(hy + 3, 0.4));
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Pleated header ────────────────────────────────────────────────────────
      if (curtainType === "pleated") {
        const pleatCount = Math.round(pw / 16);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.1;
        for (let p = 0; p < pleatCount; p++) {
          const plx = px1 + (p + 0.5) * (pw / pleatCount);
          // V-pinch shape
          ctx.beginPath();
          ctx.moveTo(j(plx - 4, 0.5), j(panelTop, 0.5));
          ctx.lineTo(j(plx, 0.5), j(panelTop + 9, 0.5));
          ctx.lineTo(j(plx + 4, 0.5), j(panelTop, 0.5));
          ctx.stroke();
        }
        // Tape header band
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = INK;
        ctx.fillRect(px1, panelTop, pw, 10);
        ctx.restore();
      }

      // ── Panel outline ─────────────────────────────────────────────────────────
      ctx.strokeStyle = INK;
      skL(px1, panelTop, px1, panelBottom, 1.4, 1);
      skL(px2, panelTop, px2, panelBottom, 1.4, 1);
      skL(px1, panelTop, px2, panelTop, 1.2, 0.8);
      // Hem — gentle wave
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(j(px1, 1), j(panelBottom, 1));
      ctx.quadraticCurveTo(
        j((px1 + px2) / 2, 2),
        j(panelBottom + (rng() - 0.35) * 6, 2),
        j(px2, 1),
        j(panelBottom, 1),
      );
      ctx.stroke();

      // ── Rings ─────────────────────────────────────────────────────────────────
      const numRings = Math.round(pw / 26) + 1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      for (let r = 0; r <= numRings; r++) {
        const rx = px1 + (r / numRings) * pw;
        ctx.beginPath();
        ctx.arc(j(rx, 0.8), j(rodY + 2, 0.4), 2.8, 0, Math.PI * 2);
        ctx.stroke();
        skL(rx, rodY + 6, rx, panelTop + 1, 0.7, 0.4);
      }
    }
  }

  // ── Dimension annotations (light, italic) ────────────────────────────────────
  ctx.setLineDash([]);
  ctx.strokeStyle = INK_LIGHT;
  ctx.fillStyle = INK_MID;
  ctx.font = "italic 10px Georgia, serif";

  // Width
  const dimY = Math.min(panelBottom + 24, floorY - 8);
  skL(rodL, panelBottom + 2, rodL, dimY, 0.5, 0.5);
  skL(rodR, panelBottom + 2, rodR, dimY, 0.5, 0.5);
  skL(rodL, dimY, rodR, dimY, 0.8, 0.5);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`W = ${widthM.toFixed(2)} м`, cx, dimY - 3);

  // Height
  const dimX = rodL - 30;
  skL(rodL - 2, rodY, dimX, rodY, 0.5, 0.5);
  skL(rodL - 2, panelBottom, dimX, panelBottom, 0.5, 0.5);
  skL(dimX, rodY, dimX, panelBottom, 0.8, 0.5);
  ctx.save();
  ctx.translate(dimX - 4, (rodY + panelBottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`H = ${heightM.toFixed(2)} м`, 0, 0);
  ctx.restore();

  // k label
  ctx.fillStyle = INK_LIGHT;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(`k = ${foldRatio.toFixed(1)}`, SKETCH_W - 8, SKETCH_H - 8);

  // Title
  ctx.font = "italic 11px Georgia, serif";
  ctx.fillStyle = INK_LIGHT;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const typeLabel =
    curtainType === "straight" ? "прямые" : curtainType === "pleated" ? "сборка" : "римские";
  ctx.fillText(`эскиз · ${typeLabel}`, 8, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CurtainDrawing({
  width,
  height,
  foldRatio,
  curtainType,
}: CurtainDrawingProps) {
  const techRef = useRef<HTMLCanvasElement>(null);
  const sketchRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const techCanvas = techRef.current;
    const sketchCanvas = sketchRef.current;
    const container = containerRef.current;
    if (!techCanvas || !sketchCanvas || !container) return;

    const paint = () => {
      const horizontal =
        typeof window.matchMedia === "function"
          ? window.matchMedia(HORIZONTAL_DRAWINGS_MQ).matches
          : false;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio ?? 1;
      const rw = Math.max(0, rect.width);
      const rh = Math.max(0, rect.height);

      let displayW: number;
      if (horizontal) {
        const maxFromWidth = Math.max(0, (rw - STACK_GAP_PX) / 2);
        const maxFromHeight = rh > 0 ? rh / SKETCH_H_PER_W : 0;
        const safeW = Math.min(maxFromWidth, SAFE_W_NO_LAYOUT_HORIZ);
        displayW = Math.floor(
          Math.max(MIN_DISPLAY_W, Math.min(maxFromWidth, maxFromHeight > 0 ? maxFromHeight : safeW)),
        );
      } else {
        const maxFromWidth = rw;
        const heightBudget = Math.max(0, rh - STACK_GAP_PX);
        const maxFromHeight = heightBudget > 0 ? heightBudget / CANVAS_STACK_ASPECT : 0;
        const safeWWhenNoHeight = Math.min(maxFromWidth, SAFE_W_NO_LAYOUT_VERT);
        displayW = Math.floor(
          Math.max(MIN_DISPLAY_W, Math.min(maxFromWidth, maxFromHeight > 0 ? maxFromHeight : safeWWhenNoHeight)),
        );
      }

      // Technical canvas
      const techDisplayH = displayW * (LOGICAL_H / LOGICAL_W);
      techCanvas.style.width = `${displayW}px`;
      techCanvas.style.height = `${techDisplayH}px`;
      techCanvas.width = Math.floor(displayW * dpr);
      techCanvas.height = Math.floor(techDisplayH * dpr);

      // Sketch canvas
      const sketchDisplayH = displayW * (SKETCH_H / SKETCH_W);
      sketchCanvas.style.width = `${displayW}px`;
      sketchCanvas.style.height = `${sketchDisplayH}px`;
      sketchCanvas.width = Math.floor(displayW * dpr);
      sketchCanvas.height = Math.floor(sketchDisplayH * dpr);

      const techCtx = techCanvas.getContext("2d");
      const sketchCtx = sketchCanvas.getContext("2d");
      if (!techCtx || !sketchCtx) return;

      const techScale = displayW / LOGICAL_W;
      techCtx.setTransform(1, 0, 0, 1, 0, 0);
      techCtx.scale(dpr * techScale, dpr * techScale);
      draw(techCtx, width, height, foldRatio, curtainType);

      const sketchScale = displayW / SKETCH_W;
      sketchCtx.setTransform(1, 0, 0, 1, 0, 0);
      sketchCtx.scale(dpr * sketchScale, dpr * sketchScale);
      drawSketch(sketchCtx, width, height, foldRatio, curtainType);
    };

    paint();

    const ro = new ResizeObserver(() => paint());
    ro.observe(container);
    window.addEventListener("resize", paint);
    let mq: MediaQueryList | null = null;
    const handleMq = () => paint();
    if (typeof window.matchMedia === "function") {
      mq = window.matchMedia(HORIZONTAL_DRAWINGS_MQ);
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handleMq);
      } else {
        mq.addListener(handleMq);
      }
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", paint);
      if (mq) {
        if (typeof mq.removeEventListener === "function") {
          mq.removeEventListener("change", handleMq);
        } else {
          mq.removeListener(handleMq);
        }
      }
    };
  }, [width, height, foldRatio, curtainType]);

  const boxSx = {
    lineHeight: 0,
    bgcolor: "#fff",
    border: "1px solid #bdbdbd",
    borderRadius: "2px",
  } as const;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        /* верх модальной колонки — под кнопкой «В корзину», не по центру пустого поля */
        justifyContent: "flex-start",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        sx={{
          width: "100%",
          maxWidth: "100%",
          minHeight: 0,
          maxHeight: "100%",
          alignItems: "center",
          justifyContent: { xs: "flex-start", lg: "center" },
        }}
      >
        <Box sx={{ ...boxSx, flexShrink: 0 }}>
          <canvas ref={techRef} aria-label="Схема шторы, вид спереди" />
        </Box>
        <Box sx={{ ...boxSx, bgcolor: "#faf8f3", border: "1px solid #d8d0c4", flexShrink: 0 }}>
          <canvas ref={sketchRef} aria-label="Карандашный эскиз шторы" />
        </Box>
      </Stack>
    </Box>
  );
}
