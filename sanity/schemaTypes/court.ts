import { defineField, defineType } from "sanity";

/**
 * court — mirrors content/courts.json + src/lib/content.ts Court.
 * One document per court (Upper Court / Main Court). No price field exists
 * anywhere — the source site states no prices; do not add one.
 */
export const court = defineType({
  name: "court",
  title: "Court",
  type: "document",
  fields: [
    defineField({
      name: "courtId",
      title: "Court ID",
      type: "slug",
      description: "Stable key, e.g. upper-court / main-court.",
      options: { source: "title.id" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "badge", title: "Badge", type: "string" }),
    defineField({ name: "tag", title: "Tag", type: "string" }),
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({ name: "body", title: "Body", type: "localeString" }),
    defineField({
      name: "footerLabel",
      title: "Footer label",
      type: "localeString",
    }),
    defineField({
      name: "footerLinkLabel",
      title: "Footer link label",
      type: "localeString",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "photoAlt",
      title: "Photo alt text",
      type: "localeString",
    }),
  ],
  preview: {
    select: { title: "title.id", subtitle: "badge" },
  },
});
