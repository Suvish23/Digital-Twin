import React, { useState } from "react";
import { useAuth } from "../authContext/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

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
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        {/* <Typography variant="h5" gutterBottom>
          Login
        </Typography> */}
         <Box mb={3} display="flex" justifyContent="center">
            <img
              src="/images/Logo.png"
              alt="Bauhaus University"
              style={{ maxWidth: "100%", marginBottom: "1rem" }}
            />
          </Box>

        <Box display="flex" flexDirection="column" gap={1.5}>
          <TextField
            label="Username"
            size="small"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            size="small"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
