import { useState, useEffect, useCallback } from 'react';

const useAsync = (asyncFn: () => Promise<any>, immediate = true) => {
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  // The execute function wraps asyncFn and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFn changes.
  const execute = useCallback(() => {
    setPending(true);
    setValue(null);
    setError(null);
    return asyncFn()
      .then((response) => setValue(response))
      .catch((_error) => setError(_error))
      .finally(() => setPending(false));
  }, [asyncFn]);

  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, pending, value, error };
};

export default useAsync;
