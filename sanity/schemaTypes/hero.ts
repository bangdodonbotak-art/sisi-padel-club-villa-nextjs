import { defineField, defineType } from "sanity";

/**
 * hero — mirrors the hero copy in messages/id.json + messages/en.json.
 * The hero FRAMES and the ball are frozen 1:1 (content-spec §0) and are
 * NOT Sanity-managed — only the text layer (eyebrow, headline, subcopy,
 * CTAs, preloader copy) lives here. Singleton: one hero document.
 */
export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
    defineField({
      name: "headlineLine1",
      title: "Headline line 1",
      type: "localeString",
    }),
    defineField({
      name: "headlineLine2",
      title: "Headline line 2 (italic, lime)",
      type: "localeString",
    }),
    defineField({ name: "subcopy", title: "Subcopy", type: "localeString" }),
    defineField({
      name: "primaryCta",
      title: "Primary CTA label (WhatsApp)",
      type: "localeString",
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA label",
      type: "localeString",
    }),
    defineField({
      name: "metaLeft",
      title: "Meta bar left",
      type: "localeString",
    }),
    defineField({
      name: "metaRight",
      title: "Meta bar right (coordinates)",
      type: "string",
      initialValue: "-8.49769243, 115.30430716",
    }),
    defineField({
      name: "preloaderTopLeft",
      title: "Preloader top-left",
      type: "localeString",
    }),
    defineField({
      name: "preloaderUnderCounter",
      title: "Preloader under counter",
      type: "localeString",
    }),
  ],
  preview: {
    select: { title: "eyebrow.id" },
  },
});
