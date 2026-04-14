import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { CartItem, CurtainType } from "@curtans/core";
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

type FabricType = "cotton" | "canvas" | "linen-look" | "satin" | "printed" | "jacquard";

const FABRIC_OPTIONS: Array<{ value: FabricType; label: string; pricePerM2: number }> = [
  { value: "cotton", label: "Хлопок", pricePerM2: 900 },
  { value: "canvas", label: "Канвас", pricePerM2: 1200 },
  { value: "linen-look", label: "Под лен", pricePerM2: 1350 },
  { value: "satin", label: "Атлас", pricePerM2: 1800 },
  { value: "printed", label: "Ткани с принтами", pricePerM2: 1650 },
  { value: "jacquard", label: "Жаккард", pricePerM2: 2200 },
];

const TAPE_PRICE = 600;
const LABOR_PRICE = 8000;

function formatRub(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Масштаб блока «Чертёж»: одно число или раздельно для экранов до lg и от lg (в теме MUI lg = 1200px). */
export type DrawingAreaScaleProp =
  | number
  | {
      xs?: number;
      lg?: number;
    };

const resolveDrawingScale = (scale: DrawingAreaScaleProp, tier: "xs" | "lg"): number => {
  if (typeof scale === "number") return scale;
  if (tier === "xs") return scale.xs ?? 1;
  return scale.lg ?? scale.xs ?? 1;
};

export interface CalculatorFormProps {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  drawingAreaScale?: DrawingAreaScaleProp;
}

export function CalculatorForm({ onAddToCart, drawingAreaScale = 1 }: CalculatorFormProps) {
  const sXs = resolveDrawingScale(drawingAreaScale, "xs");
  const sLg = resolveDrawingScale(drawingAreaScale, "lg");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(2.5);
  const [foldRatio, setFoldRatio] = useState(1.5);
  const [curtainType, setCurtainType] = useState<CurtainType>("straight");
  const [fabricType, setFabricType] = useState<FabricType>("cotton");
  const [withTape, setWithTape] = useState(true);
  const [withLabor, setWithLabor] = useState(true);

  const costs = useMemo(() => {
    const selectedFabric = FABRIC_OPTIONS.find((fabric) => fabric.value === fabricType) ?? FABRIC_OPTIONS[0];
    const areaM2 = width * height * foldRatio;
    const fabricCost = areaM2 * selectedFabric.pricePerM2;
    const tapeCost = withTape ? TAPE_PRICE : 0;
    const laborCost = withLabor ? LABOR_PRICE : 0;

    return {
      areaM2,
      fabricCost,
      tapeCost,
      laborCost,
      total: fabricCost + tapeCost + laborCost,
    };
  }, [fabricType, foldRatio, height, width, withLabor, withTape]);

  const estimateRows = useMemo(() => {
    const rows: Array<{ name: string; qty: string; cost: number }> = [
      { name: "Ткань", qty: `${costs.areaM2.toFixed(2)} м²`, cost: costs.fabricCost },
    ];
    if (withTape) rows.push({ name: "Лента", qty: "1 шт", cost: costs.tapeCost });
    if (withLabor) rows.push({ name: "Работа", qty: "1 шт", cost: costs.laborCost });
    return rows;
  }, [
    costs.areaM2,
    costs.fabricCost,
    costs.laborCost,
    costs.tapeCost,
    withLabor,
    withTape,
  ]);

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
            min={1}
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
        <FormControl
          fullWidth
          size="small"
          sx={{ ...compactFieldSx, mt: 0.5, maxWidth: { xs: "100%", sm: 260 } }}
        >
          <InputLabel id="fabric-type-label">Вид ткани</InputLabel>
          <Select
            labelId="fabric-type-label"
            label="Вид ткани"
            value={fabricType}
            onChange={(e) => setFabricType(e.target.value as FabricType)}
          >
            {FABRIC_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} ({formatRub(option.pricePerM2)}/м²)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={0.25} sx={{ mt: 0.25 }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={withTape} onChange={(e) => setWithTape(e.target.checked)} />}
            label={`Лента (${formatRub(TAPE_PRICE)})`}
            sx={{ mr: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox size="small" checked={withLabor} onChange={(e) => setWithLabor(e.target.checked)} />
            }
            label={`Работа (${formatRub(LABOR_PRICE)})`}
          />
        </Stack>

        <Typography variant="caption" component="h2" sx={{ mt: 0.75, mb: 0.125, fontWeight: 600, display: "block" }}>
          Смета
        </Typography>
        <TableContainer
          sx={{
            width: "100%",
            maxWidth: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }} aria-label="Смета">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "grey.200",
                  "& th": {
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    py: 0.75,
                    px: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    color: "text.primary",
                  },
                }}
              >
                <TableCell component="th" scope="col">
                  Наименование
                </TableCell>
                <TableCell component="th" scope="col" align="center" sx={{ width: "28%" }}>
                  Количество
                </TableCell>
                <TableCell component="th" scope="col" align="right" sx={{ width: "32%" }}>
                  Стоимость
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimateRows.map((row, index) => (
                <TableRow
                  key={row.name}
                  sx={{
                    bgcolor: index % 2 === 0 ? "grey.50" : "background.paper",
                    "& td": {
                      fontSize: "0.75rem",
                      py: 0.65,
                      px: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      verticalAlign: "middle",
                    },
                  }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="center">{row.qty}</TableCell>
                  <TableCell align="right">{formatRub(row.cost)}</TableCell>
                </TableRow>
              ))}
              <TableRow
                sx={{
                  bgcolor: "grey.200",
                  "& td": {
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    py: 0.75,
                    px: 1,
                    borderTop: "2px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <TableCell>ИТОГО:</TableCell>
                <TableCell />
                <TableCell align="right">{formatRub(costs.total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

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
          /* иначе в узком контейнере (модалка) колонка схлопывается и чертёж с height:0 */
          minHeight: { lg: 400 * sLg },
        }}
      >
        <Typography variant="caption" component="h2" sx={{ flexShrink: 0, fontWeight: 600, display: "block" }}>
          Чертёж
        </Typography>
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            /* Мобилка/узкий: больше места под схему и эскиз; на lg без minHeight absolute-контейнер CurtainDrawing получает 0px */
            minHeight: { xs: 360 * sXs, lg: 400 * sLg },
            /* С lg (1200px) — чуть выше по vh/px, плюс отдельный множитель sLg */
            height: {
              xs: `min(${62 * sXs}vh, ${620 * sXs}px)`,
              lg: `min(${56 * sLg}vh, ${650 * sLg}px)`,
            },
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
