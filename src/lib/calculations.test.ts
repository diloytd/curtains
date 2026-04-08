import { describe, expect, it } from "vitest";
import { calculateCosts } from "./calculations";

const simplePrices = {
  fabricPerM2: 100,
  tapePerM: 10,
  laborPerM2: 50,
} as const;

describe("calculateCosts", () => {
  it("считает площадь и длину ленты по формуле S = W·k·H", () => {
    const widthM = 2;
    const heightM = 2.5;
    const foldRatio = 2;
    const r = calculateCosts(widthM, heightM, foldRatio, simplePrices);

    expect(r.fabricWidthM).toBe(4);
    expect(r.areaM2).toBe(10);
    expect(r.tapeLengthM).toBe(4);
  });

  it("раскладывает стоимость по позициям и суммирует итог", () => {
    const r = calculateCosts(1, 1, 2, simplePrices);
    // fabricWidth=2, area=2, tape=2
    expect(r.fabricCost).toBe(200);
    expect(r.tapeCost).toBe(20);
    expect(r.laborCost).toBe(100);
    expect(r.total).toBe(320);
  });

  it("использует переданные цены вместо значений по умолчанию", () => {
    const custom = { fabricPerM2: 1, tapePerM: 2, laborPerM2: 3 };
    const r = calculateCosts(1, 1, 1, custom);
    expect(r.fabricCost).toBe(1);
    expect(r.tapeCost).toBe(2);
    expect(r.laborCost).toBe(3);
    expect(r.total).toBe(6);
  });
});
