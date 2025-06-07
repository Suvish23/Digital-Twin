import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./DashBoard";
import PrivateRoute from "../components/PrivateRoute";
import IFCViewer from "../components/IFCViewer";

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/ifc-viewer"
        element={
          <PrivateRoute>
            <IFCViewer />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default ProtectedRoutes;
