import { defineField, defineType } from "sanity";

/**
 * faq — mirrors content/faq.json + src/lib/content.ts FaqContent.
 * Tabs are fixed (courts / booking / amenities / location); each item
 * belongs to one tab. The booking-tab answer must stay WhatsApp-only —
 * no booking-platform links (see content-spec §6).
 */
export const faq = defineType({
  name: "faq",
  title: "FAQ item",
  type: "document",
  fields: [
    defineField({
      name: "tab",
      title: "Tab",
      type: "string",
      options: {
        list: [
          { title: "1. Lapangan / Courts", value: "courts" },
          { title: "2. Booking & Sesi / Booking & Sessions", value: "booking" },
          { title: "3. Fasilitas / Amenities", value: "amenities" },
          { title: "4. Lokasi & Villa / Location & Villa", value: "location" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "question",
      title: "Question",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "question.id", subtitle: "tab" },
  },
});
