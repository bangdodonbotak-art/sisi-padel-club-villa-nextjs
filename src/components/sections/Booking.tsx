"use client";

/**
 * Booking — WhatsApp-first card + WhatsApp composer form
 * (content-spec §2.9, §6 #19–22). NO removed-booking-platform card,
 * title, link or button anywhere.
 *
 * Form: name + court/day/time pickers + notes, composed into the WA message.
 * Court, day and time are 3-step chip pickers (Saga Padel pattern):
 * court chips from booking.fields.courtOptions (same order as the old
 * select, first option the default), day chips = "Fleksibel" (default)
 * + the next 7 days in WITA, time chips = "Fleksibel" (default) + the
 * 120-minute slot grid 08:00–21:30. Slots are REQUESTS, not live
 * availability — the admin confirms on WhatsApp (booking.requestNote).
 * Defaults Tamu / Fleksibel / Fleksibel (08:00-21:30) from the content
 * layer, exact WA message template from booking.messageTemplate, opens
 * https://wa.me/628111592462?text={encoded} in a new tab. No success
 * screen/text — the old site has none.
 *
 * The 7 day chips are computed client-side AFTER mount (render only the
 * "Fleksibel" chip during SSR) so the server-rendered HTML never
 * disagrees with the visitor's date (no hydration mismatch).
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { getSite, siteFacts, type Locale } from "@/lib/content";

/** 120-minute slot grid, 08:00–21:30. 19:30 ends exactly at closing time. */
const TIME_SLOTS = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "12:00", end: "14:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
  { start: "18:00", end: "20:00" },
  { start: "19:30", end: "21:30" },
] as const;

type DayOption = {
  key: string;
  chipLabel: string;
  /** Full date value sent to WhatsApp, e.g. "Senin, 17 Nov 2026". */
  value: string;
};

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
        selected
          ? "border-lime bg-lime font-semibold text-jungle"
          : "border-sand/25 bg-transparent text-sand hover:border-lime/60 hover:text-sand"
      }`}
    >
      {children}
    </button>
  );
}

export default function Booking({ locale }: { locale: Locale }) {
  const site = getSite(locale);
  const { booking } = site;

  const [name, setName] = useState("");
  const [court, setCourt] = useState(booking.fields.courtOptions[0]);
  const [date, setDate] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [days, setDays] = useState<DayOption[] | null>(null);
  const [time, setTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Next 7 days in WITA (Asia/Makassar), computed after mount only.
  useEffect(() => {
    const intlLocale = locale === "id" ? "id-ID" : "en-GB";
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Makassar",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    const year = Number(parts.find((p) => p.type === "year")?.value);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    // Noon UTC anchor: formatting back through Asia/Makassar always
    // lands on the intended WITA calendar day.
    const base = Date.UTC(year, month - 1, day, 12, 0, 0);
    const chipFmt = new Intl.DateTimeFormat(intlLocale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Asia/Makassar",
    });
    const valueFmt = new Intl.DateTimeFormat(intlLocale, {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Makassar",
    });
    setDays(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(base + i * 86_400_000);
        return {
          key: d.toISOString(),
          chipLabel: chipFmt.format(d),
          value: valueFmt.format(d),
        };
      }),
    );
  }, [locale]);

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
      className="court-grid-lines relative px-6 py-24 text-sand sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Left column: WhatsApp-first card (replaces the old card) */}
          <div className="space-y-6 lg:col-span-5">
            <span className="block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {booking.label}
            </span>
            <h2 className="font-display text-5xl leading-none font-bold sm:text-6xl">
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

            <form id="wa-composer-form" onSubmit={onSubmit} className="space-y-5">
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
                <fieldset>
                  <legend className="mb-1.5 text-xs tracking-wider text-sand/75 uppercase">
                    {booking.fields.courtLabel}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {booking.fields.courtOptions.map((option) => (
                      <Chip
                        key={option}
                        selected={court === option}
                        onClick={() => setCourt(option)}
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
              </div>

              <fieldset>
                <legend className="mb-1.5 text-xs tracking-wider text-sand/75 uppercase">
                  {booking.fields.dateLabel}
                </legend>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    selected={selectedDay === null}
                    onClick={() => {
                      setSelectedDay(null);
                      setDate("");
                    }}
                  >
                    {booking.flexible}
                  </Chip>
                  {days?.map((day, i) => (
                    <Chip
                      key={day.key}
                      selected={selectedDay === i}
                      onClick={() => {
                        setSelectedDay(i);
                        setDate(day.value);
                      }}
                    >
                      {day.chipLabel}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-xs tracking-wider text-sand/75 uppercase">
                  {booking.fields.timeLabel}
                </legend>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    selected={selectedSlot === null}
                    onClick={() => {
                      setSelectedSlot(null);
                      setTime("");
                    }}
                  >
                    {booking.flexible}
                  </Chip>
                  {TIME_SLOTS.map((slot) => (
                    <Chip
                      key={slot.start}
                      selected={selectedSlot === slot.start}
                      onClick={() => {
                        setSelectedSlot(slot.start);
                        setTime(`${slot.start} - ${slot.end}`);
                      }}
                    >
                      {slot.start} – {slot.end}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <p className="text-xs leading-relaxed text-sand/70">
                {booking.requestNote}
              </p>

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
