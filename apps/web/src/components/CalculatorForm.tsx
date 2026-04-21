import {
  Box,
  Button,
  Checkbox,
  Collapse,
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
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { CurtainDrawing } from "./CurtainDrawing";
import {
  FABRIC_OPTIONS,
  CURTAIN_PALETTES,
  getCurtainColorEntry,
  getDefaultCurtainColorId,
  type FabricType,
} from "./curtain-fabric-colors";

export type { FabricType } from "./curtain-fabric-colors";

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

const TAPE_PRICE = 600;
const LABOR_PRICE = 8000;

const toggleButtonSx = {
  borderRadius: "8px",
  py: 1,
  px: 2,
  minHeight: 0,
  textTransform: "none" as const,
  fontSize: "0.875rem",
} as const;

const collapsibleInnerSx = (open: boolean) => ({
  width: "100%",
  opacity: open ? 1 : 0,
  transform: open ? "translateY(0)" : "translateY(10px)",
  transition: "opacity 0.3s ease, transform 0.3s ease",
});

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
  /** Превью (например 3D) рядом с полями ширина / высота / сборка / ткань */
  renderInlinePreview?: (params: {
    width: number;
    height: number;
    foldRatio: number;
    fabricType: FabricType;
    curtainColorHex: string;
  }) => ReactNode;
}

export function CalculatorForm({
  onAddToCart,
  drawingAreaScale = 1,
  renderInlinePreview,
}: CalculatorFormProps) {
  const sXs = resolveDrawingScale(drawingAreaScale, "xs");
  const sLg = resolveDrawingScale(drawingAreaScale, "lg");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(2.5);
  const [foldRatio, setFoldRatio] = useState(1.5);
  const [curtainType, setCurtainType] = useState<CurtainType>("straight");
  const [fabricType, setFabricType] = useState<FabricType>("cotton");
  const [curtainColorId, setCurtainColorId] = useState(() => getDefaultCurtainColorId("cotton"));
  const [withTape, setWithTape] = useState(true);
  const [withLabor, setWithLabor] = useState(true);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);

  useEffect(() => {
    setCurtainColorId(getDefaultCurtainColorId(fabricType));
  }, [fabricType]);

  const selectedColor = useMemo(
    () => getCurtainColorEntry(fabricType, curtainColorId),
    [curtainColorId, fabricType],
  );

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

  const handleToggleEstimate = () => {
    setShowEstimate((previous) => !previous);
  };

  const handleToggleDrawing = () => {
    setShowDrawing((previous) => !previous);
  };

  const handleAdd = () => {
    const fabricLabel = FABRIC_OPTIONS.find((f) => f.value === fabricType)?.label;
    onAddToCart({
      width,
      height,
      foldRatio,
      curtainType,
      fabricLabel,
      curtainColorLabel: selectedColor.label,
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "flex-start" }}
          sx={{ width: "100%" }}
        >
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} useFlexGap flexWrap="wrap">
              <TextField
                label="Ширина карниза, м"
                type="number"
                inputProps={{ min: 1, max: 3, step: 0.05 }}
                value={width}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  setWidth(Math.min(3, Math.max(1, n)));
                }}
                fullWidth
                size="small"
                sx={widthHeightFieldSx}
              />
              <TextField
                label="Высота карниза, м"
                type="number"
                inputProps={{ min: 1.5, max: 3, step: 0.05 }}
                value={height}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  setHeight(Math.min(3, Math.max(1.5, n)));
                }}
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
              sx={{ ...compactFieldSx, mt: 0.5, maxWidth: { xs: "100%", sm: 280 } }}
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
            <FormControl
              fullWidth
              size="small"
              sx={{ ...compactFieldSx, mt: 0.5, maxWidth: { xs: "100%", sm: 280 } }}
            >
              <InputLabel id="curtain-color-label">Цвет штор</InputLabel>
              <Select
                labelId="curtain-color-label"
                label="Цвет штор"
                value={curtainColorId}
                onChange={(e) => setCurtainColorId(e.target.value)}
                renderValue={(id) => {
                  const row = getCurtainColorEntry(fabricType, id as string);
                  return (
                    <Stack direction="row" spacing={1} alignItems="center" component="span">
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "2px",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: row.hex,
                          flexShrink: 0,
                        }}
                      />
                      <span>{row.label}</span>
                    </Stack>
                  );
                }}
              >
                {CURTAIN_PALETTES[fabricType].map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "2px",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: c.hex,
                          flexShrink: 0,
                        }}
                      />
                      <span>{c.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          {renderInlinePreview ? (
            <Box
              sx={{
                flexShrink: 0,
                alignSelf: { xs: "center", md: "flex-start" },
                width: { xs: "100%", md: "auto" },
              }}
            >
              {renderInlinePreview({
                width,
                height,
                foldRatio,
                fabricType,
                curtainColorHex: selectedColor.hex,
              })}
            </Box>
          ) : null}
        </Stack>
        <FormControl
          fullWidth
          size="small"
          sx={{ ...compactFieldSx, mt: 0.75, maxWidth: { xs: "100%", sm: 220 } }}
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

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
          <Button
            type="button"
            variant={showEstimate ? "contained" : "outlined"}
            color="primary"
            onClick={handleToggleEstimate}
            aria-expanded={showEstimate}
            sx={{
              ...toggleButtonSx,
              textDecoration: showEstimate ? "underline" : "none",
              textUnderlineOffset: 3,
            }}
          >
            Смета
          </Button>
          <Button
            type="button"
            variant={showDrawing ? "contained" : "outlined"}
            color="primary"
            onClick={handleToggleDrawing}
            aria-expanded={showDrawing}
            sx={{
              ...toggleButtonSx,
              textDecoration: showDrawing ? "underline" : "none",
              textUnderlineOffset: 3,
            }}
          >
            Чертёж
          </Button>
        </Stack>

        <Collapse in={showEstimate} timeout={300} collapsedSize={0} sx={{ width: "100%" }}>
          <Box sx={collapsibleInnerSx(showEstimate)}>
            <Typography variant="caption" component="h2" sx={{ mt: 0.25, mb: 0.125, fontWeight: 600, display: "block" }}>
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
          </Box>
        </Collapse>

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
          flex: showDrawing ? { lg: 1 } : "0 0 auto",
          minHeight: 0,
        }}
      >
        <Collapse in={showDrawing} timeout={300} collapsedSize={0} sx={{ width: "100%", flex: showDrawing ? { lg: 1 } : "none", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ ...collapsibleInnerSx(showDrawing), display: "flex", flexDirection: "column", flex: { lg: 1 }, minHeight: 0 }}>
            <Typography variant="caption" component="h2" sx={{ flexShrink: 0, fontWeight: 600, display: "block" }}>
              Чертёж
            </Typography>
            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                minHeight: { xs: 360 * sXs, lg: 400 * sLg },
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
        </Collapse>
      </Box>
    </Stack>
  );
}
