import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";
import axios from "axios";


const IFCViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const [guid, setGuid] = useState("");
  const [ sensorValues, setSensorValues] = useState({});
  const [selectedProps, setSelectedProps] = useState<{
        Class?: string;
        GlobalId?: string;
        Name?: string;
        Description?: string;
        LongName?: string;
        InteriorOrExteriorSpace?: string;
      } | null>(null);


const fetchInfo = async () => {
  if (!guid) return;

  try {
    const response = await axios.get("http://localhost:8000/sensorData", {
      params: { guid }
    });
    setSensorValues(response.data.sensors || {});
    console.log("Fetched sensor bundle:", response.data.sensors);
  } catch (error) {
    console.error("Error fetching sensor bundle:", error);
  }
};


  useEffect(() => {
    async function init() {
      if (!containerRef.current || !uiRef.current) return;


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

      //const fragments = components.get(OBC.FragmentsManager);
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
        console.log("[IFCViewer] Indexing relations...");
        await indexer.process(model);
        console.log("[IFCViewer] Indexing complete.");


        const highlighter = components.get(OBCF.Highlighter);
        highlighter.setup({ world });



        highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
          console.log("[IFCViewer] Highlighted:", fragmentIdMap);


          for (const [modelID, set] of Object.entries(fragmentIdMap)) {
  for (const id of set) {
    const props = await model.getProperties(Number(id));
    console.log("IFC Props:", props);

    if (props) {
      setGuid(props.GlobalId?.value);

      setSelectedProps({
        Class: props.type,
        GlobalId: props.GlobalId?.value,
        Name: props.Name?.value,
        Description: props.Description?.value || "N/A",
        LongName: props.LongName?.value,
        InteriorOrExteriorSpace: props.InteriorOrExteriorSpace?.value,
      });
    }
  }
}
        });

        

        highlighter.events.select.onClear.add(() => {
          console.log("[IFCViewer] Selection cleared.");
        });

      }

      await loadIfc();

      return () => {
        components.dispose();
      };
    }

    init();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        ref={uiRef}
        style={{
          width: "25rem",
          overflow: "auto",
          padding: "1rem",
          borderRight: "1px solid #ddd",
        }}
      />
      <div
        ref={containerRef}
        
        style={{ flex: 1, height: "100vh", position: "relative" }}
      />
      {selectedProps && (
  <div style={{ padding: "1rem", maxWidth: "600px" }}>
    <h2>Selected Element Properties</h2>
     <button onClick={fetchInfo} style={{ marginBottom: "1rem" }}>
      Fetch Info from Backend
    </button>   
    <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr><th>Attribute</th><th>Value</th></tr>
        <tr><td>Class</td><td>{selectedProps.Class}</td></tr>
        <tr><td>GlobalId</td><td>{selectedProps.GlobalId}</td></tr>
        <tr><td>Name</td><td>{selectedProps.Name}</td></tr>
        <tr><td>Description</td><td>{selectedProps.Description}</td></tr>
        <tr><td>LongName</td><td>{selectedProps.LongName}</td></tr>
        <tr><td>InteriorOrExteriorSpace</td><td>{selectedProps.InteriorOrExteriorSpace}</td></tr>
      </tbody>
    </table>
  </div>
)}

    </div>
  );
};

export default IFCViewer;
