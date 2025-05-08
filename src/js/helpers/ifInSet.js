export default function(s, value, options) {
  if (s.has(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
}
