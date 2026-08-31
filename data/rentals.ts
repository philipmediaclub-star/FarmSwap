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
};

export const rentalListings: RentalListing[] = [
  {
    id: "r1",
    title: "Vedkløyver 8 tonn",
    dailyPrice: 500,
    weeklyPrice: 2500,
    category: "Redskap",
    location: "Vestfold",
    distanceKm: 12,
    owner: "Per Solheim",
    description:
      "Kraftig vedkløyver på tilhenger, enkel å ta med. Klarer stammer opp til 50 cm i diameter. Perfekt for vedhogst før vinteren.",
    conditions:
      "Leietaker henter og returnerer utstyret selv. Depositum avtales direkte med eier. Drivstoff fylles av leietaker.",
    imageQuery: "log splitter machine",
    unavailableDates: [],
  },
  {
    id: "r2",
    title: "Väderstad Rapid Såmaskin",
    dailyPrice: 1800,
    weeklyPrice: 9000,
    category: "Såmaskin",
    location: "Trøndelag",
    distanceKm: 22,
    owner: "Kari Berg",
    description:
      "4 meter såmaskin, godt vedlikeholdt. Fungerer best på traktorer fra 120 hk og oppover. Innstillinger forklares ved henting.",
    conditions:
      "Krever traktorførerbevis og erfaring med lignende utstyr. Skade utover normal slitasje dekkes av leietaker.",
    imageQuery: "seed drill machine field",
    unavailableDates: [],
  },
  {
    id: "r3",
    title: "Krysstilhenger 3-akslet",
    dailyPrice: 700,
    weeklyPrice: 3500,
    category: "Tilhenger",
    location: "Innlandet",
    distanceKm: 9,
    owner: "Ola Hansen",
    description:
      "Rommelig tilhenger for transport av dyr, rundballer eller maskiner. Tåler inntil 12 tonn totalvekt.",
    conditions:
      "Gyldig førerkort for tilhenger kreves. Rengjøres før retur.",
    imageQuery: "livestock trailer farm",
    unavailableDates: [],
  },
  {
    id: "r4",
    title: "Snøfres til traktor",
    dailyPrice: 600,
    weeklyPrice: 3000,
    category: "Vintervedlikehold",
    location: "Innlandet",
    distanceKm: 15,
    owner: "Anne Vik",
    description:
      "Frontmontert snøfres, passer traktorer med trepunktsfeste. God kapasitet for gårdstun og private veier.",
    conditions: "Kun for bruk på private eiendommer/tun, ikke offentlig vei.",
    imageQuery: "snow blower tractor attachment",
    unavailableDates: [],
  },
];
