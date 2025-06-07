import React, { useState } from "react";
import { useAuth } from "../authContext/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { login, token } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await login(username, password);
  };

 if (token) {
  return <Navigate to="/dashboard" replace />;
}


  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} value={username} />
      <input
        placeholder="Password"
        type="password"
        onChange={e => setPassword(e.target.value)}
        value={password}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
