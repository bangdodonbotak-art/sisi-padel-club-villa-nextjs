"use client";

/**
 * Booking — WhatsApp-first card + WhatsApp composer form
 * (content-spec §2.9, §6 #19–22). NO removed-booking-platform card,
 * title, link or button anywhere.
 *
 * Form: all 5 fields (wa-name / wa-court / wa-date / wa-time / wa-notes),
 * select options in order with the first as default, defaults Tamu /
 * Fleksibel / Fleksibel (08:00-21:30) from the content layer, exact WA
 * message template from booking.messageTemplate, opens
 * https://wa.me/628111592462?text={encoded} in a new tab. No success
 * screen/text — the old site has none.
 */
import { useState, type FormEvent } from "react";
import { getSite, siteFacts, type Locale } from "@/lib/content";

export default function Booking({ locale }: { locale: Locale }) {
  const site = getSite(locale);
  const { booking } = site;

  const [name, setName] = useState("");
  const [court, setCourt] = useState(booking.fields.courtOptions[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || booking.defaults.name;
    const finalDate = date || booking.defaults.date;
    const finalTime = time.trim() || booking.defaults.time;
    const notesPart = notes.trim()
      ? `\n• Catatan: ${notes.trim()}`
      : "";
    const message = booking.messageTemplate
      .replace("{nama}", finalName)
      .replace("{court}", court)
      .replace("{date}", finalDate)
      .replace("{time}", finalTime)
      .replace("{notes}", notesPart);
    window.open(
      `${siteFacts.whatsappUrl}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section
      id="booking"
      className="court-grid-lines relative bg-turf px-6 py-24 text-sand sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Left column: WhatsApp-first card (replaces the old card) */}
          <div className="space-y-6 lg:col-span-5">
            <span className="block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {booking.label}
            </span>
            <h2 className="font-display text-6xl leading-none font-bold sm:text-7xl">
              {booking.heading}
            </h2>
            <p className="text-sm text-sand/85 sm:text-base">
              {booking.intro}
            </p>

            <div className="space-y-4 rounded-3xl border border-sand/20 bg-jungle/60 p-6">
              <div className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">
                {booking.waCardLabel}
              </div>
              <p className="font-display text-3xl font-bold">
                {booking.waCardTitle}
              </p>
              <p className="text-sm text-sand/85">{booking.waCardBody}</p>
              <a
                href={booking.waCardButtonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-lime px-6 py-4 text-xs font-semibold tracking-[0.15em] text-jungle uppercase transition-opacity hover:opacity-90"
              >
                {booking.waCardButton}
              </a>
            </div>
          </div>

          {/* Right column: WhatsApp composer form */}
          <div className="rounded-3xl border border-sand/20 bg-jungle p-6 text-sand sm:p-9 lg:col-span-7">
            <div className="mb-6 flex items-center justify-between gap-2 border-b border-sand/15 pb-5">
              <div>
                <span className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">
                  {booking.composerLabel}
                </span>
                <h3 className="font-display mt-0.5 text-3xl font-bold sm:text-4xl">
                  {booking.composerTitle}
                </h3>
              </div>
              <span className="rounded-full bg-sand/10 px-3 py-1 font-mono text-xs whitespace-nowrap text-sand/80">
                {booking.hoursPill}
              </span>
            </div>

            <form id="wa-composer-form" onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="wa-name"
                    className="mb-1.5 block text-xs tracking-wider text-sand/75 uppercase"
                  >
                    {booking.fields.nameLabel}
                  </label>
                  <input
                    id="wa-name"
                    type="text"
                    placeholder={booking.fields.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-sand/20 bg-[#162F28] px-4 py-3 text-sm text-sand placeholder:text-sand/40 focus:border-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="wa-court"
                    className="mb-1.5 block text-xs tracking-wider text-sand/75 uppercase"
                  >
                    {booking.fields.courtLabel}
                  </label>
                  <select
                    id="wa-court"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="w-full rounded-xl border border-sand/20 bg-[#162F28] px-4 py-3 text-sm text-sand focus:border-lime focus:outline-none"
                  >
                    {booking.fields.courtOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="wa-date"
                    className="mb-1.5 block text-xs tracking-wider text-sand/75 uppercase"
                  >
                    {booking.fields.dateLabel}
                  </label>
                  <input
                    id="wa-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-sand/20 bg-[#162F28] px-4 py-3 text-sm text-sand focus:border-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="wa-time"
                    className="mb-1.5 block text-xs tracking-wider text-sand/75 uppercase"
                  >
                    {booking.fields.timeLabel}
                  </label>
                  <input
                    id="wa-time"
                    type="text"
                    placeholder={booking.fields.timePlaceholder}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-sand/20 bg-[#162F28] px-4 py-3 text-sm text-sand placeholder:text-sand/40 focus:border-lime focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="wa-notes"
                  className="mb-1.5 block text-xs tracking-wider text-sand/75 uppercase"
                >
                  {booking.fields.notesLabel}
                </label>
                <textarea
                  id="wa-notes"
                  rows={2}
                  placeholder={booking.fields.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-sand/20 bg-[#162F28] px-4 py-3 text-sm text-sand placeholder:text-sand/40 focus:border-lime focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-lime px-6 py-4 text-xs font-semibold tracking-[0.15em] text-jungle uppercase transition-opacity hover:opacity-95 sm:text-sm"
              >
                {booking.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
