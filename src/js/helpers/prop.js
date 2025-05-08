export default function(key, obj) {
  return typeof obj === 'object' ? obj[key] : undefined;
}
