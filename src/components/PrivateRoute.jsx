import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Auth from "./Auth";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Загрузка...</div>
    );
  }

  return user ? children : <Auth />;
};

export default PrivateRoute;
