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

const compactFieldSx = {
  "& .MuiInputBase-root": {
    /* не меньше высоты строки подписи + notch Outlined */
    minHeight: 36,
    fontSize: "0.75rem",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderWidth: "1px",
  },
  "& .MuiInputBase-input": {
    py: "3px",
    px: "7px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.75rem",
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.65rem",
  },
  "& .MuiSelect-select": {
    py: "3px !important",
    minHeight: "0 !important",
  },
} as const;

/** В ряд делят ширину поровну; minWidth — чтобы подписи не обрезались flex’ом при lg */
const widthHeightFieldSx = {
  ...compactFieldSx,
  flex: { sm: "1 1 0%" },
  minWidth: { xs: "100%", sm: 220 },
  maxWidth: { xs: "100%" },
  "& .MuiFormControl-root": { overflow: "visible" },
  "& .MuiOutlinedInput-root": { overflow: "visible" },
  "& .MuiInputLabel-root": { overflow: "visible" },
} as const;

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
    <Stack
      spacing={0.75}
      sx={{
        width: "100%",
        minHeight: 0,
        height: { lg: "100%" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} useFlexGap flexWrap="wrap">
          <TextField
            label="Ширина карниза, м"
            type="number"
            inputProps={{ min: 0.1, step: 0.05 }}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            fullWidth
            size="small"
            sx={widthHeightFieldSx}
          />
          <TextField
            label="Высота карниза, м"
            type="number"
            inputProps={{ min: 0.1, step: 0.05 }}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            fullWidth
            size="small"
            sx={widthHeightFieldSx}
          />
        </Stack>
        <Box sx={{ mt: 0.25, width: "100%", maxWidth: { xs: "100%", sm: 560 } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 0, fontSize: "0.7rem", maxWidth: "100%" }}
          >
            Коэффициент сборки: {foldRatio.toFixed(1)}
          </Typography>
          <Slider
            size="small"
            sx={{ py: 0.25, "& .MuiSlider-thumb": { width: 14, height: 14 } }}
            min={1.5}
            max={3}
            step={0.1}
            value={foldRatio}
            onChange={(_, v) => setFoldRatio(v as number)}
            valueLabelDisplay="auto"
          />
        </Box>
        <FormControl
          fullWidth
          size="small"
          sx={{ ...compactFieldSx, mt: 0.25, maxWidth: { xs: "100%", sm: 220 } }}
        >
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

        <Typography variant="caption" component="h2" sx={{ mt: 0.75, mb: 0.125, fontWeight: 600, display: "block" }}>
          Смета
        </Typography>
        <Typography variant="caption" component="div" sx={{ lineHeight: 1.4 }}>
          Площадь ткани: {costs.areaM2.toFixed(2)} м² · Ткань · Лента · Работа
        </Typography>
        <Typography variant="caption" component="div" sx={{ lineHeight: 1.4 }}>
          {formatRub(costs.fabricCost)} · {formatRub(costs.tapeCost)} · {formatRub(costs.laborCost)}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
          Итого: {formatRub(costs.total)}
        </Typography>

        <Button variant="contained" color="primary" onClick={handleAdd} size="small" sx={{ mt: 0.75, py: 0.25, px: 1.25, fontSize: "0.75rem", minHeight: 32 }}>
          В корзину
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          width: "100%",
          flex: { lg: 1 },
          minHeight: { lg: 0 },
        }}
      >
        <Typography variant="caption" component="h2" sx={{ flexShrink: 0, fontWeight: 600, display: "block" }}>
          Чертёж
        </Typography>
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            /* Мобилка/узкий: больше места под схему и эскиз */
            minHeight: { xs: 360, lg: 0 },
            height: { xs: "min(62vh, 620px)", lg: "auto" },
            flex: { lg: 1 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CurtainDrawing
            width={width}
            height={height}
            foldRatio={foldRatio}
            curtainType={curtainType}
          />
        </Box>
      </Box>
    </Stack>
  );
}
