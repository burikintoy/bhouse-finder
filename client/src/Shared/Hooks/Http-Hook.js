import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequest = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortControler = new AbortController();
      activeHttpRequest.current.push(httpAbortControler);
      try {
        const res = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortControler.signal,
        });

        const responseData = await res.json();

        activeHttpRequest.current = activeHttpRequest.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortControler
        );

        if (!res.ok) {
          throw new Error(responseData.message);
        }
        setIsLoading(false);
        return responseData;
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);
  return { isLoading, error, sendRequest, clearError };
};
