"use client";

/**
 * Faq — 4 tabs, 7 Q&As (content-spec §2.8). Tab 1 (courts) active by
 * default. A3 is the reworded version with a single WhatsApp mention
 * (§6 #14–16) as stored in the content layer.
 */
import { useState } from "react";
import { getFaq, getSite, type Locale } from "@/lib/content";

export default function Faq({ locale }: { locale: Locale }) {
  const faq = getFaq(locale);
  const site = getSite(locale);
  const [activeTab, setActiveTab] = useState(faq.tabs[0]?.id ?? "courts");
  const items = faq.items.filter((item) => item.tab === activeTab);

  return (
    <section
      id="faq"
      className="relative bg-sand px-6 pb-24 text-jungle sm:px-10 sm:pb-32"
    >
      <div className="mx-auto max-w-5xl border-t border-jungle/15 pt-12">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-turf uppercase">
              {site.faq.label}
            </span>
            <h2 className="font-display text-5xl font-bold sm:text-7xl">
              {site.faq.heading}
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
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors ${
                activeTab === tab.id
                  ? "bg-turf text-sand"
                  : "bg-[#E5DEC9] text-jungle hover:bg-jungle/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-jungle/15 bg-[#E5DEC9]/70 p-6"
            >
              <h3 className="font-display text-2xl font-bold">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-jungle/80">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
