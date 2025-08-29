export const emailRegex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
export const phoneRegex = /^\+[1-9]\d{7,14}$/;

export function isValidEmail(value: string): boolean {
  return emailRegex.test(value);
}

export function isValidE164Phone(value: string): boolean {
  return phoneRegex.test(value);
}
