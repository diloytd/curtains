import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material/styles";
import type { CartItem, CurtainType } from "@curtans/core";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CalculatorForm } from "@curtans-web/components/CalculatorForm";
import { Cart } from "@curtans-web/components/Cart";
import { appTheme } from "@curtans-web/theme";
import "./shtori-overlay.css";

const CART_STORAGE_KEY = "curtans-karniz-mirror2-calculator-cart";

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const isCurtainType = (v: unknown): v is CurtainType =>
  v === "straight" || v === "pleated" || v === "roman";

const isCartItem = (x: unknown): x is CartItem => {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.width === "number" &&
    typeof o.height === "number" &&
    typeof o.foldRatio === "number" &&
    isCurtainType(o.curtainType) &&
    typeof o.fabricCost === "number" &&
    typeof o.tapeCost === "number" &&
    typeof o.laborCost === "number" &&
    typeof o.total === "number"
  );
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isCartItem);
  } catch {
    return [];
  }
};

const CalculatorModalHost = () => {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* quota / private mode */
    }
  }, [cart]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleAddToCart = useCallback((item: Omit<CartItem, "id">) => {
    setCart((prev) => [...prev, { ...item, id: createId() }]);
    setSnackOpen(true);
  }, []);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((row) => row.id !== id));
  }, []);

  useEffect(() => {
    const btn = document.getElementById("curtans-calc-open");
    if (!btn) return;
    btn.addEventListener("click", handleOpen);
    return () => {
      btn.removeEventListener("click", handleOpen);
    };
  }, [handleOpen]);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        scroll="paper"
        disableScrollLock={false}
        disableRestoreFocus
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,0,0,0.55)" },
          },
          paper: {
            sx: {
              position: "fixed",
              m: 2,
              /* до lg — как раньше (~md 900px); с lg — +25% ширина/высота окна */
              width: { xs: "calc(100% - 32px)", lg: "min(96vw, 1125px)" },
              maxWidth: { xs: 900, lg: 1125 },
              maxHeight: { xs: "min(92vh, 900px)", lg: "min(92vh, 1125px)" },
            },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            m: 0,
            pr: 6,
            py: 1.5,
            pl: 2,
            position: "relative",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          <span>Калькулятор штор</span>
          <IconButton
            type="button"
            aria-label="Закрыть"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 16,
              color: "text.secondary",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: "1.25rem", lineHeight: 1 }}>
              ✕
            </span>
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            overflow: "auto",
            overscrollBehavior: "contain",
            pt: 1,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="stretch"
            sx={{
              width: "100%",
              minHeight: 0,
              /* с 1200px (lg) контентный ряд шире/выше пропорционально окну */
              lg: {
                minHeight: "min(68vh, 880px)",
              },
            }}
          >
            <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
              <CalculatorForm
                onAddToCart={handleAddToCart}
                drawingAreaScale={{ xs: 1.2, lg: 1.3 }}
              />
            </Box>
            <Box
              sx={{
                flex: { md: "0 0 360px", lg: "0 0 450px" },
                width: { xs: "100%", md: "auto" },
                minWidth: 0,
              }}
            >
              <Cart items={cart} onRemove={handleRemoveFromCart} />
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        message="Добавлено в корзину калькулятора"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </ThemeProvider>
  );
};

const mount = document.createElement("div");
mount.id = "curtans-calculator-root";
document.body.appendChild(mount);
createRoot(mount).render(<CalculatorModalHost />);
