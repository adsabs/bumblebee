import React from 'react';

export default function useDebounce(value: unknown, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState<typeof value>(
    value
  );

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
