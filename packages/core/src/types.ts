export type CurtainType = "straight" | "pleated" | "roman";

export interface CartItem {
  id: string;
  width: number;
  height: number;
  foldRatio: number;
  curtainType: CurtainType;
  /** Подпись вида ткани из калькулятора (опционально) */
  fabricLabel?: string;
  /** Выбранный цвет штор (опционально) */
  curtainColorLabel?: string;
  fabricCost: number;
  tapeCost: number;
  laborCost: number;
  total: number;
}
