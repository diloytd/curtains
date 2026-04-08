import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { CartItem, CurtainType } from "@curtans/core";
import { calculateCosts, PRICES } from "@curtans/core";
import { useMemo, useState } from "react";
import { CurtainDrawing } from "./CurtainDrawing";

const CURTAIN_LABELS: Record<CurtainType, string> = {
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

export interface CalculatorFormProps {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
}

export function CalculatorForm({ onAddToCart }: CalculatorFormProps) {
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(2.5);
  const [foldRatio, setFoldRatio] = useState(2);
  const [curtainType, setCurtainType] = useState<CurtainType>("straight");

  const costs = useMemo(
    () => calculateCosts(width, height, foldRatio, PRICES),
    [width, height, foldRatio],
  );

  const handleAdd = () => {
    onAddToCart({
      width,
      height,
      foldRatio,
      curtainType,
      fabricCost: costs.fabricCost,
      tapeCost: costs.tapeCost,
      laborCost: costs.laborCost,
      total: costs.total,
    });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        Параметры
      </Typography>
      <TextField
        label="Ширина карниза, м"
        type="number"
        inputProps={{ min: 0.1, step: 0.05 }}
        value={width}
        onChange={(e) => setWidth(Number(e.target.value))}
        fullWidth
        size="small"
      />
      <TextField
        label="Высота, м"
        type="number"
        inputProps={{ min: 0.1, step: 0.05 }}
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
        fullWidth
        size="small"
      />
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Коэффициент сборки: {foldRatio.toFixed(1)}
        </Typography>
        <Slider
          min={1.5}
          max={3}
          step={0.1}
          value={foldRatio}
          onChange={(_, v) => setFoldRatio(v as number)}
          valueLabelDisplay="auto"
        />
      </Box>
      <FormControl fullWidth size="small">
        <InputLabel id="curtain-type-label">Тип штор</InputLabel>
        <Select
          labelId="curtain-type-label"
          label="Тип штор"
          value={curtainType}
          onChange={(e) => setCurtainType(e.target.value as CurtainType)}
        >
          {(Object.keys(CURTAIN_LABELS) as CurtainType[]).map((key) => (
            <MenuItem key={key} value={key}>
              {CURTAIN_LABELS[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" component="h2">
        Смета
      </Typography>
      <Typography variant="body2">
        Площадь ткани: {costs.areaM2.toFixed(2)} м²
      </Typography>
      <Typography variant="body2">Ткань: {formatRub(costs.fabricCost)}</Typography>
      <Typography variant="body2">Лента: {formatRub(costs.tapeCost)}</Typography>
      <Typography variant="body2">Работа: {formatRub(costs.laborCost)}</Typography>
      <Typography variant="subtitle1">Итого: {formatRub(costs.total)}</Typography>

      <Button variant="contained" color="primary" onClick={handleAdd}>
        В корзину
      </Button>

      <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
        Чертёж
      </Typography>
      <CurtainDrawing
        width={width}
        height={height}
        foldRatio={foldRatio}
        curtainType={curtainType}
      />
    </Stack>
  );
}
