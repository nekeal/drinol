import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import { APP_ROUTES } from "commons/appRoutes";
// import { Room } from "views";

import "./Root.css";

const queryClient = new QueryClient();

export const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <Router>
          <Switch>
            <Route path={APP_ROUTES.MAIN} exact>
              <div>Main route</div>
            </Route>
            <Route path={APP_ROUTES.SETTINGS} exact>
              <div>Settings route</div>
            </Route>
          </Switch>
        </Router>
      </Suspense>
    </QueryClientProvider>
  );
};
