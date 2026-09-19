export const CIPHER_MESSAGE = 'IROORZ WKH PXVLF DIWHU GDUN.';
export function decodeCaesar(message: string, shift: number): string {
  const step = ((Math.trunc(shift) % 26) + 26) % 26;
  return message.replace(/[A-Z]/g, letter => String.fromCharCode(65 + (letter.charCodeAt(0) - 65 - step + 26) % 26));
}
export const CIPHER_HINTS = ['Letters have wandered a few places ahead.', 'Try moving the alphabet backwards.', 'Three places back. A becomes X.'];
export const CIPHER_SOLUTION = 'FOLLOW THE MUSIC AFTER DARK.';
