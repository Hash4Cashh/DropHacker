
export function getNonEmptyArray(defaultValue = [], ...arrs: Array<Array<any>>) {
    for(const arr of arrs) {
        if(arr.length !== 0) {
            return arr;
        }
    }
    return defaultValue;
}

export function isEmpty(value: any): boolean {
    if(Array.isArray(value)){
        return value.length === 0
    }
    return !value;
}