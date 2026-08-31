export type JobListing = {
  id: string;
  title: string;
  description: string;
  location: string;
  jobDate: string | null;
  duration: string;
  payment: string;
  posterName: string;
  posterId: string | null;
};

export const jobListings: JobListing[] = [
  {
    id: "j1",
    title: "Hjelp til potethøsting – 2 dager",
    description: "Trenger 1-2 personer til å hjelpe med potethøsting i starten av september.",
    location: "Innlandet",
    jobDate: null,
    duration: "2 dager",
    payment: "250 kr/time",
    posterName: "Ola Hansen",
    posterId: null,
  },
  {
    id: "j2",
    title: "Ser etter noen med traktor og tilhenger",
    description: "Trenger hjelp til transport av høy fra åker til låve, én dag i august.",
    location: "Trøndelag",
    jobDate: null,
    duration: "1 dag",
    payment: "Avtales",
    posterName: "Kari Berg",
    posterId: null,
  },
  {
    id: "j3",
    title: "Gårdshjelp i helgene",
    description: "Fast helgejobb med dyrestell og generelt gårdsarbeid.",
    location: "Vestfold",
    jobDate: null,
    duration: "Fast, helger",
    payment: "220 kr/time",
    posterName: "Per Solheim",
    posterId: null,
  },
];
