"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { ServiceListing } from "@/data/services";
import ContactSellerModal from "./ContactSellerModal";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function ServiceCard({ service }: { service: ServiceListing }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-cream-card border border-steel-light rounded-xl p-5 flex flex-col">
      <span className="font-tag text-[11px] uppercase tracking-wide text-moss-dark">
        {service.category}
      </span>
      <h3 className="mt-1.5 font-display font-semibold text-ink">{service.title}</h3>
      <p className="mt-2 text-sm text-ink/65 leading-relaxed flex-1">{service.description}</p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-ink/55">
          <MapPin size={13} /> {service.location}
        </span>
        <span className="font-tag font-semibold text-moss-dark">
          {service.priceType === "fixed" && service.price
            ? formatNOK(service.price)
            : t("services_price_contact")}
        </span>
      </div>

      {service.availability && (
        <p className="mt-1 text-xs text-ink/45">{service.availability}</p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 w-full border border-moss/30 text-moss-dark font-semibold text-sm py-2.5 rounded-lg hover:bg-sage/50 transition-colors"
      >
        {t("services_contact_button")}
      </button>

      <ContactSellerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sellerId={service.providerId}
        listingId={service.id}
        buttonLabel={t("services_contact_button")}
      />
    </div>
  );
}
