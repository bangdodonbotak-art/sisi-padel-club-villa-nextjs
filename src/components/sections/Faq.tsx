"use client";

/**
 * Faq — 4 tabs, 7 Q&As (content-spec §2.8). Tab 1 (courts) active by
 * default. A3 is the reworded version with a single WhatsApp mention
 * (§6 #14–16) as stored in the content layer.
 *
 * Motion (Task C): each Q&A is an accordion — the question is a button,
 * the answer opens/closes with a slow height + opacity animation, and
 * items reveal with a stagger when their tab becomes visible. Answers
 * stay mounted (height 0 + overflow hidden when closed) so every
 * answer remains in the SSR HTML for the FAQPage JSON-LD — same SEO
 * guarantee as before, only the visual state is collapsible now.
 * Static under prefers-reduced-motion.
 */
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getFaq, getSite, type Locale } from "@/lib/content";
import WordReveal from "./WordReveal";

export default function Faq({ locale }: { locale: Locale }) {
  const faq = getFaq(locale);
  const site = getSite(locale);
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(faq.tabs[0]?.id ?? "courts");
  // First item of the active tab open by default; switching tabs opens
  // that tab's first item.
  const [openId, setOpenId] = useState<string | null>(
    faq.items.find((item) => item.tab === (faq.tabs[0]?.id ?? "courts"))
      ?.id ?? null,
  );

  // SEO audit 2026-11-16: render ALL tabs' Q&As into the DOM (inactive
  // tabs are `hidden`, never unmounted) so every answer is in the SSR
  // HTML — that is what makes the FAQPage JSON-LD in the layout
  // legitimate. Visual behaviour is unchanged: only the active tab shows.
  const tabGroups = faq.tabs.map((tab) => ({
    tab,
    items: faq.items.filter((item) => item.tab === tab.id),
  }));

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    setOpenId(faq.items.find((item) => item.tab === tabId)?.id ?? null);
  };

  return (
    <section
      id="faq"
      className="relative px-6 pb-24 text-sand sm:px-10 sm:pb-32"
    >
      <div className="mx-auto max-w-5xl border-t border-sand/15 pt-12">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {site.faq.label}
            </span>
            <h2 className="font-display text-4xl font-bold sm:text-6xl">
              <WordReveal text={site.faq.heading} />
            </h2>
          </div>
        </div>

        <div
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label={site.faq.heading}
        >
          {faq.tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => selectTab(tab.id)}
              className={`min-h-[44px] rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors ${
                activeTab === tab.id
                  ? "bg-turf text-sand"
                  : "bg-sand/10 text-sand hover:bg-sand/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {tabGroups.map(({ tab, items }) => (
          <div key={tab.id} hidden={tab.id !== activeTab} className="space-y-4">
            {items.map((item, i) => {
              const open = openId === item.id;
              const answerId = `faq-answer-${item.id}`;
              const card = (
                <div className="rounded-2xl border border-sand/20 bg-jungle/55 p-6 backdrop-blur-sm">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-4 text-left"
                  >
                    <h3 className="font-display text-2xl font-bold">
                      {item.question}
                    </h3>
                    <span
                      aria-hidden
                      className={`shrink-0 text-2xl leading-none font-light text-lime transition-transform duration-500 ease-out ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {reduceMotion ? (
                    <div
                      id={answerId}
                      style={{ display: open ? undefined : "none" }}
                    >
                      <p className="mt-2 text-sm text-sand/80">
                        {item.answer}
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      id={answerId}
                      initial={false}
                      animate={{
                        height: open ? "auto" : 0,
                        opacity: open ? 1 : 0,
                      }}
                      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-sm text-sand/80">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              );

              if (reduceMotion) {
                return <div key={item.id}>{card}</div>;
              }
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.09,
                    ease: "easeOut",
                  }}
                >
                  {card}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
