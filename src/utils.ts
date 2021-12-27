function getJSONPath(obj, path) {
    let split = path.split(".").reverse();
    let response = obj;
    while(split.length > 0) {
        response = response[split.pop()];
    }
    return response;
}

function setJSONPath(obj, path, value) {
    let split = path.split(".").reverse();
    let response = obj;
    while(split.length > 1) {
        response = response[split.pop()];
    }
    response[split.pop()] = value;
}

const mapAbbreviationToArrayIndex = (abv) => {
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
        
        default:
            return "Unknown"
    }
}

export function jsonDiff(beforeObj: object, afterObj: object): object {
    let result = {}
    for(let key of Object.keys(beforeObj).concat(Object.keys(afterObj))) {
        if(key.startsWith("$") || key.startsWith("_")) continue;
        if(typeof beforeObj[key] === 'object' && typeof afterObj[key] === 'object') {
            let tmp = jsonDiff(beforeObj[key], afterObj[key]);
            if(tmp !== {}) result[key] = tmp;
        } else {
            let compareBefore = beforeObj[key].toString();
            let compareAfter = afterObj[key].toString();
            if(typeof beforeObj[key].toISOString === 'function') compareBefore = beforeObj[key].toISOString();
            if(typeof afterObj[key].toISOString === 'function') compareAfter = afterObj[key].toISOString();
            if(compareBefore !== compareAfter) {
                result[key] = {before: beforeObj[key], after: afterObj[key]}
            }
        }
    }
    return result
}

export { getJSONPath };
export { setJSONPath };
export { mapAbbreviationToArrayIndex };