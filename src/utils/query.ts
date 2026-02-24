export type Primitive = string | number | boolean;

export function toQueryString(params: URLSearchParams): string {
    const value = params.toString();
    return value ? `?${value}` : '';
}

export function appendIfPresent(
    params: URLSearchParams,
    key: string,
    value: Primitive | null | undefined,
): void {
    if (value === null || value === undefined || value === '') {
        return;
    }
    params.append(key, String(value));
}

export function appendArrayIfPresent(
    params: URLSearchParams,
    key: string,
    values: Array<Primitive> | null | undefined,
): void {
    if (!values || values.length === 0) {
        return;
    }
    for (const value of values) {
        params.append(key, String(value));
    }
}
