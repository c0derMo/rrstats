import { DateTime } from "luxon";

const ILLEGAL_METHODS = [
    "Loud SMG Elimination",
    "Silenced SMG Elimination",
    "SMG Elimination",
    "Loud Pistol Elimination",
    "Silenced Pistol Elimination",
    "Pistol Elimination",
    "Loud Weapon Elimination",
    "Silenced Weapon Elimination",
    "Weapon Elimination",
    "Explosive (Weapon)",
];

const debug = false;

function printIfDebug(message: unknown) {
    if (debug) {
        console.log(message);
    }
}

export function calculatePossibleSpinAmount(
    disguises: string[],
    methods: Record<string, string[]>,
): { methods: number; disguises: number; ntkos: number } | null {
    const startTime = DateTime.now();
    const targetAmount = Object.keys(methods).length;

    if (disguises.length <= 0 || targetAmount <= 0) {
        return null;
    }

    let amountOfDisguiseCombinations = 1;
    for (let i = 0; i < targetAmount; i++) {
        amountOfDisguiseCombinations *= disguises.length - i;
    }

    printIfDebug(`Amount of targets: ${targetAmount}`);
    printIfDebug(`Amount of disguises: ${disguises.length}`);
    printIfDebug(`Amount of disguise options: ${amountOfDisguiseCombinations}`);

    const amountOfNTKOCombinations = Math.pow(2, targetAmount);
    printIfDebug(`Amount of NTKO options: ${amountOfNTKOCombinations}`);

    const validMethods = Object.values(methods).map((methods) => {
        return methods
            .filter((method) => !method.startsWith("Any "))
            .filter((method) => !ILLEGAL_METHODS.includes(method));
    });

    printIfDebug(
        `Amount of valid options for each target: ${validMethods.map(
            (methods) => methods.length,
        )}`,
    );
    for (const target of validMethods) {
        printIfDebug(target);
    }

    let amountOfMethodCombinations = validMethods
        .map((m) => m.length)
        .reduce((prev, cur) => prev * cur, 1);

    printIfDebug(
        `Initial guess as to how many options there are: ${amountOfMethodCombinations}`,
    );

    if (targetAmount > 1) {
        const flipOptions = nFlips(targetAmount).filter((option) => {
            if (option.every((b) => !b)) {
                return false; // All false -> unwanted
            }

            if (option.findIndex((b) => b) === option.findLastIndex((b) => b)) {
                return false; // Last and first index of true are the same -> only one true element -> unwanted
            }
            return true;
        });

        for (const option of flipOptions) {
            printIfDebug(`Checking option ${option}`);
            let intersection = validMethods.reduce(
                (prev, cur) => union(prev, cur),
                [],
            );
            let otherOptions = 1;

            for (let i = 0; i < targetAmount; i++) {
                if (option[i]) {
                    printIfDebug(`Adding ${i} to the intersection`);
                    // Option i is true -> part of intersection
                    intersection = intersect(intersection, validMethods[i]);
                } else {
                    printIfDebug(`Adding ${i} to the other options`);
                    // Option i is false -> part of other elements
                    otherOptions *= validMethods[i].length;
                }
            }
            printIfDebug(`Length of intersection: ${intersection.length}`);
            printIfDebug(`Other options: ${otherOptions}`);

            amountOfMethodCombinations -= intersection.length * otherOptions;
        }
    }

    printIfDebug(
        `Resulting guess as to how many options there are: ${amountOfMethodCombinations}`,
    );

    printIfDebug(`Time taken: ${startTime.diffNow().toHuman()}`);

    return {
        disguises: amountOfDisguiseCombinations,
        methods: amountOfMethodCombinations,
        ntkos: amountOfNTKOCombinations,
    };
}

function intersect(a: string[], b: string[]): string[] {
    if (a.length > b.length) {
        return a.filter((e) => b.indexOf(e) > -1);
    } else {
        return b.filter((e) => a.indexOf(e) > -1);
    }
}

function union(a: string[], b: string[]): string[] {
    return [...a, ...b].filter((e, i, c) => {
        return c.indexOf(e) === i; // Removes duplicates
    });
}

function nFlips(n: number): boolean[][] {
    if (n <= 0) {
        return [];
    }

    if (n === 1) {
        return [[true], [false]];
    }

    const temp = nFlips(n - 1);

    return temp
        .map((option) => {
            return [
                [true, ...option],
                [false, ...option],
            ];
        })
        .reduce((prev, cur) => [...prev, ...cur], []);
}
