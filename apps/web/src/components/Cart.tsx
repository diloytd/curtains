import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { CartItem, CurtainType } from "@curtans/core";

const TYPE_LABELS: Record<CurtainType, string> = {
  straight: "Прямые",
  pleated: "Со складками",
  roman: "Римские",
};

function formatRub(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

export interface CartProps {
  items: CartItem[];
  onRemove: (id: string) => void;
}

export function Cart({ items, onRemove }: CartProps) {
  const sum = items.reduce((a, i) => a + i.total, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Paper id="cart-print-root" elevation={0} sx={{ p: 2, border: "1px solid #e0e0e0" }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Корзина
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Пока пусто
          </Typography>
        ) : (
          <>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Размеры, м</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="right" width={72} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.width} × {row.height}, k={row.foldRatio.toFixed(1)}
                      </TableCell>
                      <TableCell>{TYPE_LABELS[row.curtainType]}</TableCell>
                      <TableCell align="right">{formatRub(row.total)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => onRemove(row.id)}>
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Typography variant="subtitle1">Всего: {formatRub(sum)}</Typography>
            <Button variant="outlined" color="primary" onClick={handlePrint}>
              Печать
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
