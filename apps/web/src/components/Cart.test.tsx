import type { CartItem } from "@curtans/core";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../test/renderWithTheme";
import { Cart } from "./Cart";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "id-1",
    width: 2,
    height: 2.5,
    foldRatio: 2,
    curtainType: "straight",
    fabricCost: 100,
    tapeCost: 50,
    laborCost: 80,
    total: 230,
    ...overrides,
  };
}

describe("Cart", () => {
  it("показывает пустое состояние", () => {
    renderWithTheme(<Cart items={[]} onRemove={vi.fn()} />);
    expect(screen.getByText("Пока пусто")).toBeInTheDocument();
  });

  it("суммирует позиции и вызывает onRemove при удалении", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const items = [makeItem({ id: "a", total: 100 }), makeItem({ id: "b", total: 50 })];

    renderWithTheme(<Cart items={items} onRemove={onRemove} />);

    expect(screen.getByText(/Всего:/)).toHaveTextContent("150");
    await user.click(screen.getAllByRole("button", { name: "Удалить" })[0]);
    expect(onRemove).toHaveBeenCalledWith("a");
  });
});
