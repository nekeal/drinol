import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";

import { ExampleComponent } from "components";
import { APP_ROUTES } from "commons/appRoutes";
import createTokenQuery from "commons/auth/tokenQuery";
import { TokenContext } from "commons/auth/tokenContext";

import "./Root.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      // suspense: true,
    },
  },
});

// const tokenQuery = createTokenQuery<
//   { access: string; refresh: string },
//   { username: string; password: string }
// >({
//   queryKey: "token",
//   tokenExpired: ({ access }) =>
//     axios
//       .post("/api/auth/jwt/verify/", {
//         token: access,
//       })
//       .then(({ data }) => data.code === "token_not_valid"),
//   refreshExpired: ({ refresh }) =>
//     axios
//       .post("/api/auth/jwt/verify/", {
//         token: refresh,
//       })
//       .then(({ data }) => data.code === "token_not_valid"),
//   sendLogin: (loginParams) =>
//     axios.post("/api/auth/jwt/create/", loginParams).then(({ data }) => data),
//   sendRefresh: ({ refresh }) =>
//     axios
//       .post("/api/auth/jwt/refresh/", {
//         refresh,
//       })
//       .then(({ data }) => data),
//   retry: () => false,
//   refreshExpiredError: new Error("401-Refresh token expired"),
//   shouldRefreshOnBackground: () => false,
// });

export const Root = () => {
  // useEffect(() => {
  //   tokenQuery.init(queryClient);
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/*<TokenContext.Provider value={tokenQuery}>*/}
      <Suspense fallback={<div>Loading...</div>}>
        <Router>
          <Switch>
            <Route path={APP_ROUTES.MAIN} exact>
              <ExampleComponent />
            </Route>
          </Switch>
        </Router>
      </Suspense>
      {/*</TokenContext.Provider>*/}
    </QueryClientProvider>
  );
};
