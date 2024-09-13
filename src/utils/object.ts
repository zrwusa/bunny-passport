export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const newObj = { ...obj };

  keys.forEach((key) => {
    delete newObj[key];
  });

  return newObj;
}

// Helper function to resolve the path
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
}
