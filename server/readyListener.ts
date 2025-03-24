let _isReady = false;

export function isReady() {
    return _isReady;
}

export function setReady(ready: boolean) {
    _isReady = ready;
}
