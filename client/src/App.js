import React, { useState, useCallback, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import NewPlaces from "./Places/Pages/NewPlaces";
import UserPlaces from "./Places/Pages/UserPlaces";
import User from "./User/Pages/User";
import UpdatePlace from "./Places/Pages/UpdatePlace";
import Authenticate from "./User/Pages/Authenticate";
import LoadingSpinner from "./Shared/Components/UIElements/LoadingSpinner";
import MainNavigation from "./Shared/Components/Navigation/MainNavigation";
import { AuthContext } from "./Shared/Context/Auth-Context";

// const User = React.lazy(() => import("./User/Pages/User"));
// const NewPlaces = React.lazy(() => import("./Places/Pages/NewPlaces"));
// const UserPlaces = React.lazy(() => import("./Places/Pages/UserPlaces"));
// const UpdatePlace = React.lazy(() => import("./Places/Pages/UpdatePlace"));
// const Authenticate = React.lazy(() => import("./User/Pages/Authenticate"));

let logoutTimer;

function App() {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
    setUserId(uid);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact component={User} />
        <Route path="/:userId/places" exact component={UserPlaces} />
        <Route path="/places/new" exact component={NewPlaces} />
        <Route path="/places/:placeId" component={UpdatePlace} />
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact component={User} />
        <Route path="/:userId/places" exact component={UserPlaces} />
        <Route path="/auth" component={Authenticate} />
        <Redirect to="/auth" />
      </Switch>
    );
  }
  return (
    <>
      <AuthContext.Provider
        value={{
          isLoggedIn: !!token,
          token: token,
          userId: userId,
          login: login,
          logout: logout,
        }}
      >
        <Router>
          <MainNavigation />
          <main>
            <Suspense
              fallback={
                <div className="center">
                  <LoadingSpinner />
                </div>
              }
            >
              {routes}
            </Suspense>
          </main>
        </Router>
      </AuthContext.Provider>
    </>
  );
}

export default App;
