import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemText,
  Box,
  CssBaseline,
  Button,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface DataResponse {
  data?: string;
  detail?: string;
}

const drawerWidth = 240;

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState<DataResponse | string>("");
  const navigate = useNavigate();
  console.log(data);

  useEffect(() => {
    if (!token) {
      setData("Unauthorized");
      return;
    }

    axios
      .get("http://localhost:8000/protected", {
        params: { token },
      })
      .then((response) => setData(response.data))
      .catch(() => setData("Unauthorized"));
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton  onClick={() => navigate("/")}>
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton  onClick={() => navigate("/ifc-viewer")}>
            <ListItemText primary="IFC Viewer" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>
          Data
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
