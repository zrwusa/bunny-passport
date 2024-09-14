/**
 * Generate a unique 64-bit string type ID
 * @param size
 */
export function generateUuNumId(size = 18): string {
  const alphabet = '0123456789';
  let id = '';
  let i = size;
  while (i--) {
    id += alphabet[(Math.random() * alphabet.length) | 0];
  }
  return id;
}

export function isUpperSnakeCase(str: string): boolean {
  const regex = /^[A-Z]+(_[A-Z]+)*$/;
  return regex.test(str);
}

export function isCamelCase(str: string): boolean {
  const regex = /^[a-z]+([A-Z][a-z]*)*$/;
  return regex.test(str);
}

export function isSnakeCase(str: string): boolean {
  const regex = /^[a-z]+(_[a-z]+)*$/;
  return regex.test(str);
}

export function isPascalCase(str: string): boolean {
  const regex = /^[A-Z][a-z]*([A-Z][a-z]*)*$/;
  return regex.test(str);
}
