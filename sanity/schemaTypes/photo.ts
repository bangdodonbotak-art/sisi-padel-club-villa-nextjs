import { defineField, defineType } from "sanity";

/**
 * photo — mirrors content/photos.json + src/lib/content.ts PhotosContent.
 * Covers the 8 Vibe slides (7 images + 1 video) and the 3 Stay photos.
 * Local image/video files live in public/assets/; in Sanity the same
 * entries are image assets (video slides keep their file reference in
 * `videoSrc` until a Sanity-hosted video is provided).
 */
export const photo = defineType({
  name: "photo",
  title: "Photo / media",
  type: "document",
  fields: [
    defineField({
      name: "section",
      title: "Section",
      type: "string",
      options: {
        list: [
          { title: "Vibe slider", value: "vibe" },
          { title: "Stay grid", value: "stay" },
          { title: "Villa reel", value: "villaReel" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "videoSrc",
      title: "Video file path (for video kind)",
      type: "string",
      description: "e.g. /assets/videos/padel-21s.mp4",
    }),
    defineField({ name: "label", title: "Top-left label", type: "localeString" }),
    defineField({ name: "badge", title: "Top-right badge", type: "localeString" }),
    defineField({ name: "caption", title: "Bottom caption", type: "localeString" }),
    defineField({ name: "alt", title: "Alt text", type: "localeString" }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "label.id", subtitle: "section", media: "image" },
  },
});
