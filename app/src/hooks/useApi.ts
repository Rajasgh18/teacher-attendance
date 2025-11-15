import { useState, useEffect, useCallback } from "react";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {},
): ApiState<T> & {
  execute: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    refreshing: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState(prev => ({ ...prev, data, loading: false }));
      onSuccess?.(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));

    try {
      const data = await apiCall();
      setState(prev => ({ ...prev, data, refreshing: false }));
      onSuccess?.(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState(prev => ({ ...prev, error: errorMessage, refreshing: false }));
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      refreshing: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refresh,
    reset,
  };
}

export function useApiWithParams<T, P>(
  apiCall: (params: P) => Promise<T>,
  params: P,
  options: UseApiOptions = {},
): ApiState<T> & {
  execute: (newParams?: P) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    refreshing: false,
  });

  const execute = useCallback(
    async (newParams?: P) => {
      const currentParams = newParams || params;
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await apiCall(currentParams);
        setState(prev => ({ ...prev, data, loading: false }));
        onSuccess?.(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        onError?.(errorMessage);
      }
    },
    [apiCall, params, onSuccess, onError],
  );

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));

    try {
      const data = await apiCall(params);
      setState(prev => ({ ...prev, data, refreshing: false }));
      onSuccess?.(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState(prev => ({ ...prev, error: errorMessage, refreshing: false }));
      onError?.(errorMessage);
    }
  }, [apiCall, params, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      refreshing: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refresh,
    reset,
  };
}
