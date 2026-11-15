import { defineField, defineType } from "sanity";

/**
 * localeString — reusable bilingual string object.
 * Mirrors the local content shape: every user-facing string exists in
 * both `id` (Indonesian, default) and `en` (English).
 */
export const localeString = defineType({
  name: "localeString",
  title: "Bilingual text",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Indonesian",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "en",
      title: "English",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});
