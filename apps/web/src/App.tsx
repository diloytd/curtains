import { Box, Container, CssBaseline, GlobalStyles, Stack, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import type { CartItem } from "@curtans/core";
import { useCallback, useState } from "react";
import { CalculatorForm } from "./components/CalculatorForm";
import { Cart } from "./components/Cart";
import { appTheme } from "./theme";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [items, setItems] = useState<CartItem[]>([]);

  const handleAdd = useCallback((payload: Omit<CartItem, "id">) => {
    setItems((prev) => [...prev, { ...payload, id: createId() }]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "html, body, #root": {
            margin: 0,
            minHeight: "100%",
            maxWidth: "100%",
          },
          /* lg+: один экран без прокрутки страницы; до lg — вертикальный скролл страницы разрешён */
          "@media screen and (min-width: 1200px)": {
            "html, body": {
              height: "100%",
              overflow: "hidden",
            },
            "#root": {
              height: "100%",
              overflow: "visible",
            },
          },
          "@media print": {
            "html, body": { overflow: "visible", height: "auto" },
            "#root": { height: "auto", overflow: "visible" },
            ".no-print": { display: "none !important" },
          },
        }}
      />
      <Box
        sx={{
          minHeight: "100dvh",
          height: { lg: "100dvh" },
          maxHeight: { lg: "100dvh" },
          display: "flex",
          flexDirection: "column",
          /* visible, иначе вместе с Container/Stack обрезаются подписи полей на lg */
          overflow: { lg: "visible" },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 2,
            px: { xs: 2, sm: 3 },
            flex: { lg: 1 },
            minHeight: { lg: 0 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: { lg: "visible" },
          }}
        >
          <Typography variant="h5" component="h1" className="no-print" sx={{ mb: 1, flexShrink: 0 }}>
            Калькулятор штор
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="stretch"
            sx={{
              flex: { lg: 1 },
              minHeight: { lg: 0 },
              /* не hidden — иначе обрезаются плавающие подписи Outlined у полей */
              overflow: { lg: "visible" },
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: { lg: 0 },
                display: "flex",
                flexDirection: "column",
                overflow: { lg: "visible" },
              }}
              className="no-print"
            >
              <CalculatorForm onAddToCart={handleAdd} />
            </Box>
            <Box
              sx={{
                width: { xs: "100%", md: 360 },
                flexShrink: 0,
                minHeight: { lg: 0 },
                maxHeight: { lg: "100%" },
                overflow: "auto",
              }}
            >
              <Cart items={items} onRemove={handleRemove} />
            </Box>
          </Stack>
        </Container>
        <Box
          component="footer"
          className="no-print"
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Container maxWidth="lg" sx={{ py: 0.5 }}>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0, lineHeight: 1.2 }}>
              Калькулятор штор · {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
