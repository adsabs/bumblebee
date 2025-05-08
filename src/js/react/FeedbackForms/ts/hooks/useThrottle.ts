import React from 'react';

export default function useThrottle<T>(value: T, limit: number): T {
  const [throttleValue, setThrottleValue] = React.useState(value);
  const lastRun = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottleValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttleValue;
}
