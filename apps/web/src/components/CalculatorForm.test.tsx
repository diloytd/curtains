import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../test/renderWithTheme";
import { CalculatorForm } from "./CalculatorForm";

describe("CalculatorForm", () => {
  it("добавляет в корзину позицию с расчётом по умолчанию", async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();

    renderWithTheme(<CalculatorForm onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole("button", { name: "В корзину" }));

    // width=2, height=2.5, fold=1.5, ткань=Хлопок(900), лента=600, работа=8000
    const fabricCost = 2 * 2.5 * 1.5 * 900;
    const tapeCost = 600;
    const laborCost = 8000;
    const total = fabricCost + tapeCost + laborCost;

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 2,
        height: 2.5,
        foldRatio: 1.5,
        curtainType: "straight",
        fabricLabel: "Хлопок",
        curtainColorLabel: "Белый",
        fabricCost,
        tapeCost,
        laborCost,
        total,
      }),
    );
  });
});
