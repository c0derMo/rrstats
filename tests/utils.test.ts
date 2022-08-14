import {jsonDiff, mapAbbreviationToArrayIndex} from "../src/utils";

test("mapAbbreviationToArrayIndex - Correct calls", () => {
    expect(mapAbbreviationToArrayIndex("PAR")).toBe(0);
    expect(mapAbbreviationToArrayIndex("SAP")).toBe(1);
    expect(mapAbbreviationToArrayIndex("MAR")).toBe(2);
    expect(mapAbbreviationToArrayIndex("BKK")).toBe(3);
    expect(mapAbbreviationToArrayIndex("COL")).toBe(4);
    expect(mapAbbreviationToArrayIndex("HOK")).toBe(5);
    expect(mapAbbreviationToArrayIndex("MIA")).toBe(6);
    expect(mapAbbreviationToArrayIndex("SF")).toBe(7);
    expect(mapAbbreviationToArrayIndex("MUM")).toBe(8);
    expect(mapAbbreviationToArrayIndex("WC")).toBe(9);
    expect(mapAbbreviationToArrayIndex("SGA")).toBe(10);
    expect(mapAbbreviationToArrayIndex("NY")).toBe(11);
    expect(mapAbbreviationToArrayIndex("HAV")).toBe(12);
    expect(mapAbbreviationToArrayIndex("DUB")).toBe(13);
    expect(mapAbbreviationToArrayIndex("DAR")).toBe(14);
    expect(mapAbbreviationToArrayIndex("BER")).toBe(15);
    expect(mapAbbreviationToArrayIndex("CHO")).toBe(16);
    expect(mapAbbreviationToArrayIndex("MEN")).toBe(17);
    expect(mapAbbreviationToArrayIndex("AMB")).toBe(18);
});

test("mapAbbreviationToArrayIndex - Incorrect calls", () => {
    ["AAA", "PA", "", null, undefined, 12, "YES"].forEach((e) => {
        expect(mapAbbreviationToArrayIndex(e)).toBe("Unknown");
    })
});

/*
 *  Helper objects for JSON Diff
 */

const objectA = {
    "some": {
        "path": {
            "thats": {
                "nested": "no"
            }
        }
    },
    "someSamePath": 12,
    "somePathOnlyInOldObject": "still here"
}
const objectB = {
    "some": {
        "path": {
            "thats": {
                "nested": "well actually yes"
            }
        }
    },
    "someSamePath": 12,
    "somePathOnlyInNewObject": "now here"
}
const result = [{"newValue": "well actually yes", "oldValue":"no", "path": "some.path.thats.nested"}, {"newValue": "now here", "oldValue": undefined, "path": "somePathOnlyInNewObject"}];

const arrayChangesA = {
    "sameArray": [12, 34, 56],
    "differentOrder": [12, 34, 56],
    "newElements": [12, 34],
    "removedElements": [12, 34, 56]
}
const arrayChangesB = {
    "sameArray": [12, 34, 56],
    "differentOrder": [12, 56, 34],
    "newElements": [12, 34, 56],
    "removedElements": [12, 56]
}
const arrayResult = [{"newValue": 56, "oldValue": 34, "path": "differentOrder.1"}, {"newValue": 34, "oldValue": 56, "path": "differentOrder.2"}, {"newValue": 56, "oldValue": undefined, "path": "newElements.2"}, {"newValue": 56, "oldValue": 34, "path": "removedElements.1"}];

test("jsonDiff", () => {
    expect(jsonDiff({"abc": "abc"}, {"abc": "yes"})).toStrictEqual([{"newValue": "yes", "oldValue": "abc", "path": "abc"}]);
    expect(jsonDiff(objectA, objectB)).toStrictEqual(result);
    expect(jsonDiff(arrayChangesA, arrayChangesB)).toStrictEqual(arrayResult);
});
