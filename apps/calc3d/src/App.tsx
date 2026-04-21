import {
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import type { CartItem } from "@curtans/core";
import { CalculatorForm } from "@curtans-web/components/CalculatorForm";
import { Cart } from "@curtans-web/components/Cart";
import { appTheme } from "@curtans-web/theme";
import { useCallback, useEffect, useState } from "react";
import { CurtainRoomPreview } from "./curtain-room-preview";

const CART_STORAGE_KEY = "curtans-calc3d-calculator-cart";

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
};

const App = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* quota */
    }
  }, [cart]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleAddToCart = useCallback((item: Omit<CartItem, "id">) => {
    setCart((prev) => [...prev, { ...item, id: createId() }]);
    setSnackOpen(true);
  }, []);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((row) => row.id !== id));
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 3,
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 1, textAlign: "center" }}>
          Калькулятор штор 3D
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center", maxWidth: 420 }}>
          Смета, корзина и чертёж — как в веб-калькуляторе; рядом с полями — предпросмотр в комнате (Three.js).
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={handleOpenModal}>
          Открыть калькулятор
        </Button>
      </Box>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        aria-labelledby="calc3d-dialog-title"
      >
        <DialogTitle id="calc3d-dialog-title" sx={{ pr: 5 }}>
          Калькулятор штор
          <IconButton
            type="button"
            aria-label="Закрыть"
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 8, top: 12, color: "text.secondary" }}
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
              lg: { minHeight: "min(72vh, 900px)" },
            }}
          >
            <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
              <CalculatorForm
                onAddToCart={handleAddToCart}
                drawingAreaScale={{ xs: 1.15, lg: 1.25 }}
                renderInlinePreview={({ width, height, foldRatio, fabricType, curtainColorHex }) => (
                  <CurtainRoomPreview
                    width={width}
                    height={height}
                    foldRatio={foldRatio}
                    fabricType={fabricType}
                    curtainColorHex={curtainColorHex}
                  />
                )}
              />
            </Box>
            <Box
              sx={{
                flex: { md: "0 0 360px", lg: "0 0 400px" },
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

export default App;
