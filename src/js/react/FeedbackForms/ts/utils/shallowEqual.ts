export default function shallowEqual<T extends object>(
  objA: T,
  objB: T
): boolean {
  if (objA === objB) return true;
  if (!objA || !objB) return false;

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (
      (objA as any)[key] !== (objB as any)[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}
