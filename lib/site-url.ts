// The public address of the site. When moving to the permanent domain, set
// NEXT_PUBLIC_SITE_URL=https://farmswap.no in Vercel (Settings -> Environment Variables)
// and redeploy - nothing else needs to change.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://farm.neosoft.no").replace(/\/+$/, "");

export const SITE_NAME = "FarmSwap";
export const SITE_DESCRIPTION =
  "Landbruksutstyr og tjenester – samlet på ett sted. Kjøp, selg og lei traktorer, redskap og maskiner, finn tjenester og jobber i landbruket.";
