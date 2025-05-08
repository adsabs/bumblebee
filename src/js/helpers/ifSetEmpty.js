export default function(s, options) {
  if (s.size === 0) {
    return options.fn(this);
  }
  return options.inverse(this);
}
