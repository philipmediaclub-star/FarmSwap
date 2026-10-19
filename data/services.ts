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
  promoted?: boolean;
};

