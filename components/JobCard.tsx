"use client";

import { useState } from "react";
import { MapPin, Clock, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { JobListing } from "@/data/jobs";
import ContactSellerModal from "./ContactSellerModal";

export default function JobCard({ job }: { job: JobListing }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-cream-card border border-steel-light rounded-xl p-5 flex flex-col">
      <h3 className="font-display font-semibold text-ink">{job.title}</h3>
      <p className="mt-2 text-sm text-ink/65 leading-relaxed flex-1">{job.description}</p>

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-ink/60">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} /> {job.location}
        </span>
        {job.duration && (
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {t("jobs_duration_label")}: {job.duration}
          </span>
        )}
        {job.payment && (
          <span className="flex items-center gap-1.5">
            <Wallet size={13} /> {t("jobs_payment_label")}: {job.payment}
          </span>
        )}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 w-full border border-moss/30 text-moss-dark font-semibold text-sm py-2.5 rounded-lg hover:bg-sage/50 transition-colors"
      >
        {t("jobs_contact_button")}
      </button>

      <ContactSellerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sellerId={job.posterId}
        listingId={job.id}
        buttonLabel={t("jobs_contact_button")}
      />
    </div>
  );
}
