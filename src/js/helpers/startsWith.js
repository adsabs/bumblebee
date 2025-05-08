export default function(str, prefix) {
  return typeof str === 'string' && typeof prefix === 'string' ? str.startsWith(prefix) : false;
}
