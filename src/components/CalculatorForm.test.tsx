import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PRICES } from "../lib/constants";
import { renderWithTheme } from "../test/renderWithTheme";
import { CalculatorForm } from "./CalculatorForm";

describe("CalculatorForm", () => {
  it("добавляет в корзину позицию с расчётом по умолчанию", async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();

    renderWithTheme(<CalculatorForm onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole("button", { name: "В корзину" }));

    // width=2, height=2.5, fold=2 → area=10, fabricWidth=4
    const fabricCost = 10 * PRICES.fabricPerM2;
    const tapeCost = 4 * PRICES.tapePerM;
    const laborCost = 10 * PRICES.laborPerM2;
    const total = fabricCost + tapeCost + laborCost;

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith({
      width: 2,
      height: 2.5,
      foldRatio: 2,
      curtainType: "straight",
      fabricCost,
      tapeCost,
      laborCost,
      total,
    });
  });
});
