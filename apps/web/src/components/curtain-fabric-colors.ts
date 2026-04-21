/** Палитра цветов штор под каждый вид ткани + цены за м². */

export type CurtainColorChoice = {
  id: string;
  label: string;
  /** #RRGGBB */
  hex: string;
};

export const CURTAIN_PALETTES = {
  linen: [
    { id: "natural", label: "Натуральный лён", hex: "#c8b89a" },
    { id: "sand", label: "Песочный", hex: "#d4c4a8" },
    { id: "sage", label: "Шалфей", hex: "#b8b5a0" },
    { id: "oat", label: "Овёс", hex: "#dcd0bc" },
    { id: "clay", label: "Глина", hex: "#a89888" },
  ],
  cotton: [
    { id: "white", label: "Белый", hex: "#f5f3ee" },
    { id: "cream", label: "Кремовый", hex: "#ebe4d4" },
    { id: "dusty-blue", label: "Пыльная лазурь", hex: "#a8b8c8" },
    { id: "powder", label: "Пудровый", hex: "#e8d0d8" },
    { id: "soft-gray", label: "Светло-серый", hex: "#d8d8dc" },
    { id: "sage-cotton", label: "Оливковый", hex: "#c5c9b8" },
  ],
  silk: [
    { id: "ivory", label: "Слоновая кость", hex: "#fff8ef" },
    { id: "champagne", label: "Шампань", hex: "#f0e6d8" },
    { id: "pearl", label: "Жемчужный", hex: "#e8ecf2" },
    { id: "blush", label: "Розовый кварц", hex: "#f5e0e4" },
    { id: "silver-silk", label: "Серебристый", hex: "#e4e6ea" },
  ],
  polyester: [
    { id: "bright-white", label: "Оптический белый", hex: "#f4f6fa" },
    { id: "silver", label: "Серебро", hex: "#c8ccd4" },
    { id: "latte", label: "Латте", hex: "#d8cfc4" },
    { id: "sky", label: "Небесный", hex: "#b8d0e8" },
    { id: "mint", label: "Мята", hex: "#c8e4d8" },
    { id: "lavender", label: "Лаванда", hex: "#d8d4e8" },
  ],
  velvet: [
    { id: "wine", label: "Бордо", hex: "#5c2840" },
    { id: "navy", label: "Полночь", hex: "#2a3048" },
    { id: "emerald", label: "Изумруд", hex: "#1e4838" },
    { id: "graphite", label: "Графит", hex: "#3a3842" },
    { id: "gold", label: "Золотисто-коричневый", hex: "#6a4830" },
    { id: "plum", label: "Слива", hex: "#483450" },
  ],
  jacquard: [
    { id: "gold-beige", label: "Золото на бежевом", hex: "#a89878" },
    { id: "silver-gray", label: "Серебро на сером", hex: "#908880" },
    { id: "bronze", label: "Бронза", hex: "#8a7058" },
    { id: "ink", label: "Чернильный", hex: "#4a5060" },
    { id: "wine-j", label: "Винный узор", hex: "#705050" },
  ],
  blackout: [
    { id: "coal", label: "Антрацит", hex: "#2a2a30" },
    { id: "graphite-b", label: "Графит", hex: "#383840" },
    { id: "espresso", label: "Эспрессо", hex: "#322828" },
    { id: "midnight", label: "Полночь синий", hex: "#283040" },
    { id: "warm-gray", label: "Тёплый серый", hex: "#484440" },
  ],
} as const satisfies Record<string, readonly CurtainColorChoice[]>;

export type FabricType = keyof typeof CURTAIN_PALETTES;

export const FABRIC_OPTIONS: Array<{ value: FabricType; label: string; pricePerM2: number }> = [
  { value: "linen", label: "Лён", pricePerM2: 1400 },
  { value: "cotton", label: "Хлопок", pricePerM2: 900 },
  { value: "silk", label: "Шёлк", pricePerM2: 2100 },
  { value: "polyester", label: "Полиэстер", pricePerM2: 650 },
  { value: "velvet", label: "Бархат", pricePerM2: 1900 },
  { value: "jacquard", label: "Жаккард", pricePerM2: 2200 },
  { value: "blackout", label: "Блэкаут", pricePerM2: 1500 },
];

export const getCurtainColorsForFabric = (fabric: FabricType): readonly CurtainColorChoice[] =>
  CURTAIN_PALETTES[fabric];

export const getCurtainColorEntry = (
  fabric: FabricType,
  colorId: string,
): CurtainColorChoice => {
  const list = CURTAIN_PALETTES[fabric];
  const found = list.find((c) => c.id === colorId);
  return found ?? list[0];
};

export const getDefaultCurtainColorId = (fabric: FabricType): string => CURTAIN_PALETTES[fabric][0].id;
