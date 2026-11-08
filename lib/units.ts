// "Price per ..." for things sold by quantity (firewood, hay, feed ...).
// "stk" = a single item (default, e.g. a tractor) and is not shown next to the price.
export const PRICE_UNITS = [
  "stk", "sekk", "favn", "m³", "rundball", "storball", "pall", "tonn", "kg", "liter", "løpemeter", "time",
];

export function unitSuffix(unit?: string | null): string {
  return unit && unit !== "stk" ? ` / ${unit}` : "";
}
