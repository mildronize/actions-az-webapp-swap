export function isEmptyString(value: string) {
  if (value === undefined) return true;
  if (value === null) return true;
  if (value === '') return true;
  return false;
}
