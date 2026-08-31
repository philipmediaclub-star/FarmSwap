import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Personvernerklæring</h1>
          <p className="text-sm text-ink/50 mb-8">
            Sist oppdatert: august 2026. FarmSwap er et skoleprosjekt (Ungdomsbedrift) og denne
            teksten er et foreløpig utkast, ikke ferdig juridisk personvernerklæring.
          </p>

          <div className="flex flex-col gap-6 text-sm text-ink/75 leading-relaxed">
            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">
                Hvilke opplysninger samler vi inn?
              </h2>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>Navn, e-post og fødselsdato (for å bekrefte at du er 16 år eller eldre)</li>
                <li>Valgfritt: gårds-/foretaksnavn, sted og en kort beskrivelse av deg</li>
                <li>Innhold du selv legger inn: annonser, bilder, meldinger og vurderinger</li>
                <li>Grunnleggende bruksdata, som antall visninger på dine annonser</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">
                Hva bruker vi opplysningene til?
              </h2>
              <p>
                Opplysningene brukes for å vise annonsen din til andre brukere, la kjøpere og
                selgere kontakte hverandre, og vise enkel statistikk om dine annonser (visninger,
                favoritter, vurderinger).
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">Lokasjon</h2>
              <p>
                FarmSwap viser kun omtrentlig plassering (fylke/region) på kartet, aldri en
                nøyaktig adresse. Vi ber deg aldri om å oppgi din private adresse i en annonse.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">Dine rettigheter</h2>
              <p>
                Du kan når som helst se og endre opplysningene dine under «Min profil», og be om
                at kontoen din og tilhørende data slettes. Ta kontakt på [sett inn kontakt-e-post
                her] for sletting av data.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">Tredjeparter</h2>
              <p>
                Vi bruker Supabase (database og innlogging) og Google Maps (kartvisning) for å
                drifte tjenesten. Disse leverandørene behandler data på våre vegne i tråd med sine
                egne personvernavtaler.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
