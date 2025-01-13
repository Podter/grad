export const omit = <
  T extends Record<string, unknown> | object,
  // biome-ignore lint/suspicious/noExplicitAny: generic type
  K extends keyof any,
>(
  inputObj: T,
  ...keys: K[]
): Omit<T, K> => {
  const keysSet = new Set(keys);
  return Object.fromEntries(
    // biome-ignore lint/suspicious/noExplicitAny: generic type
    Object.entries(inputObj).filter(([k]) => !keysSet.has(k as any)),
    // biome-ignore lint/suspicious/noExplicitAny: generic type
  ) as any;
};

export const pick = <
  T extends Record<string, unknown> | object,
  K extends keyof T,
>(
  inputObj: T,
  ...keys: K[]
): Pick<T, K> => {
  const keysSet = new Set(keys);
  return Object.fromEntries(
    // biome-ignore lint/suspicious/noExplicitAny: generic type
    Object.entries(inputObj).filter(([k]) => keysSet.has(k as any)),
    // biome-ignore lint/suspicious/noExplicitAny: generic type
  ) as any;
};
