import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16 prose-sm">
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Vilkår for bruk</h1>
          <p className="text-sm text-ink/50 mb-8">
            Sist oppdatert: august 2026. FarmSwap er et skoleprosjekt (Ungdomsbedrift) og denne
            teksten er et foreløpig utkast, ikke en juridisk bindende avtale ennå.
          </p>

          <div className="flex flex-col gap-6 text-sm text-ink/75 leading-relaxed">
            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">1. Om tjenesten</h2>
              <p>
                FarmSwap er en markedsplass som kobler sammen bønder og andre i landbruket for
                kjøp, salg, utleie og deling av landbruksutstyr, samt tjenester og sesongarbeid.
                FarmSwap eier ikke utstyret som annonseres og er ikke part i avtaler som inngås
                mellom brukere.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">2. Brukerkonto</h2>
              <p>
                Du må være minst 16 år for å opprette en konto. Du er selv ansvarlig for at
                opplysningene du oppgir er korrekte, og for aktivitet som skjer fra din konto.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">3. Annonser og avtaler</h2>
              <p>
                Kjøper og selger/utleier avtaler selv pris, betaling og leveranse seg imellom.
                FarmSwap tilbyr foreløpig ingen betalingsløsning og er ikke ansvarlig for
                gjennomføring av handelen, tilstanden på utstyret, eller eventuelle tvister mellom
                partene.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">4. Oppførsel</h2>
              <p>
                Annonser og meldinger skal være ærlige og saklige. Du kan rapportere annonser du
                mener bryter disse vilkårene, og FarmSwap kan fjerne annonser eller stenge kontoer
                som misbruker tjenesten.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">5. Ansvarsbegrensning</h2>
              <p>
                Tjenesten leveres «som den er», som et prototyp-/skoleprosjekt. FarmSwap garanterer
                ikke at tjenesten er feilfri eller alltid tilgjengelig.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-ink text-base mb-2">6. Kontakt</h2>
              <p>Spørsmål om disse vilkårene kan rettes til [sett inn kontakt-e-post her].</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
