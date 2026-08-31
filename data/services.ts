export type ServiceListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceType: "fixed" | "contact";
  price: number | null;
  location: string;
  availability: string;
  providerName: string;
  providerId: string | null;
};

export const serviceListings: ServiceListing[] = [
  {
    id: "s1",
    title: "Leiekjøring med traktor og tilhenger",
    description: "Tilbyr transport av rundballer, ved og maskiner i hele Innlandet-området.",
    category: "Transport",
    priceType: "contact",
    price: null,
    location: "Innlandet",
    availability: "Hele sesongen",
    providerName: "Ola Hansen",
    providerId: null,
  },
  {
    id: "s2",
    title: "Snømåking for gårdstun og private veier",
    description: "Rask og pålitelig snørydding om vinteren. Egen traktor med frontplog.",
    category: "Snømåking",
    priceType: "fixed",
    price: 800,
    location: "Trøndelag",
    availability: "Vintersesong",
    providerName: "Kari Berg",
    providerId: null,
  },
  {
    id: "s3",
    title: "Slåing og rundballepressing",
    description: "Utfører slått og pressing av rundballer for mindre og mellomstore bruk.",
    category: "Høsting",
    priceType: "contact",
    price: null,
    location: "Vestfold",
    availability: "Juni–August",
    providerName: "Per Solheim",
    providerId: null,
  },
];
