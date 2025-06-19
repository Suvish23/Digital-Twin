import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import {AppBar,Toolbar,Typography, IconButton,Drawer,List,ListItemText,ListItemButton,Box,CssBaseline,InputBase,Badge,Button,Avatar, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { IFCViewer } from "../components/IFCViewer";

const drawerWidth = 240;

interface SensorData {
  sensor_name: string;
  channel_id: number;
  value: number;
  time: string;
}


const Dashboard = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState<any>("");
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedView, setSelectedView] = useState<"home" | "viewer" | "settings" | "sensors">("home");

  const navigate = useNavigate();

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

  useEffect(() => {
  if (selectedView === "sensors") {
    axios
      .get("http://localhost:8000/sensors", { params: { token } })
      
      .then((res) => setSensorData(res.data.sensors))
      .catch((err) => console.error("Failed to load sensors", err));
  }
}, [selectedView, token]);
console.log(sensorData)

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#fff", color: "#000" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton edge="start" onClick={toggleDrawer} color="inherit" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Dashboard
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ display: "flex", alignItems: "center", backgroundColor: "#f1f1f1", px: 2, borderRadius: 2 }}>
              <SearchIcon />
              <InputBase placeholder="Search…" sx={{ ml: 1 }} />
            </Box>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
  variant="persistent"
  open={isDrawerOpen}
  sx={{
    width: isDrawerOpen ? drawerWidth : 0,
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflowX: "hidden",
    transition: (theme) =>
      theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    "& .MuiDrawer-paper": {
      width: isDrawerOpen ? drawerWidth : 0,
      transition: (theme) =>
        theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      overflowX: "hidden",
      boxSizing: "border-box",
      backgroundColor: "#f9f9f9",
    },
  }}
>
        <Toolbar />
        <List>
          <ListItemButton onClick={() => setSelectedView("home")}>
          <DashboardIcon sx={{ mr: 2 }} />
          <ListItemText primary="Home" />
          </ListItemButton>

          <ListItemButton onClick={() => setSelectedView("viewer")}>
          <VisibilityIcon sx={{ mr: 2 }} />
          <ListItemText primary="BIM Viewer" />
          </ListItemButton>
          <ListItemButton onClick={() => setSelectedView("sensors")}>
          <SensorsRoundedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Sensors" />
          </ListItemButton>

          <ListItemButton onClick={() => setSelectedView("settings")}>
            <SettingsIcon sx={{ mr: 2 }} />
            <ListItemText primary="Settings" />
          </ListItemButton>
        </List>
      </Drawer>

     <Box
  component="main"
  sx={{
    flexGrow: 1,
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  }}
>
  <Toolbar />
  <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
    {selectedView === "home" && (
      <Typography>Welcome to the Home View</Typography>
    )}
    {selectedView === "viewer" && <IFCViewer />}
    {selectedView === "settings" && (<Typography> Settings</Typography>)}
   {selectedView === "sensors" && (
  <Box sx={{ padding: 3 }}>
    <Typography variant="h5" gutterBottom>
      Sensor Data
    </Typography>

    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Sensor Name</TableCell>
            <TableCell>Channel ID</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensorData.map((sensor) => (
            <TableRow key={`${sensor.sensor_name}-${sensor.channel_id}`}>
              <TableCell>{sensor.sensor_name}</TableCell>
              <TableCell>{sensor.channel_id}</TableCell>
              <TableCell>{sensor.value}</TableCell>
              <TableCell>{new Date(sensor.time).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)}

  </Box>
</Box>
    </Box>
  );
};

export default Dashboard;
