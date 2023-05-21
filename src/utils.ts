export const VERSION = "2.5dev"

export function mapAbbreviationToArrayIndex(abv) {
    switch(abv) {
        // Season 1
        case "PAR":
            return 0
        case "SAP":
            return 1
        case "MAR":
            return 2
        case "BKK":
            return 3
        case "COL":
            return 4
        case "HOK":
            return 5

        // Season 2
        case "MIA":
            return 6
        case "SF":
            return 7
        case "MUM":
            return 8
        case "WC":
            return 9
        case "SGA":
            return 10
        case "NY":
            return 11
        case "HAV":
            return 12

        // Season 3
        case "DUB":
            return 13
        case "DAR":
            return 14
        case "BER":
            return 15
        case "CHO":
            return 16
        case "MEN":
            return 17
        case "AMB":
            return 18

        default:
            return "Unknown"
    }
}

export function mapSlugToAbbreviation(slug: string): string {
    switch (slug) {
        // Season 1
        case "the-showstopper":
            return "PAR"
        case "world-of-tomorrow":
            return "SAP"
        case "a-gilded-cage":
            return "MAR"
        case "club-27":
            return "BKK"
        case "freedom-fighters":
            return "COL"
        case "situs-inversus":
            return "HOK"

        // Season 2
        case "finish-line":
            return "MIA"
        case "three-headed-serpent":
            return "SF"
        case "chasing-a-ghost":
            return "MUM"
        case "another-life":
            return "WC"
        case "ark-society":
            return "SGA"
        case "golden-handshake":
            return "NY"
        case "the-last-resort":
            return "HAV"

        // Season 3
        case "on-top-of-the-world":
            return "DUB"
        case "death-in-the-family":
            return "DAR"
        case "apex-predator":
            return "BER"
        case "end-of-an-era":
            return "CHO"
        case "the-farewell":
            return "MEN"
        case "shadows-in-the-water":
            return "AMB"
    }
}

interface JsonChanges {
    path: string;
    oldValue?: unknown;
    newValue: unknown;
}

export function jsonDiff(oldObj: object, newObj: object, prefix=""): JsonChanges[] {
    let changes: JsonChanges[] = [];

    for(const key in newObj) {
        if(key.startsWith("_") || key.startsWith("$")) continue;
        if(typeof newObj[key] === "object") {
            if(oldObj[key] !== undefined) {
                changes = changes.concat(jsonDiff(oldObj[key] as object, newObj[key] as object, [prefix, key].join(".")));
            } else {
                changes.push({
                    path: [prefix, key].join(".").substr(1),
                    newValue: newObj[key]
                });
            }
        } else {
            if(oldObj[key] !== newObj[key]) {
                changes.push({
                    path: [prefix, key].join(".").substr(1),
                    oldValue: oldObj[key],
                    newValue: newObj[key]
                });
            }
        }
    }

    return changes;
}
