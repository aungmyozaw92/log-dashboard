import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import LogList from "./pages/LogList.jsx";
import UserList from "./pages/UserList.jsx";
import Login from "./pages/Login.jsx";

import PrivateRoute from "./components/PrivateRoute.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />

        {/* Private pages */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <PrivateRoute>
              <AuthLayout>
                <LogList />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AuthLayout>
                <UserList />
              </AuthLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
