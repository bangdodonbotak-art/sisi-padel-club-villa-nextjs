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
 *
 * Motion (Task C): a slow breathing glow on the WhatsApp card, a soft
 * ring that glides from one picker step to the next as the visitor
 * progresses (court → day → time), a staggered reveal of the form
 * blocks, and a gentle tap scale on chips. All static under
 * prefers-reduced-motion.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getSite, siteFacts, type Locale } from "@/lib/content";
import WordReveal from "./WordReveal";

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

/** Staggered fade/slide-in for one form block. Static when reduced motion. */
function FadeItem({
  children,
  delay,
  reduceMotion,
  className,
}: {
  children: ReactNode;
  delay: number;
  reduceMotion: boolean;
  className?: string;
}) {
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Soft ring around the picker step the visitor is on. The ring fades
 * between steps (0.8s) instead of snapping, so court → day → time
 * feels like one continuous flow. Static (no ring) when reduced motion.
 */
function StepRing({
  active,
  reduceMotion,
  children,
  className,
}: {
  active: boolean;
  reduceMotion: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={`relative ${className ?? ""}`}>
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="pointer-events-none absolute -inset-2 rounded-3xl border border-lime/40 shadow-[0_0_28px_rgba(217,255,63,0.12)]"
      />
      {children}
    </motion.div>
  );
}

function Chip({
  selected,
  onClick,
  reduceMotion,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const className = `inline-flex min-h-[44px] items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
    selected
      ? "border-lime bg-lime font-semibold text-jungle"
      : "border-sand/25 bg-transparent text-sand hover:border-lime/60 hover:text-sand"
  }`;
  if (reduceMotion) {
    return (
      <button type="button" aria-pressed={selected} onClick={onClick} className={className}>
        {children}
      </button>
    );
  }
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * Sequential step tracker above the composer form (Dony 17 Nov 2026,
 * Tidepool reference video 2: checklist items fill in one by one).
 * Each finished step turns lime and draws its check; the connector
 * line fills as the visitor progresses court → day → time. States
 * only (no animation) under prefers-reduced-motion. aria-hidden: the
 * same steps are already the form's labelled fieldsets.
 */
function StepTracker({
  activeStep,
  locale,
  reduceMotion,
}: {
  activeStep: number;
  locale: Locale;
  reduceMotion: boolean;
}) {
  const labels =
    locale === "id"
      ? ["Lapangan", "Tanggal", "Jam"]
      : ["Court", "Date", "Time"];
  return (
    <div className="mb-6" aria-hidden="true">
      <div className="flex items-start">
        {labels.map((label, i) => {
          const step = i + 1;
          const done = step < activeStep;
          const current = step === activeStep;
          const segmentDone = activeStep > step;
          return (
            <div
              key={label}
              className={`flex items-start ${i < labels.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-500 ${
                    done
                      ? "border-lime bg-lime text-jungle"
                      : current
                        ? "border-lime text-lime"
                        : "border-sand/25 text-sand/50"
                  }`}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      {reduceMotion ? (
                        <path d="M5 12l5 5 9-10" />
                      ) : (
                        <motion.path
                          d="M5 12l5 5 9-10"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                      )}
                    </svg>
                  ) : (
                    step
                  )}
                </span>
                <span
                  className={`text-[10px] tracking-wider whitespace-nowrap uppercase ${
                    done || current ? "text-sand" : "text-sand/50"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < labels.length - 1 && (
                <div className="relative mx-2 mt-4 h-0.5 flex-1 bg-sand/15">
                  {reduceMotion ? (
                    <div
                      className="absolute inset-y-0 left-0 bg-lime"
                      style={{ width: segmentDone ? "100%" : "0%" }}
                    />
                  ) : (
                    <motion.div
                      className="absolute inset-y-0 left-0 w-full origin-left bg-lime"
                      initial={false}
                      animate={{ scaleX: segmentDone ? 1 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Booking({ locale }: { locale: Locale }) {
  const site = getSite(locale);
  const { booking } = site;
  const reduceMotion = useReducedMotion() ?? false;

  const [name, setName] = useState("");
  const [court, setCourt] = useState(booking.fields.courtOptions[0]);
  const [date, setDate] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [days, setDays] = useState<DayOption[] | null>(null);
  const [time, setTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  // Which picker step the visitor is on: 1 court → 2 day → 3 time → 4 done.
  const [activeStep, setActiveStep] = useState(1);

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
              <WordReveal text={booking.heading} />
            </h2>
            <p className="text-sm text-sand/85 sm:text-base">
              {booking.intro}
            </p>

            <div className="relative rounded-3xl border border-sand/20 bg-jungle/60 p-6">
              {/* Slow breathing glow — 4.5s loop, soft lime, never a blink. */}
              {!reduceMotion && (
                <motion.div
                  aria-hidden
                  animate={{
                    boxShadow: [
                      "0 0 20px 0 rgba(217,255,63,0.10)",
                      "0 0 44px 6px rgba(217,255,63,0.20)",
                      "0 0 20px 0 rgba(217,255,63,0.10)",
                    ],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute -inset-px rounded-3xl"
                />
              )}
              <div className="relative space-y-4">
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
          </div>

          {/* Right column: WhatsApp composer form */}
          <div className="rounded-3xl border border-sand/20 bg-jungle p-6 text-sand sm:p-9 lg:col-span-7">
            <div className="mb-6 flex items-center justify-between gap-2 border-b border-sand/15 pb-5">
              <div>
                <span className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">
                  {booking.composerLabel}
                </span>
                <h3 className="font-display mt-0.5 text-3xl font-bold sm:text-4xl">
                  <WordReveal text={booking.composerTitle} delay={0.1} />
                </h3>
              </div>
              <span className="rounded-full bg-sand/10 px-3 py-1 font-mono text-xs whitespace-nowrap text-sand/80">
                {booking.hoursPill}
              </span>
            </div>

            <StepTracker
              activeStep={activeStep}
              locale={locale}
              reduceMotion={reduceMotion}
            />

            <form id="wa-composer-form" onSubmit={onSubmit} className="space-y-5">
              <FadeItem delay={0} reduceMotion={reduceMotion}>
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
                  <StepRing active={activeStep === 1} reduceMotion={reduceMotion}>
                    <fieldset>
                      <legend className="mb-1.5 text-xs tracking-wider text-sand/75 uppercase">
                        {booking.fields.courtLabel}
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {booking.fields.courtOptions.map((option) => (
                          <Chip
                            key={option}
                            selected={court === option}
                            reduceMotion={reduceMotion}
                            onClick={() => {
                              setCourt(option);
                              setActiveStep(2);
                            }}
                          >
                            {option}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  </StepRing>
                </div>
              </FadeItem>

              <FadeItem delay={0.09} reduceMotion={reduceMotion}>
                <StepRing active={activeStep === 2} reduceMotion={reduceMotion}>
                  <fieldset>
                    <legend className="mb-1.5 text-xs tracking-wider text-sand/75 uppercase">
                      {booking.fields.dateLabel}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        selected={selectedDay === null}
                        reduceMotion={reduceMotion}
                        onClick={() => {
                          setSelectedDay(null);
                          setDate("");
                          setActiveStep(3);
                        }}
                      >
                        {booking.flexible}
                      </Chip>
                      {days?.map((day, i) => (
                        <Chip
                          key={day.key}
                          selected={selectedDay === i}
                          reduceMotion={reduceMotion}
                          onClick={() => {
                            setSelectedDay(i);
                            setDate(day.value);
                            setActiveStep(3);
                          }}
                        >
                          {day.chipLabel}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                </StepRing>
              </FadeItem>

              <FadeItem delay={0.18} reduceMotion={reduceMotion}>
                <StepRing active={activeStep === 3} reduceMotion={reduceMotion}>
                  <fieldset>
                    <legend className="mb-1.5 text-xs tracking-wider text-sand/75 uppercase">
                      {booking.fields.timeLabel}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        selected={selectedSlot === null}
                        reduceMotion={reduceMotion}
                        onClick={() => {
                          setSelectedSlot(null);
                          setTime("");
                          setActiveStep(4);
                        }}
                      >
                        {booking.flexible}
                      </Chip>
                      {TIME_SLOTS.map((slot) => (
                        <Chip
                          key={slot.start}
                          selected={selectedSlot === slot.start}
                          reduceMotion={reduceMotion}
                          onClick={() => {
                            setSelectedSlot(slot.start);
                            setTime(`${slot.start} - ${slot.end}`);
                            setActiveStep(4);
                          }}
                        >
                          {slot.start} – {slot.end}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                </StepRing>
              </FadeItem>

              <FadeItem delay={0.27} reduceMotion={reduceMotion}>
                <p className="text-xs leading-relaxed text-sand/70">
                  {booking.requestNote}
                </p>
              </FadeItem>

              <FadeItem delay={0.36} reduceMotion={reduceMotion}>
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
              </FadeItem>

              <FadeItem delay={0.45} reduceMotion={reduceMotion}>
                <button
                  type="submit"
                  className="w-full rounded-full bg-lime px-6 py-4 text-xs font-semibold tracking-[0.15em] text-jungle uppercase transition-opacity hover:opacity-95 sm:text-sm"
                >
                  {booking.submit}
                </button>
              </FadeItem>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
