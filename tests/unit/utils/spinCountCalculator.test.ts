import { expect, test, describe } from "vitest";

describe("spinCountCalculator", () => {
    test("calculatePossibleSpinAmount", () => {
        const disguises = ["a", "b", "c", "d", "e", "f"];
        const methods = {
            "Target A": [
                "Knife",
                "Pistol",
                "Loud SMG Elimination",
                "Sniper Rifle",
            ],
            "Target B": ["Screwdriver", "Explosive (Weapon)", "Sniper Rifle"],
        };

        // Calculations by hand:
        // 6 * 5 = 30 Disguise Options
        // 4 NTKO Options
        // 3 * 2 = 6 Kill Method options
        // -1 Kill Method option where both are the same (Sniper Rifle - Sniper Rifle)

        const spinsAmount = calculatePossibleSpinAmount(disguises, methods);
        expect(spinsAmount).toEqual({
            disguises: 30,
            ntkos: 4,
            methods: 5,
        });
    });
});
