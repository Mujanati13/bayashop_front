import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import DashboardPage from "./pages/dashboard";
import SearchPage from "./components/home-client/searchFun";
import { CartProvider } from "./components/home-client/cartReducer";

function App() {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists

  return (
    <Router>
      <Routes>
        {/* Redirect to /home if authenticated, otherwise show Login */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
        />
        {/* Redirect to /admin if authenticated and trying to access /login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/admin" /> : <Login />}
        />
        {/* Protect /home route */}
        <Route
          path="/home"
          element={true ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/collections"
          element={
            true ? (
              <CartProvider>
                <SearchPage />
              </CartProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Protect /admin route */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
