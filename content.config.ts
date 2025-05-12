import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
    collections: {
        changelog: defineCollection({
            type: "page",
            source: "changelog/**/*.md",
            schema: z.object({
                date: z.number(),
                major: z.boolean(),
                version: z.string(),
                versionTitle: z.string(),
            }),
        }),
    },
});
