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
  /** "offer" = job position available, "seeking" = person looking for work */
  kind: "offer" | "seeking";
  skills: string;
  promoted?: boolean;
};

