import { QueryClient, QueryFunctionContext, QueryObserver } from "react-query";
import { useEffect, useState } from "react";
import { isEqual } from "lodash";

export interface Config<TToken, TLoginParams> {
  tokenExpired: (token: TToken) => Promise<boolean>;
  refreshExpired: (token: TToken) => Promise<boolean>;
  sendLogin: (loginParams: TLoginParams) => Promise<TToken>;
  sendRefresh: (token: TToken) => Promise<TToken>;
  retry: (failCount: number, error: any) => boolean;
  refreshExpiredError: any;
  queryKey?: string;
  shouldRefreshOnBackground?: (token: TToken) => boolean;
}

function createTokenQuery<TToken, TLoginParams>({
  queryKey = "token",
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  refreshExpiredError,
  shouldRefreshOnBackground,
}: Config<TToken, TLoginParams>) {
  let tokenRefreshIntervalHandler: any;
  let tokenRefreshInterval: number;
  let queryClient: QueryClient;

  const getTokenFromStorage = () => {
    const storedValue = localStorage.getItem(queryKey);

    if (!storedValue) {
      return undefined;
    }

    let token: TToken | undefined;

    try {
      token = JSON.parse(storedValue);
      // eslint-disable-next-line no-empty
    } catch {}

    return token;
  };

  const setTokenValue = (token: TToken | undefined) => {
    if (token === undefined) {
      localStorage.removeItem(queryKey);
    } else {
      localStorage.setItem(queryKey, JSON.stringify(token));
    }

    queryClient.setQueryData(queryKey, token);
  };

  const refresh = async (throwOnError = false) => {
    const token = queryClient.getQueryData(queryKey) as TToken;

    const newToken = await queryClient.prefetchQuery(
      `temp-refresh-${queryKey}`,
      (_: QueryFunctionContext) => sendRefresh(token),
      { retry }
    );

    // If token is undefined then refresh has failed
    if (newToken !== undefined) {
      // @ts-ignore
      setTokenValue(newToken);
    }

    queryClient.removeQueries(`temp-refresh-${queryKey}`);

    return newToken;
  };

  const startBackgroundRefreshing = () => {
    clearInterval(tokenRefreshIntervalHandler);

    tokenRefreshIntervalHandler = setInterval(() => {
      refresh();
    }, tokenRefreshInterval);
  };

  const stopBackgroundRefreshing = () => {
    clearInterval(tokenRefreshIntervalHandler);
  };

  const login = async (loginParams: TLoginParams) => {
    const token = await queryClient.fetchQuery(
      `temp-login-${queryKey}`,
      (_: QueryFunctionContext) => sendLogin(loginParams),
      { retry }
    );

    if (tokenRefreshInterval) {
      startBackgroundRefreshing();
    }

    queryClient.removeQueries(`temp-login-${queryKey}`);

    return token;
  };

  const logout = async () => {
    setTokenValue(undefined);
    stopBackgroundRefreshing();
  };

  const useLogin = () => {
    const [data, setData] = useState<TToken | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<any | null>(null);

    const requestLogin = async (
      loginParams: TLoginParams,
      throwOnError = false
    ) => {
      setIsFetching(true);
      setData(null);
      setError(null);

      try {
        const token = await login(loginParams);

        setIsFetching(false);
        // @ts-ignore
        setData(token);
        // @ts-ignore
        setTokenValue(token);

        return token;
      } catch (loginError) {
        setIsFetching(false);
        setError(loginError);

        if (throwOnError) {
          throw loginError;
        }
      }

      return undefined;
    };

    return { data, isFetching, error, requestLogin };
  };

  const useToken = () => {
    const existingToken = queryClient.getQueryData(queryKey) as TToken;
    const [token, setToken] = useState<TToken | undefined>(existingToken);

    useEffect(() => {
      const observer = new QueryObserver(queryClient, {
        queryKey,
        enabled: false,
      });

      const unsubscribe = observer.subscribe((result) => {
        if (result.data && !isEqual(token, result.data)) {
          // @ts-ignore
          setToken(newToken);
        }
      });

      return () => {
        unsubscribe();
      };
    });

    return token;
  };

  const getToken = async (force = false) => {
    const token = queryClient.getQueryData(queryKey) as TToken | undefined;

    if (token === undefined) return undefined;

    if (await refreshExpired(token)) {
      throw refreshExpiredError;
    }

    if ((await tokenExpired(token)) || force) {
      return await refresh(true);
    }

    if (shouldRefreshOnBackground && shouldRefreshOnBackground(token)) {
      refresh();
    }

    return token;
  };

  const init = async (client: QueryClient, refreshInterval?: number) => {
    queryClient = client;

    if (refreshInterval) {
      tokenRefreshInterval = refreshInterval;
    }

    const token = getTokenFromStorage();

    if (!token || (await refreshExpired(token))) {
      setTokenValue(undefined);

      return;
    }

    setTokenValue(token);

    if (refreshInterval) {
      startBackgroundRefreshing();
    }
  };

  return { init, useLogin, useToken, logout, refresh, getToken };
}

export default createTokenQuery;
