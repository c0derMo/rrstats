export function normalizeName(name: string) {
    return name.toLowerCase().replaceAll(/\W/g, "_");
}
