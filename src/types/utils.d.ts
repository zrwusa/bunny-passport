// Helper type to extract second-level keys
export type SecondLevelKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];
