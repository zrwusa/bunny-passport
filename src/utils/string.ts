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
