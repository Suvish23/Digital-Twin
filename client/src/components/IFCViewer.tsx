import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const IFCViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [guid, setGuid] = useState("");
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity" | "pressure">("temperature");

  const [sensorData, setSensorData] = useState({
    temperature: [],
    humidity: [],
    pressure: [],
  });

  const [hasData, setHasData] = useState(false);

  const [selectedProps, setSelectedProps] = useState<{
    Class?: string;
    GlobalId?: string;
    Name?: string;
  } | null>(null);

  const fetchInfo = async () => {
  if (!guid) return;

  try {
    const response = await axios.get("http://localhost:8000/sensorData", { params: { guid } });

    const sensors = response.data.sensors || {
      temperature: [],
      humidity: [],
      pressure: [],
    };

    const hasAnyData =
      sensors.temperature.length > 0 ||
      sensors.humidity.length > 0 ||
      sensors.pressure.length > 0;

    setSensorData(sensors);
    setHasData(hasAnyData);

    console.log("Fetched sensor bundle:", sensors);
    console.log("hasAnyData =", hasAnyData); 

    if (!hasAnyData) {
      alert("There is no data to plot.");
    }
  } catch (error) {
    console.error("Error fetching sensor bundle:", error);
    setHasData(false);
  }
};


  useEffect(() => {
    async function init() {
      if (!containerRef.current) return;

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      const components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);

      const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >();

      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
      world.camera = new OBC.SimpleCamera(components);
      world.camera.controls.connect(world.renderer.three.domElement);
      world.scene.setup();
      world.scene.three.background = null;
      world.camera.controls.setLookAt(10, 6, 8, 0, 0, -10);

      await components.init();

      const grids = components.get(OBC.Grids);
      grids.create(world);

      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({
        wasm: {
          path: "/web-ifc/",
          absolute: false,
        },
      });

      const excluded = [
        WEBIFC.IFCTENDONANCHOR,
        WEBIFC.IFCREINFORCINGBAR,
        WEBIFC.IFCREINFORCINGELEMENT,
      ];
      for (const cat of excluded) {
        ifcLoader.settings.excludedCategories.add(cat);
      }
      ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

      async function loadIfc() {
        const response = await fetch("/assets/my-model.ifc");
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const model = await ifcLoader.load(buffer);
        model.name = "example";
        world.scene.three.add(model);

        const indexer = components.get(OBC.IfcRelationsIndexer);
        await indexer.process(model);

        const highlighter = components.get(OBCF.Highlighter);
        highlighter.setup({ world });

        highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
          for (const [modelID, set] of Object.entries(fragmentIdMap)) {
            for (const id of set) {
              const props = await model.getProperties(Number(id));
              if (props) {
                setSensorData({
                  temperature: [],
                  humidity: [],
                  pressure: [],
                });
                console.log("Check the Model Id : ",modelID);
                setHasData(false);
                setActiveTab("temperature");
                setGuid(props.GlobalId?.value);
                setSelectedProps({
                  Class: props.type,
                  GlobalId: props.GlobalId?.value,
                  Name: props.Name?.value,
                });
              }
            }
          }
        });
      }

      await loadIfc();

      return () => {
        components.dispose();
      };
    }

    init();
  }, []);

  const renderChart = (type: "temperature" | "humidity" | "pressure") => {
    let color = "";
    let name = "";
    let yDomain: [number, number] | undefined = undefined;

    switch (type) {
      case "temperature":
        color = "#ff7300";
        name = "Temperature (°C)";
        break;
      case "humidity":
        color = "#387908";
        name = "Humidity (%)";
        yDomain = [0, 100];
        break;
      case "pressure":
        color = "#8884d8";
        name = "Pressure (hPa)";
        break;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sensorData[type]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={(tick) => tick.slice(11, 16)} />
          <YAxis domain={yDomain} />
          <Tooltip labelFormatter={(label) => `Time: ${label}`} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke={color} name={name} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      />

      <div
        style={{
          width: "400px",
          padding: "1rem",
          overflowY: "auto",
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          borderLeft: "1px solid #ddd",
        }}
      >
        {!selectedProps ? (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            Please select a fragment in the model to view its properties.
          </div>
        ) : (
          <>
            <h2>Selected Element Properties</h2>
            <button
              onClick={fetchInfo}
              style={{
                marginBottom: "1rem",
                padding: "0.5rem 1rem",
                border: "1px solid #888",
                background: "#f0f0f0",
                cursor: "pointer",
              }}
            >
              Fetch Info from Backend
          
            </button>
          

            <table
              border={1}
              cellPadding={8}
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <th>Attribute</th>
                  <th>Value</th>
                </tr>
                <tr>
                  <td>Class</td>
                  <td>{selectedProps.Class}</td>
                </tr>
                <tr>
                  <td>GlobalId</td>
                  <td>{selectedProps.GlobalId}</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>{selectedProps.Name}</td>
                </tr>
              </tbody>
            </table>

            {hasData && (
              <div style={{ marginTop: "2rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  {["temperature", "humidity", "pressure"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveTab(type as any)}
                      style={{
                        marginRight: "1rem",
                        backgroundColor: activeTab === type ? "#ccc" : "transparent",
                        border: "1px solid #999",
                        padding: "0.3rem 0.6rem",
                      }}
                    >
                      {type[0].toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                  
                </div>

                {renderChart(activeTab)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IFCViewer;
