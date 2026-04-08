export type CurtainType = "straight" | "pleated" | "roman";

export interface CartItem {
  id: string;
  width: number;
  height: number;
  foldRatio: number;
  curtainType: CurtainType;
  fabricCost: number;
  tapeCost: number;
  laborCost: number;
  total: number;
}
