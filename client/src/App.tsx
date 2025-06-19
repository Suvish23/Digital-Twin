import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./authContext/AuthContext";
import Login from "./routes/Login";
import ProtectedRoutes from "./routes/ProtectedRoutes";

function App() {
  return (
    <AuthProvider>
      <Router>
       <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
