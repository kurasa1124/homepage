export function deepClone(val: any) {
  return JSON.parse(JSON.stringify(val));
}
