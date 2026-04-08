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
          "@media print": {
            ".no-print": { display: "none !important" },
          },
        }}
      />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }} className="no-print">
            Калькулятор штор
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }} className="no-print">
              <CalculatorForm onAddToCart={handleAdd} />
            </Box>
            <Box sx={{ width: { xs: "100%", md: 400 }, flexShrink: 0 }}>
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
          <Container maxWidth="lg" sx={{ py: 0.75 }}>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0, lineHeight: 1.2 }}>
              Калькулятор штор · {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
