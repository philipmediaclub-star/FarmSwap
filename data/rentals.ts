export type RentalListing = {
  id: string;
  title: string;
  dailyPrice: number;
  weeklyPrice: number;
  category: string;
  location: string;
  distanceKm: number;
  owner: string;
  description: string;
  conditions: string;
  imageQuery: string;
  imageUrls?: string[];
  /** ISO date strings (YYYY-MM-DD) that are already booked */
  unavailableDates: string[];
  /** coordinates of the (town-level) location, when known */
  lat?: number;
  lng?: number;
};

