import { PRICES } from "./constants";

export interface CostBreakdown {
  areaM2: number;
  fabricWidthM: number;
  tapeLengthM: number;
  fabricCost: number;
  tapeCost: number;
  laborCost: number;
  total: number;
}

/** S = W·k·H; стоимости по requirements.md */
export function calculateCosts(
  widthM: number,
  heightM: number,
  foldRatio: number,
  prices: { fabricPerM2: number; tapePerM: number; laborPerM2: number } = PRICES,
): CostBreakdown {
  const fabricWidthM = widthM * foldRatio;
  const areaM2 = fabricWidthM * heightM;
  const tapeLengthM = fabricWidthM;

  const fabricCost = areaM2 * prices.fabricPerM2;
  const tapeCost = tapeLengthM * prices.tapePerM;
  const laborCost = areaM2 * prices.laborPerM2;

  return {
    areaM2,
    fabricWidthM,
    tapeLengthM,
    fabricCost,
    tapeCost,
    laborCost,
    total: fabricCost + tapeCost + laborCost,
  };
}
