export type Listing = {
  id: string;
  title: string;
  price: number;
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
};

export const featuredListings: Listing[] = [
  {
    id: "l1",
    title: "John Deere 6155R",
    price: 850000,
    currency: "NOK",
    category: "Traktor",
    location: "Innlandet",
    distanceKm: 18,
    year: 2019,
    hours: 2400,
    condition: "Godt brukt",
    imageQuery: "John Deere tractor field",
    sellerName: "Ola Hansen",
  },
  {
    id: "l2",
    title: "Väderstad Carrier 500",
    price: 320000,
    currency: "NOK",
    category: "Jordbruksutstyr",
    location: "Trøndelag",
    distanceKm: 34,
    year: 2017,
    condition: "Godt brukt",
    imageQuery: "cultivator farm equipment field",
    sellerName: "Kari Berg",
  },
  {
    id: "l3",
    title: "Vedkløyver 8 tonn",
    price: 500,
    currency: "NOK",
    category: "Utleie",
    location: "Vestfold",
    distanceKm: 12,
    condition: "Som ny",
    imageQuery: "log splitter machine",
    sellerName: "Per Solheim",
  },
  {
    id: "l4",
    title: "Krone Tilhenger 12t",
    price: 145000,
    currency: "NOK",
    category: "Tilhenger",
    location: "Rogaland",
    distanceKm: 27,
    year: 2015,
    condition: "Brukt",
    imageQuery: "farm trailer agricultural",
    sellerName: "Anne Vik",
  },
];
