/** Generate a v4 UUID. Browsers and Node 14.17+ both expose this. */
export const uuid = (): string => crypto.randomUUID();
