import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authContext/AuthContext";
import { useNavigate } from "react-router-dom";

interface DataResponse {
  data?: string;
  detail?: string;
}

const Dashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState<DataResponse | string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
    
      setData("Unauthorized");
      return;
    }
        console.log("came here for checking ")
    axios
      .get("http://localhost:8000/protected", {
        params: { token },  
      })
      .then((response) => 
        setData(response.data))
      .catch(() => setData("Unauthorized"));
  }, [token]);

  return (
    <div>
      <h2>Dashboard (Protected)</h2>
      <p>{JSON.stringify(data)}</p>
       <button onClick={() => navigate("/ifc-viewer")}>Open IFC Viewer</button>
    </div>
  );
};

export default Dashboard;
