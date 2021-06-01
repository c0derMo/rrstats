function _getJSONPath(obj, path) {
    let split = path.split(".").reverse();
    let response = obj;
    while(split.length > 0) {
        response = response[split.pop()];
    }
    return response;
}

function _setJSONPath(obj, path, value) {
    let split = path.split(".").reverse();
    let response = obj;
    while(split.length > 1) {
        response = response[split.pop()];
    }
    response[split.pop()] = value;
}

module.exports = {
    getJSONPath: _getJSONPath,
    setJSONPath: _setJSONPath
}