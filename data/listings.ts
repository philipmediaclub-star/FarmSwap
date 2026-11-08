export type Listing = {
  id: string;
  title: string;
  price: number;
  /** what the price is per: "stk" (default), "sekk", "favn", "m³" ... */
  priceUnit?: string;
  currency: "NOK";
  category: string;
  location: string;
  distanceKm: number;
  year?: number;
  hours?: number;
  condition?: "Ny" | "Som ny" | "Godt brukt" | "Brukt";
  imageQuery: string;
  imageUrls?: string[];
  sellerName: string;
  /** coordinates of the (town-level) location, when known */
  lat?: number;
  lng?: number;
  /** true while an admin-set promotion ("Reklame") is active */
  promoted?: boolean;
};

