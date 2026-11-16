import type { SiteMessages } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * Sessions — both 120-minute court cards + the Villa On Site card
 * (content-spec §2.7). Buttons go to WhatsApp / #booking (§6 #10–13);
 * the intro note is the reworded version (§6 #9). No prices anywhere.
 * Server component.
 */
export default function Sessions({
  sessions,
  asContinuation = false,
}: {
  sessions: SiteMessages["sessions"];
  /** Merged under Courts ("02 Courts & Sessions"): skip the label +
   * intro header row and render the heading as a subheading instead. */
  asContinuation?: boolean;
}) {
  return (
    <section
      id="plans"
      className="relative bg-sand px-6 py-24 text-jungle sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {asContinuation ? (
          <div className="border-b border-jungle/15 pb-10">
            <h3 className="font-display text-4xl font-bold sm:text-5xl">
              {sessions.heading}
            </h3>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-6 border-b border-jungle/15 pb-10 md:flex-row md:items-end">
            <div>
              <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-turf uppercase">
                {sessions.label}
              </span>
              <h2 className="font-display text-5xl font-bold sm:text-6xl md:text-7xl">
                {sessions.heading}
              </h2>
            </div>
            <p className="max-w-md text-sm text-jungle/80 sm:text-base">
              {sessions.intro}
            </p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {sessions.cards.map((card, index) => {
            const isMain = card.id === "main-court";
            const isVilla = card.id === "villa";
            return (
              <Reveal key={card.id} delay={index * 0.08}>
                <div
                  className={`flex h-full flex-col justify-between rounded-3xl border p-7 sm:p-8 ${
                    isMain
                      ? "border-jungle bg-jungle text-sand"
                      : "border-jungle/15 bg-[#E5DEC9]/80"
                  }`}
                >
                  <div>
                    <div
                      className={`mb-4 flex items-center justify-between text-xs font-semibold tracking-[0.18em] uppercase ${
                        isMain ? "text-lime" : "text-turf"
                      }`}
                    >
                      <span>{card.topLeft}</span>
                      <span>{card.topRight}</span>
                    </div>
                    <h3 className="font-display text-4xl font-bold sm:text-5xl">
                      {card.title}
                    </h3>
                    {"bullets" in card && card.bullets ? (
                      <ul className="mt-6 space-y-3 text-sm">
                        {card.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-center gap-2.5"
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${isMain ? "bg-lime" : "bg-turf"}`}
                            />
                            <span
                              className={isMain ? "text-sand/85" : "text-jungle/85"}
                            >
                              {bullet}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-5 text-sm leading-relaxed text-jungle/85">
                        {"body" in card ? card.body : ""}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 border-t border-jungle/15 pt-6">
                    <a
                      href={card.buttonUrl}
                      {...(card.buttonUrl.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={`inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-center text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${
                        isMain
                          ? "bg-lime text-jungle hover:opacity-90"
                          : isVilla
                            ? "bg-jungle text-sand hover:bg-turf"
                            : "bg-turf text-sand hover:bg-jungle hover:text-lime"
                      }`}
                    >
                      {card.button}
                    </a>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
