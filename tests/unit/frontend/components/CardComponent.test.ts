import { test, expect, describe } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CardComponent from "~/components/CardComponent.vue";

describe("CardComponent", () => {
    test("Render card component", async () => {
        const component = await mountSuspended(CardComponent, {
            slots: { default: () => "Testing content" },
        });
        expect(component.text()).toBe("Testing content");
        expect(component.html()).toBe(
            '<div class="p-5 rounded dark:bg-neutral-800 bg-neutral-100 overflow-x-visible overflow-y-auto">Testing content</div>',
        );
    });
});
